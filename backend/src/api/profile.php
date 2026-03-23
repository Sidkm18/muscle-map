<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method(['GET', 'PUT']);

$userId = mm_require_auth();
$db = mm_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch profile data
    try {
        $stmt = $db->prepare('SELECT id, username, email, full_name, phone, gender, dob, bio, profile_photo, created_at FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        $stmt = $db->prepare('SELECT * FROM user_stats WHERE user_id = ?');
        $stmt->execute([$userId]);
        $stats = $stmt->fetch();

        $stmt = $db->prepare('SELECT * FROM user_fitness_profiles WHERE user_id = ?');
        $stmt->execute([$userId]);
        $fitness = $stmt->fetch();

        $stmt = $db->prepare("SELECT * FROM memberships WHERE user_id = ? AND status = 'Active' ORDER BY id DESC LIMIT 1");
        $stmt->execute([$userId]);
        $membership = $stmt->fetch();

        mm_json([
            'user' => $user,
            'stats' => $stats,
            'fitness' => $fitness,
            'membership' => $membership
        ]);
    } catch (PDOException $e) {
        error_log('Profile fetch failed: ' . $e->getMessage());
        mm_json(['error' => 'Unable to load profile'], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = mm_filter_request([
        'full_name' => [
            'type' => 'string',
            'min_length' => 2,
            'max_length' => 120,
            'allow_empty' => false,
        ],
        'phone' => [
            'type' => 'phone',
            'empty_to_null' => true,
        ],
        'gender' => [
            'type' => 'enum',
            'empty_to_null' => true,
            'values' => ['Male', 'Female', 'Other', 'Prefer Not to Say'],
        ],
        'dob' => [
            'type' => 'date',
            'empty_to_null' => true,
            'not_in_future' => true,
        ],
        'bio' => [
            'type' => 'string',
            'empty_to_null' => true,
            'max_length' => 500,
            'preserve_newlines' => true,
        ],
        'username' => [
            'type' => 'username',
        ],
        'profile_photo' => [
            'type' => 'image_data_url',
            'empty_to_null' => true,
            'max_length' => 7340032,
        ],
    ]);

    $updates = [];
    $params = [':user_id' => $userId];
    
    try {
        if (array_key_exists('full_name', $data)) {
            $updates[] = 'full_name = :full_name';
            $params[':full_name'] = $data['full_name'];
        }

        if (array_key_exists('phone', $data)) {
            $updates[] = 'phone = :phone';
            $params[':phone'] = $data['phone'];
        }

        if (array_key_exists('gender', $data)) {
            $updates[] = 'gender = :gender';
            $params[':gender'] = $data['gender'] ?? 'Prefer Not to Say';
        }

        if (array_key_exists('dob', $data)) {
            $updates[] = 'dob = :dob';
            $params[':dob'] = $data['dob'];
        }

        if (array_key_exists('bio', $data)) {
            $updates[] = 'bio = :bio';
            $params[':bio'] = $data['bio'];
        }

        if (array_key_exists('username', $data)) {
            $updates[] = 'username = :username';
            $params[':username'] = $data['username'];
        }

        if (array_key_exists('profile_photo', $data)) {
            $updates[] = 'profile_photo = :profile_photo';
            $params[':profile_photo'] = $data['profile_photo'];
        }

        if (empty($updates)) {
            mm_json(['error' => 'No profile fields provided'], 400);
        }

        $stmt = $db->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = :user_id');
        $stmt->execute($params);

        mm_json(['message' => 'Profile updated successfully']);
    } catch (PDOException $e) {
        error_log('Profile update failed: ' . $e->getMessage());

        if (($e->getCode() ?? '') === '23000') {
            mm_json(['error' => 'Profile update conflicts with an existing record'], 409);
        }

        mm_json(['error' => 'Unable to update profile'], 500);
    }
}
