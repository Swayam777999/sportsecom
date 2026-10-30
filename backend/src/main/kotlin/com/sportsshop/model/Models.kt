package com.sportsshop.model

import java.time.Instant

data class Product(
    val id: String,
    val name: String,
    val category: String,
    val description: String,
    val price: Double,
    val currency: String,
    val imageUrl: String?,
    val imagePath: String?,
    val specifications: Map<String, String>,
    val stockQuantity: Int,
    val active: Boolean
)

data class CartItem(val productId: String, val quantity: Int)

data class OrderLine(val productId: String, val name: String, val unitPrice: Double, val quantity: Int)

data class Order(
    val id: String,
    val userId: String,
    val createdAt: Instant,
    val items: List<OrderLine>,
    val subtotal: Double,
    val total: Double,
    val currency: String,
    val status: String,
    val paymentStatus: String
)

data class UserProfile(
    val uid: String,
    val displayName: String,
    val email: String?,
    val createdAt: Instant
)
