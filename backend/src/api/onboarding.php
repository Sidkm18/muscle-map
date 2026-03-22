<?php

use App\config\DatabaseConfig;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Check if user is logged in via session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized. Please login first']);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

$user_id = $_SESSION['user_id'];
$db = (new DatabaseConfig())->getConnection();

try {
    // Update user_stats
    if (isset($data['height']) || isset($data['weight']) || isset($data['dailyCalories'])) {
        $updateFields = [];
        $params = [':user_id' => $user_id];

        if (isset($data['height']) && $data['height']) {
            $updateFields[] = "height = :height";
            $params[':height'] = floatval($data['height']);
        }

        if (isset($data['weight']) && $data['weight']) {
            $updateFields[] = "weight = :weight";
            $params[':weight'] = floatval($data['weight']);
            
            // Calculate BMI if both height and weight are available
            if (isset($data['height']) && $data['height']) {
                $height_m = floatval($data['height']) / 100;
                $bmi = floatval($data['weight']) / ($height_m * $height_m);
                $updateFields[] = "bmi = :bmi";
                $params[':bmi'] = round($bmi, 1);
            }
        }

        if (isset($data['dailyCalories']) && $data['dailyCalories']) {
            $updateFields[] = "daily_calories = :daily_calories";
            $params[':daily_calories'] = intval($data['dailyCalories']);
        }

        if (!empty($updateFields)) {
            $stmt = $db->prepare("UPDATE user_stats SET " . implode(", ", $updateFields) . " WHERE user_id = :user_id");
            $stmt->execute($params);
        }
    }

    // Update user_fitness_profiles
    if (isset($data['gymFrequency']) || isset($data['expertiseLevel']) || isset($data['dietPreference']) || 
        isset($data['workoutPlan']) || isset($data['workoutTime']) || isset($data['goals'])) {
        
        $updateFields = [];
        $params = [':user_id' => $user_id];

        if (isset($data['gymFrequency']) && $data['gymFrequency']) {
            $updateFields[] = "gym_frequency = :gym_frequency";
            $params[':gym_frequency'] = $data['gymFrequency'];
        }

        if (isset($data['expertiseLevel']) && $data['expertiseLevel']) {
            $updateFields[] = "expertise_level = :expertise_level";
            $params[':expertise_level'] = $data['expertiseLevel'];
        }

        if (isset($data['dietPreference']) && $data['dietPreference']) {
            $updateFields[] = "diet_preference = :diet_preference";
            $params[':diet_preference'] = $data['dietPreference'];
        }

        if (isset($data['workoutPlan']) && $data['workoutPlan']) {
            $updateFields[] = "workout_plan = :workout_plan";
            $params[':workout_plan'] = $data['workoutPlan'];
        }

        if (isset($data['workoutTime']) && $data['workoutTime']) {
            $updateFields[] = "workout_time = :workout_time";
            $params[':workout_time'] = $data['workoutTime'];
        }

        if (isset($data['goals']) && !empty($data['goals'])) {
            $goalsJson = json_encode($data['goals']);
            $updateFields[] = "goals = :goals";
            $params[':goals'] = $goalsJson;
        }

        if (isset($data['allergies']) && $data['allergies']) {
            $updateFields[] = "allergies = :allergies";
            $params[':allergies'] = $data['allergies'];
        }

        if (isset($data['supplements']) && $data['supplements']) {
            $updateFields[] = "supplements = :supplements";
            $params[':supplements'] = $data['supplements'];
        }

        if (isset($data['medicalConditions']) && $data['medicalConditions']) {
            $updateFields[] = "medical_conditions = :medical_conditions";
            $params[':medical_conditions'] = $data['medicalConditions'];
        }

        if (!empty($updateFields)) {
            $stmt = $db->prepare("UPDATE user_fitness_profiles SET " . implode(", ", $updateFields) . " WHERE user_id = :user_id");
            $stmt->execute($params);
        }
    }

    // Update user profile information if provided
    if (isset($data['username']) || isset($data['bio']) || isset($data['profilePhoto'])) {
        $updateFields = [];
        $params = [':id' => $user_id];

        if (isset($data['username']) && $data['username']) {
            $updateFields[] = "username = :username";
            $params[':username'] = $data['username'];
        }

        if (isset($data['bio']) && $data['bio']) {
            $updateFields[] = "bio = :bio";
            $params[':bio'] = $data['bio'];
        }

        if (isset($data['profilePhoto']) && $data['profilePhoto']) {
            $updateFields[] = "profile_photo = :profile_photo";
            $params[':profile_photo'] = $data['profilePhoto'];
        }

        if (!empty($updateFields)) {
            $stmt = $db->prepare("UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = :id");
            $stmt->execute($params);
        }
    }

    http_response_code(200);
    echo json_encode([
        'message' => 'Onboarding data saved successfully',
        'user_id' => $user_id
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
