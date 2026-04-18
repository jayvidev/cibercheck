package com.example.cibercheck.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.cibercheck.R
import com.example.cibercheck.dto.session.StudentAttendanceDto

class HistorialAdapter(
    private var items: List<StudentAttendanceDto> = emptyList()
) : RecyclerView.Adapter<HistorialAdapter.HistorialViewHolder>() {

    class HistorialViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val context: Context = itemView.context
        private val tvCurso: TextView = itemView.findViewById(R.id.tv_nombreCursoItem)
        private val tvSesion: TextView = itemView.findViewById(R.id.tv_nombreSesion)
        private val tvFecha: TextView = itemView.findViewById(R.id.tv_fecha)
        private val tvHora: TextView = itemView.findViewById(R.id.tv_hora)
        private val tvEstado: TextView = itemView.findViewById(R.id.tvEstado)

        fun bind(item: StudentAttendanceDto) {
            tvCurso.text = item.courseName
            tvSesion.text = item.sessionName
            tvFecha.text = item.sessionDate

            val startTime = item.startTime ?: context.getString(R.string.time_undefined)
            val endTime = item.endTime ?: context.getString(R.string.time_undefined)
            tvHora.text = context.getString(R.string.time_range, startTime, endTime)

            tvEstado.text = when (item.status.lowercase()) {
                "presente" -> context.getString(R.string.status_present)
                "ausente" -> context.getString(R.string.status_absent)
                "tarde" -> context.getString(R.string.status_late)
                else -> item.status
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistorialViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_historial, parent, false)
        return HistorialViewHolder(view)
    }

    override fun onBindViewHolder(holder: HistorialViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    fun updateList(newItems: List<StudentAttendanceDto>) {
        items = newItems
        notifyDataSetChanged()
    }
}
