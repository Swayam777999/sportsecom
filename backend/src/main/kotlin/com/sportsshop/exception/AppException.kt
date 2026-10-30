package com.sportsshop.exception

import org.springframework.http.HttpStatus

/** Business/validation error that is safe to show to the client. */
class AppException(val status: HttpStatus, override val message: String) : RuntimeException(message)
