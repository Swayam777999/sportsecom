package com.sportsshop.controller

import com.sportsshop.dto.UserProfileDto
import com.sportsshop.security.AuthUser
import com.sportsshop.service.UserService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController(private val service: UserService) {

    @GetMapping("/me")
    fun me(@AuthenticationPrincipal user: AuthUser): UserProfileDto = service.me(user)
}
