package com.sportsshop.controller

import com.sportsshop.dto.OrderDto
import com.sportsshop.dto.PlaceOrderRequest
import com.sportsshop.security.AuthUser
import com.sportsshop.service.OrderService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/orders")
class OrderController(private val service: OrderService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun place(
        @AuthenticationPrincipal user: AuthUser,
        @Valid @RequestBody(required = false) req: PlaceOrderRequest?
    ): OrderDto = service.placeOrder(user.uid, req?.idempotencyKey)

    @GetMapping
    fun list(@AuthenticationPrincipal user: AuthUser): List<OrderDto> = service.listOrders(user.uid)

    @GetMapping("/{id}")
    fun get(@AuthenticationPrincipal user: AuthUser, @PathVariable id: String): OrderDto =
        service.getOrder(user.uid, id)
}
