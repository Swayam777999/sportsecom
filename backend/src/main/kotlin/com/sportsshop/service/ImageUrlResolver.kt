package com.sportsshop.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

/**
 * Product records can store either a full imageUrl or a Firebase Storage imagePath (e.g. "products/football.jpg").
 * A path is turned into a public download URL (requires storage.rules to allow public read on /products).
 */
@Component
class ImageUrlResolver(
    @Value("\${firebase.storage-bucket}") private val bucket: String
) {
    fun resolve(imageUrl: String?, imagePath: String?): String? {
        if (!imageUrl.isNullOrBlank()) return imageUrl
        if (imagePath.isNullOrBlank()) return null
        if (imagePath.startsWith("http")) return imagePath
        val encoded = URLEncoder.encode(imagePath, StandardCharsets.UTF_8).replace("+", "%20")
        return "https://firebasestorage.googleapis.com/v0/b/$bucket/o/$encoded?alt=media"
    }
}
