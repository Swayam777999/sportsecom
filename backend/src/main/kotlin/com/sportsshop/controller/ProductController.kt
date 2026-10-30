package com.sportsshop.controller

import com.sportsshop.dto.ProductDto
import com.sportsshop.service.ProductService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/products")
class ProductController(private val service: ProductService) {

    @GetMapping
    fun list(
        @RequestParam(required = false) category: String?,
        @RequestParam(required = false) minPrice: Double?,
        @RequestParam(required = false) maxPrice: Double?,
        @RequestParam(required = false) sort: String?
    ): List<ProductDto> = service.list(category, minPrice, maxPrice, sort)

    @GetMapping("/{id}")
    fun get(@PathVariable id: String): ProductDto = service.get(id)
}
