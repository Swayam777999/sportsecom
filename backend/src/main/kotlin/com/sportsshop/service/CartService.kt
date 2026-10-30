package com.sportsshop.service

import com.sportsshop.dto.AddCartItemRequest
import com.sportsshop.dto.CartDto
import com.sportsshop.dto.CartItemDto
import com.sportsshop.exception.AppException
import com.sportsshop.repository.CartRepository
import com.sportsshop.repository.ProductRepository
import com.sportsshop.util.Ids
import com.sportsshop.util.Money
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class CartService(
    private val cartRepo: CartRepository,
    private val productRepo: ProductRepository,
    private val images: ImageUrlResolver
) {
    companion object {
        const val MAX_PER_ITEM = 10
    }

    /** Prices always come from the product record, never from what the client sends. */
    fun getCart(uid: String): CartDto {
        val lines = cartRepo.findAll(uid).map { item ->
            val p = productRepo.findById(item.productId)
            if (p == null || !p.active) {
                CartItemDto(
                    itemId = item.productId, productId = item.productId, name = "No longer available",
                    imageUrl = null, unitPrice = 0.0, currency = Money.CURRENCY, quantity = item.quantity,
                    lineTotal = 0.0, stockQuantity = 0, available = false
                )
            } else {
                CartItemDto(
                    itemId = item.productId, productId = p.id, name = p.name,
                    imageUrl = images.resolve(p.imageUrl, p.imagePath), unitPrice = p.price, currency = p.currency,
                    quantity = item.quantity, lineTotal = Money.round2(p.price * item.quantity),
                    stockQuantity = p.stockQuantity, available = p.stockQuantity >= item.quantity
                )
            }
        }.sortedBy { it.name.lowercase() }

        return CartDto(
            items = lines,
            itemCount = lines.sumOf { it.quantity },
            subtotal = Money.round2(lines.filter { it.available }.sumOf { it.lineTotal }),
            currency = Money.CURRENCY
        )
    }

    fun addItem(uid: String, req: AddCartItemRequest): CartDto {
        val product = productRepo.findById(req.productId)
        if (product == null || !product.active) throw AppException(HttpStatus.NOT_FOUND, "Product not found")

        val existing = cartRepo.find(uid, req.productId)?.quantity ?: 0
        val newQty = existing + req.quantity
        if (newQty > MAX_PER_ITEM) {
            throw AppException(HttpStatus.BAD_REQUEST, "You can order at most $MAX_PER_ITEM of the same item")
        }
        if (newQty > product.stockQuantity) {
            throw AppException(HttpStatus.CONFLICT, "Only ${product.stockQuantity} of '${product.name}' in stock")
        }
        cartRepo.save(uid, product.id, newQty)
        return getCart(uid)
    }

    fun updateQuantity(uid: String, itemId: String, quantity: Int): CartDto {
        Ids.requireValid(itemId, "Cart item not found")
        if (cartRepo.find(uid, itemId) == null) throw AppException(HttpStatus.NOT_FOUND, "Cart item not found")

        val product = productRepo.findById(itemId)
        if (product == null || !product.active) {
            throw AppException(HttpStatus.CONFLICT, "This product is no longer available. Please remove it.")
        }
        if (quantity > product.stockQuantity) {
            throw AppException(HttpStatus.CONFLICT, "Only ${product.stockQuantity} of '${product.name}' in stock")
        }
        cartRepo.save(uid, itemId, quantity)
        return getCart(uid)
    }

    fun removeItem(uid: String, itemId: String): CartDto {
        Ids.requireValid(itemId, "Cart item not found")
        if (cartRepo.find(uid, itemId) == null) throw AppException(HttpStatus.NOT_FOUND, "Cart item not found")
        cartRepo.delete(uid, itemId)
        return getCart(uid)
    }
}
