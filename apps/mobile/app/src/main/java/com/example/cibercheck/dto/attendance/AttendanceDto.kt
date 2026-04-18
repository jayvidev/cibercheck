package com.example.cibercheck.dto.attendance

data class AttendanceDto(
    val studentId: Int,
    val sessionId: Int,
    val status: String,
    val notes: String?
)
