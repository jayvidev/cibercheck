package com.example.cibercheck.dto.session

import com.google.gson.annotations.SerializedName

data class StudentDailyCourseDto(

    @SerializedName("courseName")
    val courseName: String,

    @SerializedName("sectionName")
    val sectionName: String,

    @SerializedName("startTime")
    val startTime: String?,

    @SerializedName("endTime")
    val endTime: String?,

    @SerializedName("topic")
    val topic: String?
)