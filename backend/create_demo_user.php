<?php
// Simple script to create a test user
require_once __DIR__ . '/src/bootstrap.php';

$demo_password = 'Demo@123';
$password_hash = password_hash($demo_password, PASSWORD_DEFAULT);

echo "Password hash for 'Demo@123': " . $password_hash . "\n";

$db = mm_db();

try {
    $db->beginTransaction();

    // Insert demo user
    $username = 'demo_user';
    $email = 'demo@musclemap.com';
    $full_name = 'Demo User';
    
    $stmt = $db->prepare('
        INSERT INTO users (username, email, password_hash, full_name)
        VALUES (:username, :email, :password_hash, :full_name)
        ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            password_hash = VALUES(password_hash),
            full_name = VALUES(full_name)
    ');
    
    $stmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':password_hash' => $password_hash,
        ':full_name' => $full_name,
    ]);

    $stmt = $db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();
    $user_id = $user ? (int) $user['id'] : null;

    if ($user_id === null) {
        throw new RuntimeException('Demo user could not be located after insert');
    }

    $stmt = $db->prepare('INSERT INTO user_stats (user_id) VALUES (:user_id) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)');
    $stmt->execute([':user_id' => $user_id]);

    $stmt = $db->prepare('INSERT INTO user_fitness_profiles (user_id) VALUES (:user_id) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)');
    $stmt->execute([':user_id' => $user_id]);

    $db->commit();

    echo "Demo user created successfully!\n";
    echo "User ID: $user_id\n";
    echo "Email: demo@musclemap.com\n";
    echo "Password: Demo@123\n";
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "Error: " . $e->getMessage() . "\n";
}
