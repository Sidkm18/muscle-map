<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

$userId = mm_require_auth();
$db = mm_db();
$data = mm_filter_request([
    'fullName' => [
        'type' => 'string',
        'required' => true,
        'allow_empty' => false,
        'min_length' => 2,
        'max_length' => 120,
    ],
    'phone' => [
        'type' => 'phone',
        'empty_to_null' => true,
    ],
    'gender' => [
        'type' => 'enum',
        'required' => true,
        'allow_empty' => false,
        'values' => ['Male', 'Female', 'Other', 'Prefer Not to Say'],
    ],
    'dob' => [
        'type' => 'date',
        'required' => true,
        'allow_empty' => false,
        'not_in_future' => true,
    ],
    'gymFrequency' => [
        'type' => 'enum',
        'required' => true,
        'allow_empty' => false,
        'values' => ['1-2', '3-4', '5+'],
    ],
    'expertiseLevel' => [
        'type' => 'enum',
        'required' => true,
        'allow_empty' => false,
        'values' => ['beginner', 'intermediate', 'advanced'],
    ],
    'height' => [
        'type' => 'float',
        'required' => true,
        'min' => 100,
        'max' => 250,
        'precision' => 2,
    ],
    'weight' => [
        'type' => 'float',
        'required' => true,
        'min' => 30,
        'max' => 200,
        'precision' => 2,
    ],
    'dailyCalories' => [
        'type' => 'int',
        'empty_to_null' => true,
        'min' => 1000,
        'max' => 5000,
    ],
    'dietPreference' => [
        'type' => 'enum',
        'empty_to_null' => true,
        'values' => ['omnivore', 'vegetarian', 'vegan', 'keto'],
    ],
    'workoutPlan' => [
        'type' => 'enum',
        'empty_to_null' => true,
        'values' => ['full-body', 'push-pull-legs', 'upper-lower'],
    ],
    'workoutTime' => [
        'type' => 'enum',
        'empty_to_null' => true,
        'values' => ['morning', 'afternoon', 'evening'],
    ],
    'goals' => [
        'type' => 'string_array',
        'default' => [],
        'values' => ['fat-loss', 'muscle-gain', 'strength', 'endurance'],
        'max_items' => 4,
    ],
    'allergies' => [
        'type' => 'string',
        'empty_to_null' => true,
        'max_length' => 255,
    ],
    'supplements' => [
        'type' => 'string',
        'empty_to_null' => true,
        'max_length' => 255,
    ],
    'medicalConditions' => [
        'type' => 'string',
        'empty_to_null' => true,
        'max_length' => 255,
    ],
    'referralCode' => [
        'type' => 'string',
        'empty_to_null' => true,
        'max_length' => 10,
        'transform' => 'upper',
        'regex' => '/^[A-Z0-9]{6,10}$/',
    ],
    'addFriends' => [
        'type' => 'email',
        'empty_to_null' => true,
    ],
    'username' => [
        'type' => 'username',
        'required' => true,
    ],
    'bio' => [
        'type' => 'string',
        'empty_to_null' => true,
        'max_length' => 180,
        'preserve_newlines' => true,
    ],
    'profilePhoto' => [
        'type' => 'image_data_url',
        'empty_to_null' => true,
        'max_length' => 7340032,
    ],
]);

$fullName = $data['fullName'];
$phone = $data['phone'];
$gender = $data['gender'];
$normalizedDob = $data['dob'];

try {
    $db->beginTransaction();

    $statsParams = [
        ':user_id' => $userId,
        ':height' => $data['height'],
        ':weight' => $data['weight'],
        ':bmi' => round($data['weight'] / (($data['height'] / 100) * ($data['height'] / 100)), 1),
        ':daily_calories' => $data['dailyCalories'],
    ];
    $stmt = $db->prepare('
        UPDATE user_stats
        SET height = :height,
            weight = :weight,
            bmi = :bmi,
            daily_calories = :daily_calories
        WHERE user_id = :user_id
    ');
    $stmt->execute($statsParams);

    $fitnessParams = [
        ':user_id' => $userId,
        ':gym_frequency' => $data['gymFrequency'],
        ':expertise_level' => $data['expertiseLevel'],
        ':diet_preference' => $data['dietPreference'],
        ':workout_plan' => $data['workoutPlan'],
        ':workout_time' => $data['workoutTime'],
        ':goals' => $data['goals'] !== [] ? json_encode($data['goals']) : null,
        ':allergies' => $data['allergies'],
        ':supplements' => $data['supplements'],
        ':medical_conditions' => $data['medicalConditions'],
    ];
    $stmt = $db->prepare('
        UPDATE user_fitness_profiles
        SET gym_frequency = :gym_frequency,
            expertise_level = :expertise_level,
            diet_preference = :diet_preference,
            workout_plan = :workout_plan,
            workout_time = :workout_time,
            goals = :goals,
            allergies = :allergies,
            supplements = :supplements,
            medical_conditions = :medical_conditions
        WHERE user_id = :user_id
    ');
    $stmt->execute($fitnessParams);

    $userParams = [
        ':id' => $userId,
        ':full_name' => $fullName,
        ':phone' => $phone,
        ':gender' => $gender,
        ':dob' => $normalizedDob,
        ':username' => $data['username'],
        ':bio' => $data['bio'],
        ':profile_photo' => $data['profilePhoto'],
    ];
    $stmt = $db->prepare('
        UPDATE users
        SET full_name = :full_name,
            phone = :phone,
            gender = :gender,
            dob = :dob,
            username = :username,
            bio = :bio,
            profile_photo = :profile_photo
        WHERE id = :id
    ');
    $stmt->execute($userParams);

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
