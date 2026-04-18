package com.example.cibercheck.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.cibercheck.R
import com.example.cibercheck.databinding.ActivityLoginEmailBinding
import com.example.cibercheck.service.RetrofitClient
import kotlinx.coroutines.launch
import org.json.JSONObject

class LoginEmailActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginEmailBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val sharedPreferences = getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
        val token = sharedPreferences.getString("AUTH_TOKEN", null)

        if (!token.isNullOrEmpty()) {
            val intent = Intent(this, MisClasesActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
            return
        }

        binding = ActivityLoginEmailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSiguiente.setOnClickListener {
            val inputCode = binding.etCorreo.text.toString().trim()
            if (inputCode.isEmpty()) {
                binding.etCorreo.error = getString(R.string.error_enter_user_code)
                return@setOnClickListener
            }

            val emailSuffix = getString(R.string.email_suffix)
            val fullEmail = inputCode + emailSuffix

            enviarCodigoApi(fullEmail)
        }
    }

    private fun enviarCodigoApi(email: String) {
        val body = mapOf("email" to email)

        lifecycleScope.launch {
            try {
                Log.d("API_RESPONSE", "Sending request with body: $email")

                val response = RetrofitClient.getInstance(applicationContext).generateOtp(body)

                Log.d("API_RESPONSE", response.toString())

                if (response.isSuccessful) {

                    Toast.makeText(
                        this@LoginEmailActivity,
                        getString(R.string.login_otp_code),
                        Toast.LENGTH_LONG
                    ).show()

                    val intent =
                        Intent(this@LoginEmailActivity, VerificationCodeActivity::class.java)
                    intent.putExtra("EMAIL", email)
                    startActivity(intent)
                } else {
                    val defaultError = getString(R.string.error_unknown_server)
                    var errorMessage = defaultError
                    try {
                        val errorBody = response.errorBody()?.string()
                        if (errorBody != null) {
                            val jsonObject = JSONObject(errorBody)
                            errorMessage =
                                jsonObject.optString("message", defaultError)
                        }
                    } catch (_: Exception) {
                    }
                    Toast.makeText(this@LoginEmailActivity, errorMessage, Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@LoginEmailActivity,
                    getString(R.string.error_connection, e.message),
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}
