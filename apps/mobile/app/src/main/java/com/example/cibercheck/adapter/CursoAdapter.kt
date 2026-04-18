package com.example.cibercheck.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.cibercheck.R
import com.example.cibercheck.entity.Curso
import com.example.cibercheck.entity.CursoStatus

class CursoAdapter(
    private val items: MutableList<Curso>
) : RecyclerView.Adapter<CursoAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        private val context: Context = v.context
        val txtCodigo: TextView = v.findViewById(R.id.txtCodigoPeriodo)
        val txtNombre: TextView = v.findViewById(R.id.txtNombreCurso)
        val txtEstado: TextView = v.findViewById(R.id.txtEstado)

        fun bind(curso: Curso) {
            txtCodigo.text = curso.periodoId
            txtNombre.text = curso.nombre

            val (textResId, colorResId) = when (curso.status) {
                CursoStatus.IN_PROGRESS -> Pair(R.string.status_in_progress, R.color.state_ok)
                CursoStatus.STARTING_SOON -> Pair(R.string.status_starting_soon, R.color.state_warning)
                CursoStatus.UPCOMING -> Pair(R.string.status_upcoming, R.color.primary)
                CursoStatus.FINISHED -> Pair(R.string.status_finished, R.color.neutral_medium)
            }

            txtEstado.text = context.getString(textResId, curso.tiempo)
            txtEstado.setTextColor(ContextCompat.getColor(context, colorResId))
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_curso, parent, false)
        return VH(v)
    }

    override fun getItemCount(): Int = items.size

    override fun onBindViewHolder(h: VH, position: Int) {
        h.bind(items[position])
    }

    fun replaceAll(list: List<Curso>) {
        items.clear()
        items.addAll(list)
        if (list.isNotEmpty()) {
            notifyItemRangeChanged(0, list.size)
        } else {
            notifyDataSetChanged()
        }
    }
}
