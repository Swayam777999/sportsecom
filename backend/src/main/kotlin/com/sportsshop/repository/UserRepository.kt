package com.sportsshop.repository

import com.google.cloud.Timestamp
import com.google.cloud.firestore.Firestore
import com.sportsshop.model.UserProfile
import org.springframework.stereotype.Repository

/** users/{uid} -> non-secret profile metadata only (passwords live in Firebase Auth, never here). */
@Repository
class UserRepository(private val firestore: Firestore) {

    private fun col() = firestore.collection("users")

    fun find(uid: String): UserProfile? {
        val snap = col().document(uid).get().get()
        return if (snap.exists()) snap.toUserProfile() else null
    }

    fun save(uid: String, displayName: String, email: String?) {
        col().document(uid).set(
            mapOf("displayName" to displayName, "email" to email, "createdAt" to Timestamp.now())
        ).get()
    }
}
