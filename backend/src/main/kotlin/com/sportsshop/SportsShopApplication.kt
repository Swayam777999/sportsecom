package com.sportsshop

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration
import org.springframework.boot.runApplication

// UserDetailsServiceAutoConfiguration is excluded: we authenticate with Firebase JWTs, not username/password.
@SpringBootApplication(exclude = [UserDetailsServiceAutoConfiguration::class])
class SportsShopApplication

fun main(args: Array<String>) {
    runApplication<SportsShopApplication>(*args)
}
