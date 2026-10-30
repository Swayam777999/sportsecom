package com.sportsshop.security

/** The authenticated caller, built ONLY from a verified Firebase ID token (JWT). */
data class AuthUser(val uid: String, val email: String?, val name: String?)
