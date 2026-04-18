package com.example.cibercheck.entity

data class Curso(
    val periodoId: String,
    val nombre: String?,
    val tiempo: String?,
    val status: CursoStatus,
    val startTime: String?,
    val endTime: String?,
    val topic: String?
)
