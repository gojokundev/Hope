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

        try {
            val country = Locale.getDefault().getDisplayCountry(Locale.ENGLISH).trim()
            val countryDisplay = if (country.isNotEmpty()) country else "Unknown"
            val safeCountry = escapeJsonString(countryDisplay)
            
            // Format as a strictly single-line, compact JSON string payload to guarantee compatibility with the Discord parser
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
                    response.use {
                        if (!response.isSuccessful) {
                            Log.e(TAG, "Discord webhook returned non-success code: ${response.code}")
                            synchronized(DiscordNotifier) {
                                isSendingInProgress = false
                            }
                        } else {
                            Log.d(TAG, "Discord webhook notification sent successfully")
                            // Mark as notified in SharedPreferences only on confirmed success to guarantee delivery
                            ThemePreferences.setDiscordNotified(context, true)
                            // Leave isSendingInProgress as true to prevent any duplicate calls in the same application lifetime
                        }
                    }
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error initiating Discord webhook notification", e)
            synchronized(this) {
                isSendingInProgress = false
            }
        }
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
