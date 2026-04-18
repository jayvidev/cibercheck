package com.example.cibercheck.service

import android.content.Context
import android.util.Log
import com.example.cibercheck.BuildConfig
import com.example.cibercheck.dto.attendance.AttendanceByQrRequest
import com.example.cibercheck.dto.attendance.AttendanceDto
import com.example.cibercheck.dto.session.StudentAttendanceDto
import com.example.cibercheck.dto.session.StudentDailyCourseDto
import com.example.cibercheck.entity.User
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    @GET("attendances/student/{studentId}/history/by-date")
    suspend fun getHistoryByDate(
        @Path("studentId") studentId: Int,
        @Query("date") date: String
    ): retrofit2.Response<List<StudentAttendanceDto>>

    @GET("attendances/student/{studentId}/history/by-status")
    suspend fun getHistoryByStatus(
        @Path("studentId") studentId: Int,
        @Query("status") status: String
    ): retrofit2.Response<List<StudentAttendanceDto>>

    @GET("attendances/student/{studentId}/history/filter")
    suspend fun filterHistory(
        @Path("studentId") studentId: Int,
        @Query("date") date: String?,
        @Query("status") status: String?
    ): retrofit2.Response<List<StudentAttendanceDto>>

    @GET("attendances/student/{studentId}/history")
    suspend fun getStudentAttendanceHistory(
        @Path("studentId") studentId: Int
    ): retrofit2.Response<List<StudentAttendanceDto>>

    @GET("attendance/by-date")
    suspend fun getAttendanceByDate(
        @Query("date") date: String
    ): retrofit2.Response<List<StudentAttendanceDto>>

    @POST("otps/generate-otp")
    suspend fun generateOtp(@Body body: Map<String, String>): retrofit2.Response<Map<String, String>>

    @POST("otps/verify-otp")
    suspend fun verifyOtp(@Body body: Map<String, String>): retrofit2.Response<Map<String, String>>

    @GET("sessions/student/day")
    suspend fun getStudentDailySessions(
        @Query("date") date: String?
    ): retrofit2.Response<List<StudentDailyCourseDto>>

    @GET("users")
    suspend fun getUsers(): retrofit2.Response<List<User>>

    @POST("attendances/qr/scan")
    suspend fun markAttendanceByQr(
        @Body body: AttendanceByQrRequest
    ): retrofit2.Response<AttendanceDto>
}

class AuthInterceptor(context: Context) : Interceptor {
    private val sharedPreferences =
        context.getSharedPreferences("CiberCheckPrefs", Context.MODE_PRIVATE)

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = sharedPreferences.getString("AUTH_TOKEN", null)
        val requestBuilder = chain.request().newBuilder()

        token?.let {
            Log.d("AuthInterceptor", "Token añadido: $it")
            requestBuilder.addHeader("Authorization", "Bearer $it")
        }

        return chain.proceed(requestBuilder.build())
    }
}

object RetrofitClient {
    private var apiService: ApiService? = null

    fun getInstance(context: Context): ApiService {
        if (apiService == null) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val authInterceptor = AuthInterceptor(context)

            val client = OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .addInterceptor(authInterceptor)
                .build()

            val retrofit = Retrofit.Builder()
                .baseUrl(BuildConfig.API_BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            apiService = retrofit.create(ApiService::class.java)
        }
        return apiService!!
    }
}
