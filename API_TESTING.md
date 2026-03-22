# API Testing Guide - cURL Commands

## Prerequisites
- XAMPP running (Apache + MySQL)
- Backend accessible at `http://localhost/muscle-map/api/`
- Test using PowerShell, Git Bash, or cURL command line

---

## 1. Test Registration

### Register new user
```powershell
$body = @{
    full_name = "John Doe"
    email = "john@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost/muscle-map/api/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

### Using cURL
```bash
curl -X POST http://localhost/muscle-map/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 2. Test Login

### Login with existing user
```powershell
$body = @{
    email = "demo@musclemap.com"
    password = "Demo@123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost/muscle-map/api/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Using cURL
```bash
curl -X POST http://localhost/muscle-map/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@musclemap.com",
    "password": "Demo@123"
  }'
```

---

## 3. Test Onboarding

### Save onboarding data (requires active session/login)
```powershell
$body = @{
    gymFrequency = "3-4 times per week"
    expertiseLevel = "Intermediate"
    height = "175"
    weight = "75"
    dailyCalories = "2500"
    dietPreference = "Balanced"
    workoutPlan = "Other"
    workoutTime = "Morning"
    goals = @("Build Muscle", "Get Stronger")
    allergies = "None"
    supplements = "Whey Protein"
    medicalConditions = "None"
    username = "johndoe"
    bio = "Fitness enthusiast"
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "http://localhost/muscle-map/api/onboarding" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body `
    -SessionVariable "session"

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Using cURL
```bash
curl -X POST http://localhost/muscle-map/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

## 4. Check Database

### View all users
```bash
mysql -u root muscle_map -e "SELECT id, username, email, full_name, created_at FROM users;"
```

### View user stats
```bash
mysql -u root muscle_map -e "SELECT * FROM user_stats;"
```

### View fitness profiles
```bash
mysql -u root muscle_map -e "SELECT * FROM user_fitness_profiles;"
```

### Delete a test user
```bash
mysql -u root muscle_map -e "DELETE FROM users WHERE email = 'test@example.com';"
```

---

## Expected Response Examples

### Successful Registration
```json
{
  "message": "User registered successfully",
  "user_id": 2
}
```

### Successful Login
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "demo@musclemap.com",
    "full_name": "Demo User"
  }
}
```

### Successful Onboarding
```json
{
  "message": "Onboarding data saved successfully",
  "user_id": 1
}
```

### Error Response
```json
{
  "error": "Email already exists"
}
```

---

## Troubleshooting

### Connection Refused
- Ensure XAMPP Apache and MySQL are running
- Check URL is correct: `http://localhost/muscle-map/api/`

### CORS Issues
- The API has CORS headers enabled for local development
- Request must include `Content-Type: application/json` header

### Session/Authentication Errors
- Onboarding endpoint requires active session
- Must login first before calling onboarding endpoint

### Database Errors
- Check MySQL is running
- Verify `.env` file has correct credentials
- Run schema.sql if tables don't exist

