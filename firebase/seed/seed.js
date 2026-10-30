const admin = require("firebase-admin");
const products = require("./products.json");
const serviceAccount = require("../../backend/secrets/firebase-service-account.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function seed() {
  const batch = db.batch();
  for (const { id, ...data } of products) {
    // Fixed IDs make this script safe to re-run (it overwrites, never duplicates).
    batch.set(db.collection("products").doc(id), {
      ...data,
      currency: "INR",
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`Seeded ${products.length} products.`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
