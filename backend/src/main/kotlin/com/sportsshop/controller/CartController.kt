package com.sportsshop.controller

import com.sportsshop.dto.AddCartItemRequest
import com.sportsshop.dto.CartDto
import com.sportsshop.dto.UpdateCartItemRequest
import com.sportsshop.security.AuthUser
import com.sportsshop.service.CartService
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/** The user id ALWAYS comes from the verified token (@AuthenticationPrincipal), never from the request. */
@RestController
@RequestMapping("/api/cart")
class CartController(private val service: CartService) {

    @GetMapping
    fun get(@AuthenticationPrincipal user: AuthUser): CartDto = service.getCart(user.uid)

    @PostMapping("/items")
    fun add(@AuthenticationPrincipal user: AuthUser, @Valid @RequestBody req: AddCartItemRequest): CartDto =
        service.addItem(user.uid, req)

    @PatchMapping("/items/{itemId}")
    fun update(
        @AuthenticationPrincipal user: AuthUser,
        @PathVariable itemId: String,
        @Valid @RequestBody req: UpdateCartItemRequest
    ): CartDto = service.updateQuantity(user.uid, itemId, req.quantity)

    @DeleteMapping("/items/{itemId}")
    fun remove(@AuthenticationPrincipal user: AuthUser, @PathVariable itemId: String): CartDto =
        service.removeItem(user.uid, itemId)
}
