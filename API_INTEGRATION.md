# MuscleMap Frontend-Backend Integration Guide

## Overview
This document explains how the frontend pages (login, registration, onboarding) are now connected to the PHP backend and MySQL database.

## Database Setup

### Tables Created
1. **users** - Main user table with profile information
2. **user_stats** - Physical stats (height, weight, BMI, calories)
3. **user_fitness_profiles** - Fitness preferences and goals
4. **memberships** - Subscription information

The database is automatically created via `database/schema.sql`.

## API Endpoints

### 1. Login Endpoint
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
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "User Name"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid password"
}
```

---

### 2. Registration Endpoint
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
  "user_id": 2
}
```

**Response (Error):**
```json
{
  "error": "Email already exists"
}
```

---

### 3. Onboarding Endpoint
**POST** `/api/onboarding`

**Requires:** Active session (user must be logged in)

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

## Frontend Data Flow

### Login Page (`frontend/pages/login.html`)
1. User enters email and password
2. Submits form → `frontend/js/login.js`
3. JavaScript sends POST request to `/api/login`
4. On success: stores user data in localStorage, redirects to onboarding

### Registration Page (`frontend/pages/register.html`)
1. User fills registration form
2. Submits form → `frontend/js/register.js`
3. JavaScript sends POST request to `/api/register`
4. On success: stores user data, redirects to onboarding

### Onboarding Page (`frontend/pages/onboarding.html`)
1. User fills multi-step onboarding form
2. On final submit → `frontend/js/onboarding.js`
3. Collects all form data in `formData` object
4. Sends POST request to `/api/onboarding`
5. On success: clears localStorage cache, redirects to menu

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
