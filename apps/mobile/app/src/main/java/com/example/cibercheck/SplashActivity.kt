package com.example.cibercheck

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.example.cibercheck.activity.LoginEmailActivity
import com.example.cibercheck.activity.SecurityCheckActivity

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)

        val intent = determineNextActivity()
        startActivity(intent)
        finish()
    }

    private fun determineNextActivity(): Intent {
        val sharedPreferences = getSharedPreferences("CiberCheckPrefs", Context.MODE_PRIVATE)
        val isFingerprintEnabled = sharedPreferences.getBoolean("FINGERPRINT_ENABLED", false)

        return if (isFingerprintEnabled) {
            Intent(this, SecurityCheckActivity::class.java)
        } else {
            Intent(this, LoginEmailActivity::class.java)
        }
    }
}
