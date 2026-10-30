# Sports Shop - Setup Guide (VS Code)

Stack: React + TypeScript (Vite) | Kotlin + Spring Boot | Firebase Auth (JWT) + Firestore + Storage | Postman

Final folder layout (matches your PRD section 15):

```
sports-shop/
  backend/      Kotlin + Spring Boot API
  frontend/     React + TypeScript app
  firebase/     firestore.rules, storage.rules, firebase.json
  postman/      collection + environment
  docs/
```

---

## 0. Prerequisites (install once)

| Tool | Version | Check |
|---|---|---|
| JDK | 17 or 21 | `java -version` |
| Node.js | 20+ | `node -v` |
| VS Code extensions | Kotlin, Extension Pack for Java, Spring Boot Extension Pack, ESLint | - |
| Postman | latest | - |
| Firebase CLI (optional) | `npm i -g firebase-tools` | `firebase --version` |

---

## 1. Firebase console setup (PRD plan step 1)

1. https://console.firebase.google.com -> **Add project** (e.g. `sports-shop-demo`).
2. **Build > Authentication > Get started > Email/Password > Enable**.
3. **Build > Firestore Database > Create database** -> *Production mode* -> pick a region (e.g. `asia-south1` Mumbai).
4. **Build > Storage > Get started**. (Firebase may ask you to switch to the Blaze pay-as-you-go plan to create a bucket. If you don't want that, skip Storage: the app shows a placeholder image, or you can put full image URLs in the products' `imageUrl` field.)
5. **Project settings (gear) > General > Your apps > `</>` Web app** -> register -> copy the config values (`apiKey`, `authDomain`, `projectId`, `appId`). You need them for `frontend/.env`.
6. **Project settings > Service accounts > Generate new private key** -> save the downloaded JSON as
   `backend/serviceAccountKey.json`.
   **Never commit it. Never put it in the frontend.** (`.gitignore` already blocks it.)
7. Rules: copy `firebase/firestore.rules` and `firebase/storage.rules` into the console Rules tabs and **Publish**, or from the `firebase/` folder run:
   ```
   firebase login
   firebase use --add        # choose your project
   firebase deploy --only firestore:rules,storage
   ```

---

## 2. Backend (Kotlin + Spring Boot)

### 2.1 Create the project skeleton
Go to https://start.spring.io and choose:

- Project: **Gradle - Kotlin**, Language: **Kotlin**
- Spring Boot: the newest **3.x** (3.4 / 3.5). Do **not** pick 4.x - this code targets Boot 3.
- Group: `com.sportsshop`  Artifact: `sports-shop-api`  Package name: **`com.sportsshop`**
- Java: 17 (or 21)
- Dependencies: **Spring Web, Validation, Spring Security**

Download, unzip, and place the contents inside `sports-shop/backend/`.

Then:
1. **Delete** the generated `SportsShopApiApplication.kt`, the generated test file(s), and `src/main/resources/application.properties`.
2. Open `backend/build.gradle.kts` and **add one line** inside `dependencies { ... }` (keep everything Initializr generated):
   ```kotlin
   implementation("com.google.firebase:firebase-admin:9.4.1")
   ```
   (`backend/build.gradle.kts` in this zip is only a reference of a working file.)

### 2.2 Add the source files from this zip
Copy these into `backend/` keeping the same paths:

| Action | Path |
|---|---|
| NEW | `src/main/resources/application.yml` |
| NEW | `src/main/kotlin/com/sportsshop/SportsShopApplication.kt` |
| NEW | `.../config/FirebaseConfig.kt`, `SecurityConfig.kt` |
| NEW | `.../security/AuthUser.kt`, `FirebaseTokenFilter.kt` |
| NEW | `.../controller/` Health, Product, Cart, Order, User controllers |
| NEW | `.../service/` ImageUrlResolver, Product, Cart, Order, User services |
| NEW | `.../repository/` Mappers, Product, Cart, Order, User repositories |
| NEW | `.../dto/Dtos.kt`, `.../model/Models.kt` |
| NEW | `.../exception/AppException.kt`, `GlobalExceptionHandler.kt` |
| NEW | `.../util/Ids.kt` |
| NEW | `.../seed/DataSeeder.kt` (inserts 12 sample products on first run) |

### 2.3 Configure + run
Edit `application.yml` (or set env vars):
- `firebase.storage-bucket` -> the bucket name shown in Firebase Console > Storage (e.g. `sports-shop-demo.firebasestorage.app`).
- Make sure `backend/serviceAccountKey.json` exists (default path `./serviceAccountKey.json`, relative to where you run the app, i.e. `backend/`).

```bash
cd backend
./gradlew bootRun        # Windows: gradlew.bat bootRun
```
Check: http://localhost:8080/api/health -> `{"status":"UP"}` and http://localhost:8080/api/products -> 12 products.

### 2.4 Product images (optional but nice)
In Firebase Console > Storage create a folder `products` and upload one `.jpg` per product named exactly like the product id, e.g. `products/football-size-5.jpg`, `products/yoga-mat-6mm.jpg`, ... (ids are in `DataSeeder.kt`). No image -> placeholder is shown.

---

## 3. Frontend (React + TypeScript)

```bash
cd sports-shop
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom firebase axios
```

Clean up the template: **delete** `src/App.css`, `src/index.css`, `src/assets/`.

Copy these from the zip into `frontend/` (REPLACE `src/main.tsx` and `src/App.tsx`, the rest are NEW):

```
.env.example            -> copy to .env and fill in your Firebase values
src/main.tsx            (replace)
src/App.tsx             (replace)
src/types.ts
src/constants.ts
src/utils/format.ts
src/services/firebase.ts
src/services/api.ts
src/auth/AuthContext.tsx
src/auth/ProtectedRoute.tsx
src/cart/CartContext.tsx
src/components/  Header, ProductCard, Loader, ErrorMessage, EmptyState
src/pages/       Login, Catalog, ProductDetails, Cart, Orders, Account, Confirmation
src/styles/global.css
```

`frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```
Optional: change `<title>` in `frontend/index.html` to `SportsShop`.

```bash
npm run dev      # http://localhost:5173
```

---

## 4. Test the JWT API with Postman

1. Postman > **Import** both files from `postman/`:
   - `SportsShop.postman_collection.json`
   - `SportsShop.local.postman_environment.json`
2. Select environment **Sports Shop - Local** (top-right) and fill: `firebaseApiKey` (the web `apiKey`), `email`, `password`.
3. Run folder **0. Auth > Sign up** once, later **Sign in** (stores `idToken`, a JWT, in the environment; it expires after ~1 hour -> run Sign in again).
4. Run the folders in order (Collection Runner works too): 1 Public -> 2 JWT security -> 3 User -> 4 Cart -> 5 Orders.
   Every request has tests; all should be green.

How the JWT flows: Firebase signs the token -> Postman/React sends `Authorization: Bearer <idToken>` -> `FirebaseTokenFilter` verifies it with the Admin SDK -> controllers read the user id from the verified token only.

---

## 5. Acceptance checklist (PRD section 14)

- [ ] Register / sign in / sign out works, lands on catalog
- [ ] Products + images load
- [ ] Category / price filters and sorting change the list
- [ ] Cart survives a browser refresh; qty change + remove work
- [ ] Postman folder 2: missing / invalid token -> 401
- [ ] Checkout creates ONE order with server prices and empties the cart (replay of the same idempotency key returns the same order)
- [ ] Order History shows only your orders (try a second account)
- [ ] Loading / empty / error / validation states look right on desktop and phone width

---

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| `FileNotFoundException: ./serviceAccountKey.json` | Run from `backend/` or set `FIREBASE_CREDENTIALS_PATH` to the absolute path |
| Seeding failed / `NOT_FOUND` / `PERMISSION_DENIED` | Create the Firestore database in the console; confirm the key belongs to the same project |
| CORS error in browser | `app.cors.allowed-origins` must equal your frontend origin (`http://localhost:5173`) |
| Every request 401 | Token expired (re-run Sign in) or the key/web config belong to different Firebase projects |
| Images are placeholders | Upload to `products/<id>.jpg`, publish storage rules, check `firebase.storage-bucket` |
| `auth/invalid-api-key` in browser | Fill `frontend/.env`, then restart `npm run dev` |
| Postman Sign up returns `OPERATION_NOT_ALLOWED` | Enable Email/Password in Firebase Auth |

## 7. Security reminders
- Rotate the service-account key if it ever leaks. Never commit `.env` or `serviceAccountKey.json`.
- Browsers never touch Firestore directly (rules deny all); everything goes through the Kotlin API.
- Deploy only over HTTPS and set `CORS_ALLOWED_ORIGINS` to your real domain.
