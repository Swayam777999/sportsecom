package com.sportsshop.seed

import com.sportsshop.repository.ProductRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

/** Inserts sample products on first start (only if the products collection is empty). */
@Component
class DataSeeder(
    private val repo: ProductRepository,
    @Value("\${app.seed-data}") private val enabled: Boolean
) : CommandLineRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun run(vararg args: String?) {
        if (!enabled) return
        try {
            if (repo.hasAny()) {
                log.info("Products already exist - skipping seed")
                return
            }
            samples().forEach { (id, data) -> repo.save(id, data) }
            log.info("Seeded {} sample products", samples().size)
        } catch (e: Exception) {
            log.error("Seeding failed. Check the service-account key and that Firestore is created: {}", e.message)
        }
    }

    private fun p(
        id: String, name: String, category: String, description: String,
        price: Double, stock: Int, specs: Map<String, String>
    ): Pair<String, Map<String, Any?>> = id to mapOf(
        "name" to name,
        "category" to category,
        "description" to description,
        "price" to price,
        "currency" to "INR",
        // Upload a matching file to Firebase Storage at this path (see docs/SETUP_GUIDE.md)
        "imagePath" to "products/$id.jpg",
        "specifications" to specs,
        "stockQuantity" to stock,
        "active" to true
    )

    private fun samples(): List<Pair<String, Map<String, Any?>>> = listOf(
        p("football-size-5", "Match Football (Size 5)", "Balls",
            "Machine-stitched match football with a durable PU cover for turf and ground play.",
            1299.0, 40, mapOf("Size" to "5", "Material" to "PU", "Weight" to "430 g")),
        p("cricket-leather-ball", "Cricket Leather Ball", "Balls",
            "Four-piece red leather cricket ball with a raised seam, ideal for practice and club matches.",
            549.0, 60, mapOf("Weight" to "156 g", "Colour" to "Red", "Seam" to "Hand-stitched")),
        p("basketball-size-7", "Outdoor Basketball (Size 7)", "Balls",
            "Deep-channel rubber basketball with excellent grip for outdoor courts.",
            1499.0, 25, mapOf("Size" to "7", "Material" to "Rubber", "Use" to "Outdoor")),
        p("badminton-racket-pro", "Badminton Racket Pro", "Rackets",
            "Lightweight graphite-composite racket balanced for fast attacking play.",
            2199.0, 18, mapOf("Weight" to "85 g", "Frame" to "Graphite", "Balance" to "Head-light")),
        p("tennis-racket-club", "Tennis Racket Club Edition", "Rackets",
            "Forgiving 100 sq in head with a comfortable grip, great for club players.",
            3499.0, 12, mapOf("Head size" to "100 sq in", "Weight" to "285 g", "Grip" to "L2")),
        p("cricket-bat-english-willow", "English Willow Cricket Bat", "Bats",
            "Grade-1 English willow bat with a thick edge and a full, powerful sweet spot.",
            5999.0, 8, mapOf("Wood" to "English Willow", "Weight" to "1.15 kg", "Size" to "SH")),
        p("cricket-bat-kashmir-willow", "Kashmir Willow Cricket Bat", "Bats",
            "Affordable, durable Kashmir willow bat for practice and tennis-ball cricket.",
            1899.0, 20, mapOf("Wood" to "Kashmir Willow", "Weight" to "1.1 kg", "Size" to "SH")),
        p("batting-gloves", "Cricket Batting Gloves", "Protective Gear",
            "Padded batting gloves with ventilated palms and flexible finger protection.",
            999.0, 30, mapOf("Material" to "Leather + foam", "Hand" to "Right", "Size" to "Adult")),
        p("shin-guards", "Football Shin Guards", "Protective Gear",
            "Lightweight hard-shell shin guards with breathable EVA backing.",
            699.0, 35, mapOf("Material" to "PP shell + EVA", "Size" to "M", "Weight" to "120 g")),
        p("yoga-mat-6mm", "Yoga Mat 6 mm", "Fitness Accessories",
            "Non-slip, cushioned yoga mat that is easy to roll and carry.",
            899.0, 50, mapOf("Thickness" to "6 mm", "Length" to "183 cm", "Material" to "TPE")),
        p("resistance-bands-set", "Resistance Bands Set (5)", "Fitness Accessories",
            "Five bands of varying resistance for strength, mobility and rehab work.",
            599.0, 45, mapOf("Pieces" to "5", "Material" to "Latex", "Includes" to "Carry pouch")),
        p("agility-ladder", "Agility Ladder 6 m", "Training Equipment",
            "Adjustable-rung agility ladder for footwork, speed and coordination drills.",
            799.0, 22, mapOf("Length" to "6 m", "Rungs" to "12", "Includes" to "Carry bag"))
    )
}
