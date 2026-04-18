package com.example.cibercheck.activity

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.ImageFormat
import android.graphics.YuvImage
import android.os.Bundle
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.cibercheck.R
import com.example.cibercheck.databinding.ActivityScanQrBinding
import com.example.cibercheck.dto.attendance.AttendanceByQrRequest
import com.example.cibercheck.service.RetrofitClient
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.atomic.AtomicBoolean

class ScanQRActivity : AppCompatActivity() {

    private lateinit var binding: ActivityScanQrBinding
    private var camera: Camera? = null
    private var flashOn = false
    private var processing = AtomicBoolean(false)
    private var cameraProvider: ProcessCameraProvider? = null

    private val cameraPermission = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) startCamera() else finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityScanQrBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED
        ) {
            startCamera()
        } else {
            cameraPermission.launch(Manifest.permission.CAMERA)
        }

        binding.tbScanQr.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.tbScanQr.findViewById<TextView>(R.id.tvAppName)?.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.btnFlash.setOnClickListener {
            flashOn = !flashOn

            camera?.cameraControl?.enableTorch(flashOn)

            val flashTextResId = if (flashOn) R.string.flash_on else R.string.flash_off
            binding.btnFlash.text = getString(flashTextResId)
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(binding.previewView.surfaceProvider)
            }

            val analyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build().also { imageAnalysis ->
                    imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(this)) { imageProxy ->
                        processImageProxyStable(imageProxy, imageAnalysis)
                    }
                }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider?.unbindAll()
                camera = cameraProvider?.bindToLifecycle(
                    this, cameraSelector, preview, analyzer
                )
            } catch (e: Exception) {
                Log.e("ScanQR", "Error al iniciar la cámara", e)
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun processImageProxyStable(imageProxy: ImageProxy, analyzer: ImageAnalysis) {
        if (processing.get()) {
            imageProxy.close()
            return
        }

        try {
            val bitmap = imageProxyToBitmap(imageProxy)
            if (bitmap != null) {
                val image = InputImage.fromBitmap(bitmap, imageProxy.imageInfo.rotationDegrees)
                val scanner = BarcodeScanning.getClient()
                scanner.process(image)
                    .addOnSuccessListener { barcodes ->
                        for (barcode in barcodes) {
                            val value = barcode.rawValue
                            if (!value.isNullOrBlank() && processing.compareAndSet(false, true)) {
                                cameraProvider?.unbind(analyzer)
                                Log.d("ScanQR", "Código detectado y bloqueado para procesamiento: $value")
                                Toast.makeText(
                                    this@ScanQRActivity,
                                    getString(R.string.qr_process),
                                    Toast.LENGTH_SHORT
                                ).show()
                                showLoading(true)
                                submitAttendance(value)
                                break
                            }
                        }
                    }
                    .addOnFailureListener {
                        Log.e("ScanQR", "Error leyendo QR…", it)
                        Toast.makeText(
                            this@ScanQRActivity,
                            getString(R.string.error_qr_image),
                            Toast.LENGTH_SHORT
                        )
                            .show()
                    }
                    .addOnCompleteListener {
                        imageProxy.close()
                    }
            } else {
                imageProxy.close()
            }
        } catch (e: Exception) {
            Log.e("ScanQR", "Error procesando imagen", e)
            imageProxy.close()
        }
    }

    private fun imageProxyToBitmap(imageProxy: ImageProxy): Bitmap? {
        val yBuffer = imageProxy.planes[0].buffer
        val uBuffer = imageProxy.planes[1].buffer
        val vBuffer = imageProxy.planes[2].buffer

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)

        yBuffer.get(nv21, 0, ySize)
        vBuffer.get(nv21, ySize, vSize)
        uBuffer.get(nv21, ySize + vSize, uSize)

        val yuvImage = YuvImage(nv21, ImageFormat.NV21, imageProxy.width, imageProxy.height, null)
        val out = ByteArrayOutputStream()
        yuvImage.compressToJpeg(
            android.graphics.Rect(0, 0, imageProxy.width, imageProxy.height),
            100,
            out
        )
        val imageBytes = out.toByteArray()
        return android.graphics.BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
    }

    private fun submitAttendance(token: String) {
        val api = RetrofitClient.getInstance(this)
        lifecycleScope.launch {
            try {
                Log.d("ScanQR", "Enviando token al servidor: ${token.take(20)}...")
                Toast.makeText(
                    this@ScanQRActivity,
                    getString(R.string.qr_sending_attendance),
                    Toast.LENGTH_SHORT
                ).show()

                val response = withContext(Dispatchers.IO) {
                    api.markAttendanceByQr(AttendanceByQrRequest(token))
                }

                Log.d("ScanQR", "Response code: ${response.code()}")

                if (response.isSuccessful) {
                    val dto = response.body()
                    Log.d("ScanQR", "Respuesta exitosa, DTO: $dto")

                    if (dto != null && dto.sessionId > 0) {
                        Log.d(
                            "ScanQR",
                            "Asistencia marcada: sessionId=${dto.sessionId}, status=${dto.status}"
                        )
                        Toast.makeText(
                            this@ScanQRActivity,
                            getString(R.string.qr_attendance_marked_success, dto.status),
                            Toast.LENGTH_LONG
                        ).show()
                        val data = Intent().apply {
                            putExtra("attendance_sessionId", dto.sessionId)
                            putExtra("attendance_status", dto.status)
                        }
                        setResult(RESULT_OK, data)
                        finish()
                    } else {
                        Log.e("ScanQR", "DTO es null o sessionId inválido")
                        Toast.makeText(
                            this@ScanQRActivity,
                            getString(R.string.error_qr_invalid),
                            Toast.LENGTH_LONG
                        ).show()
                        processing.set(false)
                    }
                } else {
                    val msg = parseErrorMessage(
                        try {
                            response.errorBody()?.string()
                        } catch (_: Exception) {
                            null
                        }
                    )
                    Log.e("ScanQR", "Error ${response.code()}: $msg")
                    Toast.makeText(
                        this@ScanQRActivity,
                        getString(R.string.error_qr_generic, msg),
                        Toast.LENGTH_LONG
                    ).show()
                    processing.set(false)
                }
            } catch (e: Exception) {
                Log.e("ScanQR", "Error enviando asistencia por QR", e)
                e.printStackTrace()
                Toast.makeText(
                    this@ScanQRActivity,
                    getString(R.string.error_qr_connection, e.message),
                    Toast.LENGTH_LONG
                ).show()
                processing.set(false)
            } finally {
                showLoading(false)
                finish()
            }
        }
    }

    private fun parseErrorMessage(raw: String?): String? {
        if (raw.isNullOrBlank()) return null
        try {
            val obj = JSONObject(raw)
            if (obj.has("message")) return obj.getString("message")
            if (obj.has("errors")) {
                val errors = obj.getJSONObject("errors")
                val keys = errors.keys()
                if (keys.hasNext()) {
                    val firstKey = keys.next()
                    val arr = errors.optJSONArray(firstKey)
                    if (arr != null && arr.length() > 0) return arr.getString(0)
                }
            }
        } catch (_: Exception) {
        }
        return raw.take(200)
    }

    private fun showLoading(show: Boolean) {
        binding.progressOverlay.visibility =
            if (show) android.view.View.VISIBLE else android.view.View.GONE
    }
}
