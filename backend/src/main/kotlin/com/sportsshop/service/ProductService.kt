package com.sportsshop.service

import com.sportsshop.dto.ProductDto
import com.sportsshop.exception.AppException
import com.sportsshop.model.Product
import com.sportsshop.repository.ProductRepository
import com.sportsshop.util.Ids
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class ProductService(
    private val repo: ProductRepository,
    private val images: ImageUrlResolver
) {

    fun list(category: String?, minPrice: Double?, maxPrice: Double?, sort: String?): List<ProductDto> {
        if (minPrice != null && minPrice < 0) throw AppException(HttpStatus.BAD_REQUEST, "minPrice cannot be negative")
        if (maxPrice != null && maxPrice < 0) throw AppException(HttpStatus.BAD_REQUEST, "maxPrice cannot be negative")
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw AppException(HttpStatus.BAD_REQUEST, "minPrice cannot be greater than maxPrice")
        }

        var products: List<Product> = repo.findAllActive()
        if (!category.isNullOrBlank()) {
            products = products.filter { it.category.equals(category.trim(), ignoreCase = true) }
        }
        if (minPrice != null) products = products.filter { it.price >= minPrice }
        if (maxPrice != null) products = products.filter { it.price <= maxPrice }

        val sorted = when (sort?.trim()?.lowercase()) {
            null, "", "name_asc" -> products.sortedBy { it.name.lowercase() }
            "name_desc" -> products.sortedByDescending { it.name.lowercase() }
            "price_asc" -> products.sortedBy { it.price }
            "price_desc" -> products.sortedByDescending { it.price }
            else -> throw AppException(
                HttpStatus.BAD_REQUEST,
                "Invalid sort. Use name_asc, name_desc, price_asc or price_desc"
            )
        }
        return sorted.map { toDto(it) }
    }

    fun get(id: String): ProductDto {
        Ids.requireValid(id, "Product not found")
        val product = repo.findById(id)
        if (product == null || !product.active) throw AppException(HttpStatus.NOT_FOUND, "Product not found")
        return toDto(product)
    }

    private fun toDto(p: Product) = ProductDto(
        id = p.id,
        name = p.name,
        category = p.category,
        description = p.description,
        price = p.price,
        currency = p.currency,
        imageUrl = images.resolve(p.imageUrl, p.imagePath),
        specifications = p.specifications,
        stockQuantity = p.stockQuantity,
        inStock = p.stockQuantity > 0
    )
}
