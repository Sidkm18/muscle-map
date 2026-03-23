<?php

require_once __DIR__ . '/../bootstrap.php';

if (!isset($_SESSION['user_id'])) {
    mm_json(['error' => 'Not authenticated'], 401);
}

$userId = (int) $_SESSION['user_id'];
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
    // Update profile data
    $data = mm_request_body();
    $updates = [];
    $params = [':user_id' => $userId];
    
    try {
        if (isset($data['full_name'])) {
            $updates[] = 'full_name = :full_name';
            $params[':full_name'] = trim((string) $data['full_name']);
        }

        if (isset($data['phone'])) {
            $updates[] = 'phone = :phone';
            $params[':phone'] = trim((string) $data['phone']);
        }

        if (isset($data['bio'])) {
            $updates[] = 'bio = :bio';
            $params[':bio'] = trim((string) $data['bio']);
        }

        if (isset($data['username'])) {
            $updates[] = 'username = :username';
            $params[':username'] = trim((string) $data['username']);
        }

        if (isset($data['profile_photo'])) {
            $updates[] = 'profile_photo = :profile_photo';
            $params[':profile_photo'] = trim((string) $data['profile_photo']);
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
} else {
    mm_json(['error' => 'Method not allowed'], 405);
}
