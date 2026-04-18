package com.example.cibercheck.activity

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.cibercheck.R
import com.example.cibercheck.adapter.CursoAdapter
import com.example.cibercheck.databinding.MisclasesMainPageBinding
import com.example.cibercheck.dto.session.StudentDailyCourseDto
import com.example.cibercheck.entity.Curso
import com.example.cibercheck.entity.CursoStatus
import com.example.cibercheck.service.RetrofitClient
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.launch
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

class MisClasesActivity : AppCompatActivity() {

    private lateinit var binding: MisclasesMainPageBinding
    private lateinit var adpCursos: CursoAdapter
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    companion object {
        private const val CIBERTEC_LAT = -12.0540
        private const val CIBERTEC_LNG = -77.0409
        private const val RADIO_PERMITIDO = 70.0
    }

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            if (isGranted) {
                obtenerUbicacionYContinuar()
            } else {
                Toast.makeText(
                    this,
                    "Permiso de ubicación necesario para marcar asistencia",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

    private val qrScanLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val sessionId = data?.getIntExtra("attendance_sessionId", -1) ?: -1
            val status = data?.getStringExtra("attendance_status") ?: "presente"

            if (sessionId > 0) {
                Log.d(
                    "QR_RESULT",
                    "Asistencia marcada exitosamente: sessionId=$sessionId, status=$status"
                )

                loadCursosAfterScan()
            } else {
                Log.w("QR_RESULT", "Resultado OK pero sessionId inválido: $sessionId")
                Toast.makeText(
                    this,
                    getString(R.string.error_processing_attendance),
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = MisclasesMainPageBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        setupUI()
        loadInitialData()
    }

    private fun setupUI() {
        binding.tbMisClases.setOnMenuItemClickListener {
            if (it.itemId == R.id.action_profile) {
                startActivity(Intent(this, MiPerfilActivity::class.java))
                true
            } else false
        }

        binding.tvPerfilLink.setOnClickListener {
            startActivity(Intent(this, MiPerfilActivity::class.java))
        }

        binding.rvMisClases.layoutManager = LinearLayoutManager(this)
        adpCursos = CursoAdapter(mutableListOf())
        binding.rvMisClases.adapter = adpCursos

        binding.btnHistorial.setOnClickListener {
            startActivity(Intent(this, HistorialAsistenciasActivity::class.java))
        }

        binding.btnMarcarAsistencia.setOnClickListener {
            verificarPermisosYObtenerUbicacion()
        }
    }

    private fun loadInitialData() {
        val sharedPref = getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
        val studentId = sharedPref.getInt("STUDENT_ID", -1)
        val jwtToken = sharedPref.getString("AUTH_TOKEN", "")

        Log.d("AUTH_TOKEN", jwtToken?.take(10) + "...")

        if (studentId != -1 && !jwtToken.isNullOrEmpty()) {
            Log.d("ENTRA", "  ACA  $studentId---")
            loadCursosFromApi()
        } else {
            Log.e("SESSION_ERROR", "No hay sesión iniciada correctamente")
        }
    }

    private fun verificarPermisosYObtenerUbicacion() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED -> {
                obtenerUbicacionYContinuar()
            }
            shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_FINE_LOCATION) -> {
                Toast.makeText(
                    this,
                    "Se requiere la ubicación para validar que estás en el instituto",
                    Toast.LENGTH_LONG
                ).show()
                requestPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            }

            else -> {
                requestPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
            }
        }
    }

    private fun obtenerUbicacionYContinuar() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location: Location? ->
                if (location != null) {
                    val distancia = FloatArray(1)
                    Location.distanceBetween(
                        location.latitude, location.longitude,
                        CIBERTEC_LAT, CIBERTEC_LNG,
                        distancia
                    )

                    if (distancia[0] <= RADIO_PERMITIDO) {
                        Log.d("LOCATION_CHECK", "Usuario dentro del rango. Distancia: ${distancia[0]} metros.")
                        val intent = Intent(this, ScanQRActivity::class.java)
                        qrScanLauncher.launch(intent)
                    } else {
                        Log.d("LOCATION_CHECK", "Usuario fuera del rango. Distancia: ${distancia[0]} metros.")
                        Toast.makeText(
                            this,
                            "No te encuentras dentro del instituto.",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                } else {
                    Toast.makeText(
                        this,
                        "No se pudo obtener la ubicación. Activa el GPS.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
            .addOnFailureListener { e ->
                Log.e("LOCATION_ERROR", "Error al obtener la ubicación", e)
                Toast.makeText(this, "Error al obtener la ubicación.", Toast.LENGTH_SHORT).show()
            }
    }

    private fun loadCursosAfterScan() {
        val sharedPref = getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
        val studentId = sharedPref.getInt("STUDENT_ID", -1)
        if (studentId != -1) {
            loadCursosFromApi()
        }
    }

    private fun loadCursosFromApi() {
        lifecycleScope.launch {
            try {
                val date: String? = null
                val response =
                    RetrofitClient.getInstance(applicationContext).getStudentDailySessions(date)

                if (response.isSuccessful) {
                    val sessions: List<StudentDailyCourseDto> = response.body() ?: emptyList()

                    val ahora = LocalTime.now()
                    Log.d("TIME_DEBUG", "--- Hora actual del dispositivo: $ahora ---")

                    val cursos = sessions.map { sessionDto ->
                        if (sessionDto.startTime == null || sessionDto.endTime == null) {
                            return@map Curso(
                                periodoId = sessionDto.sectionName,
                                nombre = sessionDto.courseName,
                                tiempo = getString(R.string.schedule_not_defined),
                                status = CursoStatus.UPCOMING,
                                startTime = null,
                                endTime = null,
                                topic = sessionDto.topic
                            )
                        }

                        val horaInicio = LocalTime.parse(sessionDto.startTime)
                        val horaFin = LocalTime.parse(sessionDto.endTime)
                        Log.d(
                            "TIME_DEBUG",
                            "Curso: '${sessionDto.courseName}' | Inicio: $horaInicio | Fin: $horaFin"
                        )

                        val minutosParaEmpezar = ChronoUnit.MINUTES.between(ahora, horaInicio)

                        val (status, textoTiempo) = when {
                            ahora.isAfter(horaInicio) && ahora.isBefore(horaFin) -> {
                                Pair(
                                    CursoStatus.IN_PROGRESS,
                                    getString(
                                        R.string.time_range,
                                        formatAmPm(sessionDto.startTime),
                                        formatAmPm(sessionDto.endTime)
                                    )
                                )
                            }

                            ahora.isBefore(horaInicio) && minutosParaEmpezar in 0..10 -> {
                                Pair(
                                    CursoStatus.STARTING_SOON,
                                    getString(R.string.starts_in_minutes, minutosParaEmpezar)
                                )
                            }

                            ahora.isAfter(horaFin) -> {
                                Pair(
                                    CursoStatus.FINISHED,
                                    getString(
                                        R.string.time_range,
                                        formatAmPm(sessionDto.startTime),
                                        formatAmPm(sessionDto.endTime)
                                    )
                                )
                            }

                            else -> {
                                Pair(
                                    CursoStatus.UPCOMING,
                                    getString(
                                        R.string.time_range,
                                        formatAmPm(sessionDto.startTime), // <--- CAMBIO
                                        formatAmPm(sessionDto.endTime)
                                    )
                                )
                            }
                        }

                        Curso(
                            //periodoId = sessionDto.sectionName,
                            periodoId = sessionDto.courseName,
                            nombre = sessionDto.topic,
                            tiempo = textoTiempo,
                            status = status,
                            startTime = sessionDto.startTime,
                            endTime = sessionDto.endTime,
                            topic = sessionDto.topic
                        )
                    }

                    val sortedCursos = cursos.sortedWith(
                        compareBy({ it.status.priority }, { it.tiempo })
                    )

                    adpCursos.replaceAll(sortedCursos)

                } else {
                    Log.e("API_ERROR", "Error: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("NETWORK_ERROR", "Exception: ${e.message}")
                e.printStackTrace()
            }
        }
    }

    private fun formatAmPm(timeString: String): String {
        return try {
            val localTime = LocalTime.parse(timeString)
            val formatter = DateTimeFormatter.ofPattern("hh:mm a")
            localTime.format(formatter)
        } catch (e: Exception) {
            timeString
        }
    }
}