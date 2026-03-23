<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

if (!isset($_SESSION['user_id'])) {
    mm_json(['error' => 'Unauthorized. Please login first'], 401);
}

$data = mm_request_body();
$userId = (int) $_SESSION['user_id'];
$db = mm_db();

try {
    $db->beginTransaction();

    // Update user_stats
    if (array_key_exists('height', $data) || array_key_exists('weight', $data) || array_key_exists('dailyCalories', $data)) {
        $updateFields = [];
        $params = [':user_id' => $userId];

        if (isset($data['height']) && $data['height'] !== '') {
            $updateFields[] = "height = :height";
            $params[':height'] = floatval($data['height']);
        }

        if (isset($data['weight']) && $data['weight'] !== '') {
            $updateFields[] = "weight = :weight";
            $params[':weight'] = floatval($data['weight']);
            
            // Calculate BMI if both height and weight are available
            if (isset($data['height']) && $data['height'] !== '') {
                $height_m = floatval($data['height']) / 100;
                $bmi = floatval($data['weight']) / ($height_m * $height_m);
                $updateFields[] = "bmi = :bmi";
                $params[':bmi'] = round($bmi, 1);
            }
        }

        if (isset($data['dailyCalories']) && $data['dailyCalories'] !== '') {
            $updateFields[] = "daily_calories = :daily_calories";
            $params[':daily_calories'] = intval($data['dailyCalories']);
        }

        if (!empty($updateFields)) {
            $stmt = $db->prepare('UPDATE user_stats SET ' . implode(', ', $updateFields) . ' WHERE user_id = :user_id');
            $stmt->execute($params);
        }
    }

    // Update user_fitness_profiles
    if (array_key_exists('gymFrequency', $data) || array_key_exists('expertiseLevel', $data) || array_key_exists('dietPreference', $data) ||
        array_key_exists('workoutPlan', $data) || array_key_exists('workoutTime', $data) || array_key_exists('goals', $data) ||
        array_key_exists('allergies', $data) || array_key_exists('supplements', $data) || array_key_exists('medicalConditions', $data)) {
        
        $updateFields = [];
        $params = [':user_id' => $userId];

        if (isset($data['gymFrequency']) && $data['gymFrequency'] !== '') {
            $updateFields[] = "gym_frequency = :gym_frequency";
            $params[':gym_frequency'] = $data['gymFrequency'];
        }

        if (isset($data['expertiseLevel']) && $data['expertiseLevel'] !== '') {
            $updateFields[] = "expertise_level = :expertise_level";
            $params[':expertise_level'] = $data['expertiseLevel'];
        }

        if (isset($data['dietPreference']) && $data['dietPreference'] !== '') {
            $updateFields[] = "diet_preference = :diet_preference";
            $params[':diet_preference'] = $data['dietPreference'];
        }

        if (isset($data['workoutPlan']) && $data['workoutPlan'] !== '') {
            $updateFields[] = "workout_plan = :workout_plan";
            $params[':workout_plan'] = $data['workoutPlan'];
        }

        if (isset($data['workoutTime']) && $data['workoutTime'] !== '') {
            $updateFields[] = "workout_time = :workout_time";
            $params[':workout_time'] = $data['workoutTime'];
        }

        if (isset($data['goals']) && !empty($data['goals'])) {
            $goalsJson = json_encode($data['goals']);
            $updateFields[] = "goals = :goals";
            $params[':goals'] = $goalsJson;
        }

        if (isset($data['allergies']) && $data['allergies'] !== '') {
            $updateFields[] = "allergies = :allergies";
            $params[':allergies'] = $data['allergies'];
        }

        if (isset($data['supplements']) && $data['supplements'] !== '') {
            $updateFields[] = "supplements = :supplements";
            $params[':supplements'] = $data['supplements'];
        }

        if (isset($data['medicalConditions']) && $data['medicalConditions'] !== '') {
            $updateFields[] = "medical_conditions = :medical_conditions";
            $params[':medical_conditions'] = $data['medicalConditions'];
        }

        if (!empty($updateFields)) {
            $stmt = $db->prepare('UPDATE user_fitness_profiles SET ' . implode(', ', $updateFields) . ' WHERE user_id = :user_id');
            $stmt->execute($params);
        }
    }

    // Update user profile information if provided
    if (array_key_exists('username', $data) || array_key_exists('bio', $data) || array_key_exists('profilePhoto', $data)) {
        $updateFields = [];
        $params = [':id' => $userId];

        if (isset($data['username']) && $data['username'] !== '') {
            $updateFields[] = "username = :username";
            $params[':username'] = $data['username'];
        }

        if (isset($data['bio']) && $data['bio'] !== '') {
            $updateFields[] = "bio = :bio";
            $params[':bio'] = $data['bio'];
        }

        if (isset($data['profilePhoto']) && $data['profilePhoto'] !== '') {
            $updateFields[] = "profile_photo = :profile_photo";
            $params[':profile_photo'] = $data['profilePhoto'];
        }

        if (!empty($updateFields)) {
            $stmt = $db->prepare('UPDATE users SET ' . implode(', ', $updateFields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
    }

    $db->commit();

    mm_json([
        'message' => 'Onboarding data saved successfully',
        'user_id' => $userId,
    ]);
} catch (PDOException $exception) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    error_log('Onboarding save failed: ' . $exception->getMessage());

    if (($exception->getCode() ?? '') === '23000') {
        mm_json(['error' => 'Username already exists'], 409);
    }

    mm_json(['error' => 'Database error'], 500);
}
