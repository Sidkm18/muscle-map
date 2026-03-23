<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

$data = mm_request_body();
$email = trim((string) ($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    mm_json(['error' => 'Missing required fields'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    mm_json(['error' => 'Invalid email address'], 400);
}

$db = mm_db();

try {
    $stmt = $db->prepare('SELECT id, email, password_hash, full_name, username FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) {
        mm_json(['error' => 'User not found'], 401);
    }

    if (!password_verify($password, $user['password_hash'])) {
        mm_json(['error' => 'Invalid password'], 401);
    }

    mm_start_session_user($user);

    mm_json([
        'message' => 'Login successful',
        'user' => [
            'id' => (int) $user['id'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'username' => $user['username'],
        ],
    ]);
} catch (PDOException $exception) {
    error_log('Login failed: ' . $exception->getMessage());
    mm_json(['error' => 'Login failed'], 500);
}
