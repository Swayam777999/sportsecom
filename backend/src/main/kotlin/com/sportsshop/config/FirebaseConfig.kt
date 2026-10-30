package com.sportsshop.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.firestore.Firestore
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.cloud.FirestoreClient
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.FileInputStream

@Configuration
class FirebaseConfig(
    @Value("\${firebase.credentials-path}") private val credentialsPath: String
) {

    @PostConstruct
    fun init() {
        if (FirebaseApp.getApps().isEmpty()) {
            FileInputStream(credentialsPath).use { stream ->
                val options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(stream))
                    .build()
                FirebaseApp.initializeApp(options)
            }
        }
    }

    @Bean
    fun firestore(): Firestore = FirestoreClient.getFirestore()

    @Bean
    fun firebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()
}
