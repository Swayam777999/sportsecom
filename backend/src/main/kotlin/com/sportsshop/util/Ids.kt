package com.sportsshop.util

import com.sportsshop.exception.AppException
import org.springframework.http.HttpStatus
import kotlin.math.round

object Ids {
    private val valid = Regex("^[A-Za-z0-9_-]{1,100}$")

    fun isValid(id: String) = valid.matches(id)

    /** Firestore document ids can't contain '/', so reject anything odd before touching the database. */
    fun requireValid(id: String, notFoundMessage: String): String {
        if (!isValid(id)) throw AppException(HttpStatus.NOT_FOUND, notFoundMessage)
        return id
    }
}

object Money {
    const val CURRENCY = "INR"
    fun round2(v: Double): Double = round(v * 100.0) / 100.0
}
