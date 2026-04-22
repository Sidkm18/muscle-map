<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('GET');

if (!mm_is_authenticated()) {
    mm_json([
        'authenticated' => false,
        'user' => null,
    ]);
}

$userId = mm_require_auth();

try {
    $db = mm_db();
    $stmt = $db->prepare('SELECT id, username, email, full_name, bio, profile_photo, created_at FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        mm_destroy_session();
        mm_json([
            'authenticated' => false,
            'user' => null,
        ]);
    }

    mm_json(mm_session_payload([
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'full_name' => $user['full_name'],
        'bio' => $user['bio'],
        'profile_photo' => $user['profile_photo'],
        'created_at' => $user['created_at'],
    ]));
} catch (PDOException $exception) {
    error_log('Me endpoint failed: ' . $exception->getMessage());
    mm_json(['error' => 'Unable to load current user'], 500);
}
