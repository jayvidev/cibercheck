package com.example.cibercheck.dto.session

import com.google.gson.annotations.SerializedName

data class StudentAttendanceDto(
    @SerializedName("courseName") val courseName: String,
    @SerializedName("sectionName") val sectionName: String,
    @SerializedName("sessionName") val sessionName: String,
    @SerializedName("sessionDate") val sessionDate: String,
    @SerializedName("startTime") val startTime: String?,
    @SerializedName("endTime") val endTime: String?,
    @SerializedName("status") val status: String
)
