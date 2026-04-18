package com.example.cibercheck.activity

import android.app.DatePickerDialog
import android.os.Bundle
import android.util.Log
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.cibercheck.R
import com.example.cibercheck.adapter.HistorialAdapter
import com.example.cibercheck.databinding.ActivityHistorialAsistenciasBinding
import com.example.cibercheck.dto.session.StudentAttendanceDto
import com.example.cibercheck.service.RetrofitClient
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class HistorialAsistenciasActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHistorialAsistenciasBinding
    private lateinit var adapter: HistorialAdapter
    private var studentId: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHistorialAsistenciasBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupStudentId()
        setupRecycler()
        setupFilters()
        loadAttendanceHistory()
    }

    private fun setupStudentId() {
        val sharedPref = getSharedPreferences("CiberCheckPrefs", MODE_PRIVATE)
        studentId = sharedPref.getInt("STUDENT_ID", -1)

        if (studentId == -1) {
            Toast.makeText(this, getString(R.string.error_student_id_not_found), Toast.LENGTH_SHORT)
                .show()
            finish()
        }
    }

    private fun setupRecycler() {
        binding.tbHistorialDetalle.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.tvAppName.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        adapter = HistorialAdapter(emptyList())
        binding.rvHistorialDetalle.layoutManager = LinearLayoutManager(this)
        binding.rvHistorialDetalle.adapter = adapter
    }

    private fun setupFilters() {
        val estados = listOf("presente", "ausente", "tardanza")
        val estadoAdapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, estados)
        binding.etEstadoFiltro.setAdapter(estadoAdapter)

        binding.etFechaFiltro.setOnClickListener {
            if (!binding.etFechaFiltro.text.isNullOrEmpty()) {
                binding.etFechaFiltro.text?.clear()
            }

            val calendar = Calendar.getInstance()

            DatePickerDialog(
                this,
                { _, y, m, d ->
                    val selected = Calendar.getInstance()
                    selected.set(y, m, d)
                    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    binding.etFechaFiltro.setText(dateFormat.format(selected.time))
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            ).show()
        }

        binding.btnBuscar.setOnClickListener {
            val fecha = binding.etFechaFiltro.text.toString().trim()
            val estado = binding.etEstadoFiltro.text.toString().trim()

            when {
                fecha.isNotEmpty() && estado.isEmpty() -> filterByDate(fecha)
                fecha.isEmpty() && estado.isNotEmpty() -> filterByStatus(estado)
                fecha.isNotEmpty() && estado.isNotEmpty() -> filterCombined(fecha, estado)
                else -> loadAttendanceHistory()
            }
        }
    }

    private fun loadAttendanceHistory() {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getInstance(applicationContext)
                    .getStudentAttendanceHistory(studentId)

                if (response.isSuccessful) {
                    updateList(response.body())
                } else {
                    Toast.makeText(
                        this@HistorialAsistenciasActivity,
                        getString(R.string.error_history_loading),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (ex: Exception) {
                showNetworkError(ex)
            }
        }
    }

    private fun filterByDate(date: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getInstance(applicationContext)
                    .getHistoryByDate(studentId, date)

                if (response.isSuccessful) {
                    updateList(response.body())
                } else {
                    Toast.makeText(
                        this@HistorialAsistenciasActivity,
                        getString(R.string.error_no_records_for_date),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (ex: Exception) {
                showNetworkError(ex)
            }
        }
    }

    private fun filterByStatus(status: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getInstance(applicationContext)
                    .getHistoryByStatus(studentId, status)

                if (response.isSuccessful) {
                    updateList(response.body())
                } else {
                    Toast.makeText(
                        this@HistorialAsistenciasActivity,
                        getString(R.string.error_no_records_for_status),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (ex: Exception) {
                showNetworkError(ex)
            }
        }
    }

    private fun filterCombined(date: String, status: String) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.getInstance(applicationContext)
                    .filterHistory(studentId, date, status)

                if (response.isSuccessful) {
                    updateList(response.body())
                } else {
                    Toast.makeText(
                        this@HistorialAsistenciasActivity,
                        getString(R.string.error_no_results_found),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (ex: Exception) {
                showNetworkError(ex)
            }
        }
    }

    private fun updateList(historial: List<StudentAttendanceDto>?) {
        val lista = historial ?: emptyList()
        adapter.updateList(lista)

        if (lista.isEmpty()) {
            Toast.makeText(
                this,
                getString(R.string.error_no_records_found_generic),
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    private fun showNetworkError(ex: Exception) {
        Log.e("API_ERROR", ex.message.toString())
        ex.printStackTrace()
        Toast.makeText(this, getString(R.string.error_network, ex.message), Toast.LENGTH_SHORT)
            .show()
    }
}
