package com.sportsshop.service

import com.sportsshop.dto.UserProfileDto
import com.sportsshop.model.UserProfile
import com.sportsshop.repository.UserRepository
import com.sportsshop.security.AuthUser
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class UserService(private val repo: UserRepository) {

    /** Returns the caller's profile, creating it on first call (no separate register endpoint needed). */
    fun me(user: AuthUser): UserProfileDto {
        val profile = repo.find(user.uid) ?: run {
            val name = user.name?.takeIf { it.isNotBlank() } ?: user.email?.substringBefore('@') ?: "Customer"
            repo.save(user.uid, name, user.email)
            UserProfile(user.uid, name, user.email, Instant.now())
        }
        return UserProfileDto(profile.uid, profile.displayName, profile.email, profile.createdAt)
    }
}
