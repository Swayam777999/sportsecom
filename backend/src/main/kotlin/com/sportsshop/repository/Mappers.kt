package com.sportsshop.repository

import com.google.cloud.firestore.DocumentSnapshot
import com.sportsshop.model.Order
import com.sportsshop.model.OrderLine
import com.sportsshop.model.Product
import com.sportsshop.model.UserProfile
import java.time.Instant

fun DocumentSnapshot.toProduct(): Product {
    @Suppress("UNCHECKED_CAST")
    val specs = (get("specifications") as? Map<String, Any?>)
        ?.mapValues { it.value?.toString() ?: "" } ?: emptyMap()

    val rawPrice = get("price")
    val parsedPrice = when (rawPrice) {
        is Number -> rawPrice.toDouble()
        is String -> rawPrice.trim().toDoubleOrNull() ?: 0.0
        else -> 0.0
    }

    val rawStock = get("stockQuantity")
    val parsedStock = when (rawStock) {
        is Number -> rawStock.toInt()
        is String -> rawStock.trim().toIntOrNull() ?: 0
        else -> 0
    }

    val rawActive = get("active")
    val parsedActive = when (rawActive) {
        is Boolean -> rawActive
        is String -> rawActive.trim().toBoolean()
        else -> true
    }

    return Product(
        id = id,
        name = getString("name") ?: "",
        category = getString("category") ?: "",
        description = getString("description") ?: "",
        price = parsedPrice,
        currency = getString("currency") ?: "INR",
        imageUrl = getString("imageUrl"),
        imagePath = getString("imagePath"),
        specifications = specs,
        stockQuantity = parsedStock,
        active = parsedActive
    )
}

fun DocumentSnapshot.toOrder(): Order {
    @Suppress("UNCHECKED_CAST")
    val raw = (get("items") as? List<Map<String, Any?>>) ?: emptyList()
    val lines = raw.map {
        OrderLine(
            productId = it["productId"] as? String ?: "",
            name = it["name"] as? String ?: "",
            unitPrice = (it["unitPrice"] as? Number)?.toDouble() ?: 0.0,
            quantity = (it["quantity"] as? Number)?.toInt() ?: 0
        )
    }
    return Order(
        id = id,
        userId = getString("userId") ?: "",
        createdAt = getTimestamp("createdAt")?.toDate()?.toInstant() ?: Instant.EPOCH,
        items = lines,
        subtotal = getDouble("subtotal") ?: 0.0,
        total = getDouble("total") ?: 0.0,
        currency = getString("currency") ?: "INR",
        status = getString("status") ?: "PLACED",
        paymentStatus = getString("paymentStatus") ?: "Not integrated"
    )
}

fun DocumentSnapshot.toUserProfile(): UserProfile = UserProfile(
    uid = id,
    displayName = getString("displayName") ?: "",
    email = getString("email"),
    createdAt = getTimestamp("createdAt")?.toDate()?.toInstant() ?: Instant.EPOCH
)
