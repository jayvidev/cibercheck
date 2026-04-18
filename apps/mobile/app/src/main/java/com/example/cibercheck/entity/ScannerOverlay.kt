package com.example.cibercheck.entity

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.example.cibercheck.R

class ScannerOverlay @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val backgroundPaint: Paint = Paint().apply {
        color = ContextCompat.getColor(context, R.color.qr_overlay_dark)
    }

    private val eraserPaint: Paint = Paint().apply {
        xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
    }

    private val strokePaint: Paint = Paint().apply {
        style = Paint.Style.STROKE
        color = ContextCompat.getColor(context, R.color.white_75)
        strokeWidth = resources.displayMetrics.density * 2 // 2dp
    }

    private val cornerRadius = resources.getDimension(R.dimen.corner_24)
    private lateinit var rect: RectF

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        val ratio = 0.70f
        val rectWidth = w * ratio
        val rectHeight = rectWidth
        val left = (w - rectWidth) / 2
        val top = (h - rectHeight) / 2
        rect = RectF(left, top, left + rectWidth, top + rectHeight)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), backgroundPaint)
        canvas.drawRoundRect(rect, cornerRadius, cornerRadius, eraserPaint)
        canvas.drawRoundRect(rect, cornerRadius, cornerRadius, strokePaint)
    }
}
