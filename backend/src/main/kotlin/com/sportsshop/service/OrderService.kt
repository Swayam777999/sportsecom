package com.sportsshop.service

import com.google.cloud.Timestamp
import com.google.cloud.firestore.DocumentReference
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.Transaction
import com.sportsshop.dto.OrderDto
import com.sportsshop.dto.OrderItemDto
import com.sportsshop.exception.AppException
import com.sportsshop.model.Order
import com.sportsshop.model.OrderLine
import com.sportsshop.repository.OrderRepository
import com.sportsshop.repository.toOrder
import com.sportsshop.repository.toProduct
import com.sportsshop.util.Ids
import com.sportsshop.util.Money
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.util.concurrent.ExecutionException

/** Result of the transaction body. Business errors are returned (not thrown) so nothing is written on failure. */
private sealed class TxResult {
    class Ok(val order: Order) : TxResult()
    class Fail(val error: AppException) : TxResult()
}

@Service
class OrderService(
    private val firestore: Firestore,
    private val orderRepo: OrderRepository
) {

    fun listOrders(uid: String): List<OrderDto> = orderRepo.findByUser(uid).map { it.toDto() }

    fun getOrder(uid: String, orderId: String): OrderDto {
        Ids.requireValid(orderId, "Order not found")
        val order = orderRepo.findById(orderId)
        // 404 (not 403) for other people's orders so ids can't be probed
        if (order == null || order.userId != uid) throw AppException(HttpStatus.NOT_FOUND, "Order not found")
        return order.toDto()
    }

    /**
     * Atomically: re-read the cart + trusted product records, validate stock, create the order with a price
     * snapshot, decrement stock and clear the cart. With an idempotencyKey a retry returns the same order.
     */
    fun placeOrder(uid: String, idempotencyKey: String?): OrderDto {
        val orders = firestore.collection("orders")
        val orderRef = if (idempotencyKey.isNullOrBlank()) orders.document() else orders.document("${uid}_$idempotencyKey")

        val result = try {
            firestore.runTransaction(Transaction.Function { tx -> placeInTransaction(tx, uid, orderRef) }).get()
        } catch (e: ExecutionException) {
            throw e.cause ?: e
        }

        return when (result) {
            is TxResult.Ok -> result.order.toDto()
            is TxResult.Fail -> throw result.error
        }
    }

    private fun placeInTransaction(tx: Transaction, uid: String, orderRef: DocumentReference): TxResult {
        val cartCol = firestore.collection("carts").document(uid).collection("items")
        val productsCol = firestore.collection("products")

        // ---- ALL READS FIRST (Firestore requirement) ----
        val existing = tx.get(orderRef).get()
        if (existing.exists()) {
            return if (existing.getString("userId") == uid) TxResult.Ok(existing.toOrder())
            else TxResult.Fail(AppException(HttpStatus.CONFLICT, "Invalid idempotency key"))
        }

        val cartDocs = tx.get(cartCol).get().documents
        if (cartDocs.isEmpty()) return TxResult.Fail(AppException(HttpStatus.BAD_REQUEST, "Your cart is empty"))

        val refs = cartDocs.map { productsCol.document(it.id) }
        val products = tx.getAll(*refs.toTypedArray()).get().filter { it.exists() }.associate { it.id to it.toProduct() }

        // ---- VALIDATE + build lines from TRUSTED prices ----
        val lines = ArrayList<OrderLine>()
        for (cartDoc in cartDocs) {
            val qty = cartDoc.getLong("quantity")?.toInt() ?: 0
            val product = products[cartDoc.id]
            if (product == null || !product.active) {
                return TxResult.Fail(AppException(HttpStatus.CONFLICT, "An item in your cart is no longer available. Please remove it."))
            }
            if (qty < 1) return TxResult.Fail(AppException(HttpStatus.BAD_REQUEST, "Invalid quantity in cart"))
            if (product.stockQuantity < qty) {
                return TxResult.Fail(AppException(HttpStatus.CONFLICT, "Only ${product.stockQuantity} of '${product.name}' left in stock"))
            }
            lines.add(OrderLine(product.id, product.name, product.price, qty))
        }

        val subtotal = Money.round2(lines.sumOf { it.unitPrice * it.quantity })
        val now = Timestamp.now()

        // ---- WRITES ----
        tx.set(
            orderRef,
            mapOf(
                "userId" to uid,
                "createdAt" to now,
                "items" to lines.map {
                    mapOf("productId" to it.productId, "name" to it.name, "unitPrice" to it.unitPrice, "quantity" to it.quantity)
                },
                "subtotal" to subtotal,
                "total" to subtotal,
                "currency" to Money.CURRENCY,
                "status" to "PLACED",
                "paymentStatus" to "Pay on delivery"
            )
        )
        for (line in lines) {
            val newStock = products.getValue(line.productId).stockQuantity - line.quantity
            tx.update(productsCol.document(line.productId), "stockQuantity", newStock)
        }
        cartDocs.forEach { tx.delete(it.reference) }

        return TxResult.Ok(
            Order(
                id = orderRef.id, userId = uid, createdAt = now.toDate().toInstant(), items = lines,
                subtotal = subtotal, total = subtotal, currency = Money.CURRENCY,
                status = "PLACED", paymentStatus = "Pay on delivery"
            )
        )
    }

    private fun Order.toDto() = OrderDto(
        id = id,
        createdAt = createdAt,
        items = items.map {
            OrderItemDto(it.productId, it.name, it.unitPrice, it.quantity, Money.round2(it.unitPrice * it.quantity))
        },
        subtotal = subtotal,
        total = total,
        currency = currency,
        status = status,
        paymentStatus = paymentStatus
    )
}
