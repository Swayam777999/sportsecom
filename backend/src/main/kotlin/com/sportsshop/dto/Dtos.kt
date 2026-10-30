package com.sportsshop.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import java.time.Instant

// ---------- Products ----------
data class ProductDto(
    val id: String,
    val name: String,
    val category: String,
    val description: String,
    val price: Double,
    val currency: String,
    val imageUrl: String?,
    val specifications: Map<String, String>,
    val stockQuantity: Int,
    val inStock: Boolean
)

// ---------- Cart ----------
data class AddCartItemRequest(
    @field:NotBlank(message = "productId is required")
    @field:Pattern(regexp = "^[A-Za-z0-9_-]{1,100}$", message = "productId is invalid")
    val productId: String,

    @field:Min(value = 1, message = "quantity must be at least 1")
    @field:Max(value = 10, message = "quantity cannot be more than 10")
    val quantity: Int
)

data class UpdateCartItemRequest(
    @field:Min(value = 1, message = "quantity must be at least 1")
    @field:Max(value = 10, message = "quantity cannot be more than 10")
    val quantity: Int
)

data class CartItemDto(
    val itemId: String,
    val productId: String,
    val name: String,
    val imageUrl: String?,
    val unitPrice: Double,
    val currency: String,
    val quantity: Int,
    val lineTotal: Double,
    val stockQuantity: Int,
    val available: Boolean
)

data class CartDto(
    val items: List<CartItemDto>,
    val itemCount: Int,
    val subtotal: Double,
    val currency: String
)

// ---------- Orders ----------
data class PlaceOrderRequest(
    // Optional: protects against duplicate orders when the client retries the same request
    @field:Pattern(regexp = "^[A-Za-z0-9-]{8,64}$", message = "idempotencyKey must be 8-64 letters, digits or hyphens")
    val idempotencyKey: String? = null
)

data class OrderItemDto(
    val productId: String,
    val name: String,
    val unitPrice: Double,
    val quantity: Int,
    val lineTotal: Double
)

data class OrderDto(
    val id: String,
    val createdAt: Instant,
    val items: List<OrderItemDto>,
    val subtotal: Double,
    val total: Double,
    val currency: String,
    val status: String,
    val paymentStatus: String
)

// ---------- Users / errors ----------
data class UserProfileDto(
    val uid: String,
    val displayName: String,
    val email: String?,
    val createdAt: Instant
)

data class ErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val timestamp: Instant = Instant.now()
)
