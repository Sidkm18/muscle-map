<?php

require_once __DIR__ . '/../bootstrap.php';

if (!isset($_SESSION['user_id'])) {
    mm_json(['error' => 'Not authenticated'], 401);
}

$db = mm_db();

try {
    $stmt = $db->prepare('SELECT id, username, email, full_name, bio, profile_photo, created_at FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => (int) $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user) {
        mm_json(['error' => 'Not authenticated'], 401);
    }

    mm_json(['user' => $user]);
} catch (PDOException $exception) {
    error_log('Me endpoint failed: ' . $exception->getMessage());
    mm_json(['error' => 'Unable to load current user'], 500);
}
