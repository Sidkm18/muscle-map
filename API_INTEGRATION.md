# MuscleMap Frontend-Backend Integration Guide

## Overview
This document describes the current frontend/backend contract used by the PHP API, the browser runtime, and the MySQL schema.

The current app uses:
- `database/schema.sql` as the canonical schema
- `database/seed.sql` for demo data
- `database/db.sql` as a legacy reference model only
- cookie sessions as the source of truth for authentication
- `GET /api/me` for session checks in the frontend runtime

The browser sends API requests with `credentials: 'include'`, and session-authenticated write requests include an `X-CSRF-Token` header obtained from `GET /api/me`, `POST /api/login`, or `POST /api/register`.

## Database Setup

### Tables Created
1. **users** - Main user table with profile information
2. **user_stats** - Physical stats (height, weight, BMI, calories)
3. **user_fitness_profiles** - Fitness preferences and goals
4. **memberships** - Subscription and billing summary information

The database is created from `database/schema.sql`.

## API Endpoints

### 1. Session Endpoint
**GET** `/api/me`

**Response (Anonymous):**
```json
{
  "authenticated": false,
  "user": null
}
```

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name",
    "username": "username"
  },
  "csrf_token": "..."
}
```

---

### 2. Pricing Endpoint
**GET** `/api/pricing`

Returns the public pricing catalog used by the pricing page and subscribe flow.

---

### 3. Login Endpoint
**POST** `/api/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "authenticated": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name",
    "username": "username"
  },
  "csrf_token": "..."
}
```

**Response (Error):**
```json
{
  "error": "Invalid password"
}
```

---

### 4. Registration Endpoint
**POST** `/api/register`

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "user_id": 2,
  "authenticated": true,
  "user": {
    "id": 2,
    "email": "john@example.com",
    "full_name": "John Doe",
    "username": "john"
  },
  "csrf_token": "..."
}
```

**Response (Error):**
```json
{
  "error": "Email already exists"
}
```

---

### 5. Onboarding Endpoint
**POST** `/api/onboarding`

**Requires:** Active session and valid `X-CSRF-Token`

**Request:**
```json
{
  "gymFrequency": "3-4 times per week",
  "expertiseLevel": "Intermediate",
  "height": "175",
  "weight": "75",
  "dailyCalories": "2500",
  "dietPreference": "Balanced",
  "workoutPlan": "Other",
  "workoutTime": "Morning",
  "goals": ["Build Muscle", "Get Stronger"],
  "allergies": "None",
  "supplements": "Whey Protein",
  "medicalConditions": "None",
  "username": "johndoe",
  "bio": "Fitness enthusiast"
}
```

**Response (Success):**
```json
{
  "message": "Onboarding data saved successfully",
  "user_id": 1
}
```

---

### 6. Subscribe Endpoint
**POST** `/api/subscribe`

**Requires:** Active session and valid `X-CSRF-Token`

**Request:**
```json
{
  "plan_name": "pro",
  "duration_months": 3
}
```

**Response (Success):**
```json
{
  "message": "Subscribed to Pro successfully",
  "membership": {
    "plan_name": "pro",
    "duration_months": 3,
    "renewal_date": "2026-07-22",
    "status": "Active"
  },
  "pricing": {
    "currency": "INR",
    "monthly_price": 250,
    "base_amount": 750,
    "discount_percent": 5,
    "discount_amount": 37.5,
    "total_amount": 712.5
  }
}
```

---

## Frontend Data Flow

### Login Page (`frontend/pages/login.html`)
1. User enters email and password
2. Submits form → `frontend/js/login.js`
3. JavaScript sends POST request to `/api/login`
4. On success: runtime caches server session state, redirects to profile

### Registration Page (`frontend/pages/register.html`)
1. User fills registration form
2. Submits form → `frontend/js/register.js`
3. JavaScript sends POST request to `/api/register`
4. On success: runtime caches server session state, redirects to onboarding

### Onboarding Page (`frontend/pages/onboarding.html`)
1. User fills multi-step onboarding form
2. On final submit → `frontend/js/onboarding.js`
3. Collects all form data in `formData` object
4. Sends POST request to `/api/onboarding`
5. On success: clears localStorage cache, redirects to menu

### Exercises Page (`frontend/pages/exercises.html`)
1. Loads `frontend/js/exercises.js`
2. Requests `/api/exercises`
3. Falls back to the bundled local dataset only when the API is unavailable

### Pricing Page (`frontend/pages/pricing.html`)
1. Loads `frontend/js/pricing.js`
2. Requests `/api/pricing`
3. When signed in, sends `POST /api/subscribe`
4. When anonymous, redirects to login instead of relying on a local auth flag

---

## Testing the Integration

### Test User
- **Email:** demo@musclemap.com
- **Password:** Demo@123
- **Name:** Demo User

### Manual Testing Steps

1. **Test Login:**
   ```
   POST http://localhost/muscle-map/api/login
   Content-Type: application/json
   
   {
     "email": "demo@musclemap.com",
     "password": "Demo@123"
   }
   ```

2. **Test Registration:**
   Replace credentials with new user details in the registration form

3. **Test Onboarding:**
   After login, complete the onboarding form to see fitness profile updates

---

## File Structure

```
muscle-map/
├── backend/
│   ├── src/api/
│   │   ├── login.php          (Login endpoint)
│   │   ├── register.php       (Registration endpoint)
│   │   └── onboarding.php     (Onboarding endpoint - NEW)
│   ├── src/config/
│   │   ├── DatabaseConfig.php (DB connection)
│   │   └── Env.php           (Environment loader)
│   ├── .env                   (Database config - NEW)
│   └── public/index.php       (Router)
│
├── frontend/
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   └── onboarding.html
│   └── js/
│       ├── login.js           (Updated to call API)
│       ├── register.js        (Updated to call API)
│       └── onboarding.js      (Updated to call API)
│
├── database/
│   ├── schema.sql            (Database schema - UPDATED)
│   └── seed.sql
```

---

## Database Configuration

The application uses the following default database settings (can be overridden via `.env`):
- **Host:** 127.0.0.1
- **Port:** 3306
- **Database:** muscle_map
- **Username:** root
- **Password:** (empty)

To modify these settings, edit `backend/.env`:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=muscle_map
DB_USERNAME=root
DB_PASSWORD=
```

---

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing fields)
- `401` - Unauthorized (invalid credentials)
- `405` - Method Not Allowed
- `409` - Conflict (email exists)
- `500` - Server Error

Frontend JavaScript catches these errors and displays toast notifications to the user.

---

## Next Steps

The following features can be added:
1. Profile management endpoint
2. Exercises and workouts endpoints
3. Progress tracking endpoints
4. Social features (referrals, friend requests)
5. Subscription management
