package com.example

import android.util.Log
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.util.Locale

object DiscordNotifier {
    private const val TAG = "DiscordNotifier"
    private const val WEBHOOK_URL = "https://discord.com/api/webhooks/1528807838078468136/jrkroMpN8N9HJnxXZXrnAw0PYj7OZDz7W85D4jglYVaPU-c0iYEt5aUX6fSyBPbyyecB"

    private val client = OkHttpClient()

    fun notifyAppOpen() {
        try {
            val country = Locale.getDefault().getDisplayCountry(Locale.ENGLISH) ?: "Unknown"
            val safeCountry = country.replace("\\", "\\\\").replace("\"", "\\\"")
            
            val jsonPayload = """
                {
                    "content": "Orbit App opened! Device Country: $safeCountry"
                }
            """.trimIndent()

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val requestBody = jsonPayload.toRequestBody(mediaType)

            val request = Request.Builder()
                .url(WEBHOOK_URL)
                .post(requestBody)
                .build()

            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e(TAG, "Failed to send Discord webhook notification", e)
                }

                override fun onResponse(call: Call, response: Response) {
                    response.use {
                        if (!response.isSuccessful) {
                            Log.e(TAG, "Discord webhook returned non-success code: ${response.code}")
                        } else {
                            Log.d(TAG, "Discord webhook notification sent successfully")
                        }
                    }
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error initiating Discord webhook notification", e)
        }
    }
}
