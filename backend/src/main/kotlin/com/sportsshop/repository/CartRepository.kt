package com.sportsshop.repository

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.sportsshop.model.CartItem
import org.springframework.stereotype.Repository

/** carts/{uid}/items/{productId}  -> { productId, quantity, updatedAt }  (itemId == productId) */
@Repository
class CartRepository(private val firestore: Firestore) {

    private fun items(uid: String) = firestore.collection("carts").document(uid).collection("items")

    fun findAll(uid: String): List<CartItem> =
        items(uid).get().get().documents.map { CartItem(it.id, it.getLong("quantity")?.toInt() ?: 0) }

    fun find(uid: String, productId: String): CartItem? {
        val snap = items(uid).document(productId).get().get()
        return if (snap.exists()) CartItem(snap.id, snap.getLong("quantity")?.toInt() ?: 0) else null
    }

    fun save(uid: String, productId: String, quantity: Int) {
        items(uid).document(productId).set(
            mapOf("productId" to productId, "quantity" to quantity, "updatedAt" to Timestamp.now())
        ).get()
    }

    fun delete(uid: String, productId: String) {
        items(uid).document(productId).delete().get()
    }
}
