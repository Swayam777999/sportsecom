package com.sportsshop.repository

import com.google.cloud.firestore.Firestore
import com.sportsshop.model.Order
import org.springframework.stereotype.Repository

@Repository
class OrderRepository(private val firestore: Firestore) {

    private fun col() = firestore.collection("orders")

    /** Sorted in memory so no composite Firestore index is needed for this small project. */
    fun findByUser(uid: String): List<Order> =
        col().whereEqualTo("userId", uid).get().get().documents
            .map { it.toOrder() }
            .sortedByDescending { it.createdAt }

    fun findById(id: String): Order? {
        val snap = col().document(id).get().get()
        return if (snap.exists()) snap.toOrder() else null
    }
}
