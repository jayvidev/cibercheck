package com.example.cibercheck.activity

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.lifecycle.lifecycleScope
import com.example.cibercheck.R
import com.example.cibercheck.databinding.ActivityProfileBinding
import com.example.cibercheck.entity.User
import com.example.cibercheck.service.RetrofitClient
import kotlinx.coroutines.launch

class MiPerfilActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
        preloadFromCache()
        loadUserProfileData()
    }

    private fun setupListeners() {
        binding.tbMiperfil.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.tvAppName.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        val sharedPreferences = getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
        val swHuella = binding.swHuella

        swHuella.isChecked = sharedPreferences.getBoolean("FINGERPRINT_ENABLED", false)

        swHuella.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                val token = sharedPreferences.getString("AUTH_TOKEN", null)
                if (!token.isNullOrEmpty()) {
                    sharedPreferences.edit { putBoolean("FINGERPRINT_ENABLED", true) }
                    Toast.makeText(
                        this,
                        getString(R.string.fingerprint_activated),
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    Toast.makeText(
                        this,
                        getString(R.string.fingerprint_login_required),
                        Toast.LENGTH_LONG
                    ).show()
                    swHuella.isChecked = false
                }
            } else {
                sharedPreferences.edit { putBoolean("FINGERPRINT_ENABLED", false) }
                Toast.makeText(
                    this,
                    getString(R.string.fingerprint_deactivated),
                    Toast.LENGTH_SHORT
                ).show()
            }
        }

        binding.btnCerrarSesion.setOnClickListener {
            sharedPreferences.edit {
                remove("AUTH_TOKEN")
                    .remove("USER_EMAIL")
                    .remove("STUDENT_ID")
                    .remove("FINGERPRINT_ENABLED")
            }
            Toast.makeText(this, getString(R.string.session_closed_success), Toast.LENGTH_SHORT)
                .show()
            val intent = Intent(this, LoginEmailActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    private fun preloadFromCache() {
        val sp = getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
        val cachedName = sp.getString("USER_NAME", null)
        val cachedEmail = sp.getString("USER_EMAIL", null)

        cachedName?.let { binding.tvNombreUsuario.text = it }
        cachedEmail?.let { binding.tvCorreoUsuario.text = it }
    }

    private fun loadUserProfileData() {
        val sharedPreferences = getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
        val userEmail = sharedPreferences.getString("USER_EMAIL", null)

        if (userEmail == null) {
            Toast.makeText(this, getString(R.string.error_email_not_found), Toast.LENGTH_LONG)
                .show()
            return
        }

        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getInstance(applicationContext).getUsers()

                if (response.isSuccessful) {
                    val currentUser =
                        response.body()?.find { user: User -> user.email == userEmail }

                    if (currentUser != null) {
                        updateUIwUser(currentUser)
                    } else {
                        Toast.makeText(
                            this@MiPerfilActivity,
                            getString(R.string.error_user_not_found),
                            Toast.LENGTH_LONG
                        ).show()
                    }
                } else {
                    Toast.makeText(
                        this@MiPerfilActivity,
                        getString(R.string.error_loading_data, response.message()),
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@MiPerfilActivity,
                    getString(R.string.error_connection, e.message),
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun updateUIwUser(user: User) {
        val fullName = "${user.firstName} ${user.lastName}".trim()
        binding.tvNombreUsuario.text = fullName
        binding.tvCorreoUsuario.text = user.email

        getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
            .edit {
                putString("USER_NAME", fullName)
            }
    }
}