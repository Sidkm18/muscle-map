<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

$data = mm_filter_request([
    'full_name' => [
        'type' => 'string',
        'max_length' => 120,
        'min_length' => 2,
        'empty_to_null' => true,
    ],
    'email' => [
        'type' => 'email',
        'required' => true,
        'allow_empty' => false,
    ],
    'password' => [
        'type' => 'password',
        'required' => true,
        'min_length' => 8,
        'max_length' => 255,
    ],
]);

$email = $data['email'];
$password = $data['password'];
$fullName = $data['full_name'];

$db = mm_db();

try {
    $db->beginTransaction();

    $stmt = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        $db->rollBack();
        mm_json(['error' => 'Email already exists'], 409);
    }

    $usernameBase = mm_username_from_email($email);
    $username = $usernameBase;
    $counter = 1;

    while (true) {
        $stmt = $db->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
        $stmt->execute([':username' => $username]);
        if (!$stmt->fetch()) {
            break;
        }

        $username = $usernameBase . $counter;
        $counter++;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $db->prepare('
        INSERT INTO users (username, email, password_hash, full_name)
        VALUES (:username, :email, :password_hash, :full_name)
    ');
    $stmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':password_hash' => $passwordHash,
        ':full_name' => $fullName,
    ]);

    $userId = (int) $db->lastInsertId();

    $stmt = $db->prepare('INSERT INTO user_stats (user_id) VALUES (:user_id)');
    $stmt->execute([':user_id' => $userId]);

    $stmt = $db->prepare('INSERT INTO user_fitness_profiles (user_id) VALUES (:user_id)');
    $stmt->execute([':user_id' => $userId]);

    $db->commit();

    $userPayload = [
        'id' => $userId,
        'email' => $email,
        'full_name' => $fullName ?? '',
        'username' => $username,
    ];

    mm_start_session_user($userPayload);

    mm_json(array_merge([
        'message' => 'User registered successfully',
        'user_id' => $userId,
    ], mm_session_payload($userPayload)), 201);
} catch (PDOException $exception) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    error_log('Registration failed: ' . $exception->getMessage());

    if (($exception->getCode() ?? '') === '23000') {
        mm_json(['error' => 'Account already exists'], 409);
    }

    mm_json(['error' => 'Registration failed'], 500);
}
