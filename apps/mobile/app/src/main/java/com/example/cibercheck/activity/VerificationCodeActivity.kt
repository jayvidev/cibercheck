package com.example.cibercheck.activity

import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.KeyEvent
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.lifecycle.lifecycleScope
import com.example.cibercheck.R
import com.example.cibercheck.databinding.ActivityVerificationCodeBinding
import com.example.cibercheck.service.RetrofitClient
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.launch
import org.json.JSONObject

class VerificationCodeActivity : AppCompatActivity() {

    private lateinit var binding: ActivityVerificationCodeBinding
    private lateinit var email: String
    private var isVerifying = false
    private var resendTimer: CountDownTimer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVerificationCodeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        email = intent.getStringExtra("EMAIL") ?: ""
        if (email.isEmpty()) {
            Toast.makeText(this, getString(R.string.error_empty_email), Toast.LENGTH_LONG).show()
            finish()
            return
        }

        binding.tvCorreo.text = email
        binding.btnVolver.setOnClickListener { finish() }

        binding.btnNoRecibi.setOnClickListener {
            binding.btnNoRecibi.isEnabled = false
            reenviarCodigo(email)
        }

        setupOtpInputs()
    }

    private fun reenviarCodigo(email: String) {
        lifecycleScope.launch {
            try {
                val body = mapOf("email" to email)
                val response = RetrofitClient.getInstance(applicationContext).generateOtp(body)

                if (response.isSuccessful) {
                    Toast.makeText(this@VerificationCodeActivity, getString(R.string.login_otp_code_resend), Toast.LENGTH_LONG).show()
                    iniciarTemporizador()
                } else {
                    Toast.makeText(this@VerificationCodeActivity, R.string.error_sending_code, Toast.LENGTH_SHORT).show()
                    binding.btnNoRecibi.isEnabled = true
                }
            } catch (e: Exception) {
                Toast.makeText(this@VerificationCodeActivity, "Error de conexión: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.btnNoRecibi.isEnabled = true
            }
        }
    }

    private fun iniciarTemporizador() {
        resendTimer = object : CountDownTimer(60000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val secondsLeft = millisUntilFinished / 1000
                binding.btnNoRecibi.text = getString(R.string.btn_not_code_timer, secondsLeft)
            }

            override fun onFinish() {
                binding.btnNoRecibi.text = getString(R.string.btn_not_code)
                binding.btnNoRecibi.isEnabled = true
            }
        }.start()
    }

    private fun setupOtpInputs() {
        val editTexts = with(binding) { arrayOf(et1, et2, et3, et4, et5, et6) }
        for (i in editTexts.indices) {
            editTexts[i].addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    s: CharSequence?,
                    start: Int,
                    count: Int,
                    after: Int
                ) {
                }

                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    if (s?.length == 1 && i < editTexts.size - 1) {
                        editTexts[i + 1].requestFocus()
                    }
                    if (editTexts.all { it.text.length == 1 }) {
                        val codigo = editTexts.joinToString("") { it.text.toString() }
                        verificarCodigoApi(email, codigo)
                    }
                }
            })
            editTexts[i].setOnKeyListener { _, keyCode, event ->
                if (event.action == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_DEL) {
                    if (editTexts[i].text.toString().isEmpty() && i != 0) {
                        editTexts[i - 1].requestFocus()
                    }
                }
                false
            }
        }
    }

    private fun verificarCodigoApi(email: String, codigo: String) {
        if (isVerifying) return
        isVerifying = true

        val body = mapOf("email" to email, "codigo" to codigo)

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getInstance(applicationContext).verifyOtp(body)

                if (response.isSuccessful) {
                    val data = response.body()
                    val token = data?.get("token")?.trim().orEmpty()
                    val studentId = data?.get("studentId")?.trim()?.toIntOrNull()



                    if (token.isNotEmpty() && studentId != null) {
                        val sharedPreferences =
                            getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)

                        lifecycleScope.launch {
                            try {
                                val usersResp =
                                    RetrofitClient.getInstance(applicationContext).getUsers()
                                if (usersResp.isSuccessful) {
                                    val me = usersResp.body()?.find { it.email == email }
                                    me?.let {
                                        val fullName = "${it.firstName} ${it.lastName}".trim()
                                        sharedPreferences.edit { putString("USER_NAME", fullName) }
                                    }
                                }
                            } catch (_: Exception) {
                            }
                        }

                        sharedPreferences.edit().apply {
                            putString("AUTH_TOKEN", token)
                            putString("USER_EMAIL", email)
                            putInt("STUDENT_ID", studentId)
                            apply()
                        }

                        guardarLogFirebase(email)
                        Toast.makeText(
                            this@VerificationCodeActivity,
                            getString(R.string.verification_complete),
                            Toast.LENGTH_SHORT
                        ).show()

                        val intent =
                            Intent(this@VerificationCodeActivity, MisClasesActivity::class.java)
                        intent.flags =
                            Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK

                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(
                            this@VerificationCodeActivity,
                            getString(R.string.error_verification_server),
                            Toast.LENGTH_SHORT
                        ).show()
                        clearOtpInputs()
                    }
                } else {
                    var errorMessage = getString(R.string.error_expired_code)
                    try {
                        val errorBody = response.errorBody()?.string()
                        if (errorBody != null) {
                            errorMessage = JSONObject(errorBody).optString("message", errorMessage)
                        }
                    } catch (_: Exception) {
                    }
                    Toast.makeText(this@VerificationCodeActivity, errorMessage, Toast.LENGTH_SHORT)
                        .show()
                    clearOtpInputs()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@VerificationCodeActivity,
                    getString(R.string.error_connection_code),
                    Toast.LENGTH_SHORT
                ).show()
                e.printStackTrace()
            } finally {
                isVerifying = false
            }
        }
    }

    private fun guardarLogFirebase(email: String) {
        val db = FirebaseFirestore.getInstance()
        val logsRef = db.collection("login_logs")
        val log = hashMapOf(
            "email" to email,
            "fecha" to FieldValue.serverTimestamp(),
            "estado" to "ingresado"
        )
        logsRef.add(log)
            .addOnSuccessListener { documentReference ->
                Log.d(
                    "Firestore",
                    getString(R.string.log_save_success, documentReference.id)
                )
            }
            .addOnFailureListener { e -> Log.e("Firestore", getString(R.string.error_log), e) }
    }

    private fun clearOtpInputs() {
        val editTexts = with(binding) { arrayOf(et1, et2, et3, et4, et5, et6) }
        editTexts.forEach { it.text.clear() }
        binding.et1.requestFocus()
    }

    override fun onDestroy() {
        super.onDestroy()
        resendTimer?.cancel()
    }
}
