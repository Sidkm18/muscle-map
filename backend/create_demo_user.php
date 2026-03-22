<?php
// Simple script to create a test user
require_once __DIR__ . '/vendor/autoload.php';

use App\config\DatabaseConfig;

$demo_password = 'Demo@123';
$password_hash = password_hash($demo_password, PASSWORD_DEFAULT);

echo "Password hash for 'Demo@123': " . $password_hash . "\n";

$db = (new DatabaseConfig())->getConnection();

try {
    // Insert demo user
    $username = 'demo_user';
    $email = 'demo@musclemap.com';
    $full_name = 'Demo User';
    
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, full_name) VALUES (:username, :email, :password_hash, :full_name)");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password_hash', $password_hash);
    $stmt->bindParam(':full_name', $full_name);
    
    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();
        
        // Create user stats
        $db->query("INSERT INTO user_stats (user_id) VALUES ($user_id)");
        
        // Create fitness profile
        $db->query("INSERT INTO user_fitness_profiles (user_id) VALUES ($user_id)");
        
        echo "Demo user created successfully!\n";
        echo "User ID: $user_id\n";
        echo "Email: demo@musclemap.com\n";
        echo "Password: Demo@123\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
