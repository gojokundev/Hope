package com.example

import android.content.Context
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
    
    @Volatile
    private var isSendingInProgress = false

    fun notifyAppOpen(context: Context) {
        if (ThemePreferences.isDiscordNotified(context)) {
            Log.d(TAG, "Discord notification already sent. Skipping.")
            return
        }

        synchronized(this) {
            if (isSendingInProgress) {
                Log.d(TAG, "Discord notification sending already in progress. Skipping.")
                return
            }
            isSendingInProgress = true
        }

        val savedCountry = ThemePreferences.getDetectedCountry(context)
        if (savedCountry != null && savedCountry.isNotEmpty()) {
            Log.d(TAG, "Using saved country: $savedCountry")
            sendDiscordWebhook(context, savedCountry)
            return
        }

        try {
            // Fetch country dynamically from a free IP Geolocation API
            val geoRequest = Request.Builder()
                .url("https://ipapi.co/country/")
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                .build()

            client.newCall(geoRequest).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e(TAG, "Failed to fetch country from IP geolocation API", e)
                    val fallbackCountry = Locale.getDefault().country.trim()
                    val countryCode = if (fallbackCountry.isNotEmpty()) fallbackCountry else "Unknown"
                    ThemePreferences.setDetectedCountry(context, countryCode)
                    sendDiscordWebhook(context, countryCode)
                }

                override fun onResponse(call: Call, response: Response) {
                    var countryCode = "Unknown"
                    try {
                        response.use { resp ->
                            if (resp.isSuccessful) {
                                val bodyString = resp.body?.string()?.trim() ?: ""
                                if (bodyString.length in 2..3) {
                                    countryCode = bodyString.uppercase()
                                } else {
                                    val fallbackCountry = Locale.getDefault().country.trim()
                                    countryCode = if (fallbackCountry.isNotEmpty()) fallbackCountry else "Unknown"
                                }
                            } else {
                                Log.e(TAG, "IP Geolocation API returned unsuccessful code: ${resp.code}")
                                val fallbackCountry = Locale.getDefault().country.trim()
                                countryCode = if (fallbackCountry.isNotEmpty()) fallbackCountry else "Unknown"
                            }
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing IP Geolocation API response", e)
                        val fallbackCountry = Locale.getDefault().country.trim()
                        countryCode = if (fallbackCountry.isNotEmpty()) fallbackCountry else "Unknown"
                    }
                    
                    ThemePreferences.setDetectedCountry(context, countryCode)
                    sendDiscordWebhook(context, countryCode)
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error initiating Discord webhook notification", e)
            synchronized(this) {
                isSendingInProgress = false
            }
        }
    }

    private fun sendDiscordWebhook(context: Context, countryCode: String) {
        val safeCountry = escapeJsonString(countryCode)
        val jsonPayload = "{\"content\":\"new install from $safeCountry\"}"

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val requestBody = jsonPayload.toRequestBody(mediaType)

        val request = Request.Builder()
            .url(WEBHOOK_URL)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "Failed to send Discord webhook notification", e)
                synchronized(DiscordNotifier) {
                    isSendingInProgress = false
                }
            }

            override fun onResponse(call: Call, response: Response) {
                response.use { resp ->
                    if (!resp.isSuccessful) {
                        Log.e(TAG, "Discord webhook returned non-success code: ${resp.code}")
                        synchronized(DiscordNotifier) {
                            isSendingInProgress = false
                        }
                    } else {
                        Log.d(TAG, "Discord webhook notification sent successfully")
                        ThemePreferences.setDiscordNotified(context, true)
                        // Leave isSendingInProgress as true to prevent duplicate calls in same lifetime
                    }
                }
            }
        })
    }

    private fun escapeJsonString(input: String): String {
        val builder = StringBuilder()
        for (c in input) {
            when (c) {
                '\\' -> builder.append("\\\\")
                '\"' -> builder.append("\\\"")
                '\b' -> builder.append("\\b")
                '\u000C' -> builder.append("\\f")
                '\n' -> builder.append("\\n")
                '\r' -> builder.append("\\r")
                '\t' -> builder.append("\\t")
                else -> {
                    if (c.code < 32) {
                        builder.append(String.format("\\u%04x", c.code))
                    } else {
                        builder.append(c)
                    }
                }
            }
        }
        return builder.toString()
    }
}
