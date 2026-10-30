package com.sportsshop.security

import com.google.firebase.auth.FirebaseAuth
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Reads "Authorization: Bearer <token>", verifies the Firebase ID token (a signed JWT) with the Admin SDK
 * and puts the user into the SecurityContext. A missing/invalid token simply leaves the request
 * unauthenticated, so protected routes answer 401 and public routes (GET /api/products) still work.
 */
class FirebaseTokenFilter(private val firebaseAuth: FirebaseAuth) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ", ignoreCase = true)) {
            val token = header.substring(7).trim()
            if (token.isNotEmpty()) {
                try {
                    val decoded = firebaseAuth.verifyIdToken(token)
                    val user = AuthUser(decoded.uid, decoded.email, decoded.name)
                    SecurityContextHolder.getContext().authentication =
                        UsernamePasswordAuthenticationToken(user, null, emptyList())
                } catch (e: Exception) {
                    log.debug("Rejected token: {}", e.message)
                    SecurityContextHolder.clearContext()
                }
            }
        }
        filterChain.doFilter(request, response)
    }
}
