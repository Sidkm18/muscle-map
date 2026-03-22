<?php

use App\config\DatabaseConfig;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$db = (new DatabaseConfig())->getConnection();

// Check if email already exists
$stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
$stmt->bindParam(':email', $data->email);
$stmt->execute();
if ($stmt->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already exists']);
    exit();
}

$password_hash = password_hash($data->password, PASSWORD_DEFAULT);
$username = explode('@', $data->email)[0] . rand(1000, 9999);

try {
    $full_name = isset($data->full_name) ? $data->full_name : '';
    $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, full_name) VALUES (:username, :email, :password_hash, :full_name)");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':password_hash', $password_hash);
    $stmt->bindParam(':full_name', $full_name);
    
    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();

        // Create empty associated records
        $db->query("INSERT INTO user_stats (user_id) VALUES ($user_id)");
        $db->query("INSERT INTO user_fitness_profiles (user_id) VALUES ($user_id)");

        http_response_code(201);
        echo json_encode(['message' => 'User registered successfully', 'user_id' => $user_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
