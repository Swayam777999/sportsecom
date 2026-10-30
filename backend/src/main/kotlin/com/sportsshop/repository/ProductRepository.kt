package com.sportsshop.repository

import com.google.cloud.firestore.Firestore
import com.sportsshop.model.Product
import org.springframework.stereotype.Repository

@Repository
class ProductRepository(private val firestore: Firestore) {

    private fun col() = firestore.collection("products")

    fun findAllActive(): List<Product> =
        col().whereEqualTo("active", true).get().get().documents.map { it.toProduct() }

    fun findById(id: String): Product? {
        val snap = col().document(id).get().get()
        return if (snap.exists()) snap.toProduct() else null
    }

    fun hasAny(): Boolean = !col().limit(1).get().get().isEmpty

    fun save(id: String, data: Map<String, Any?>) {
        col().document(id).set(data).get()
    }
}
