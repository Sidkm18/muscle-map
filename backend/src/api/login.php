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

try {
    $stmt = $db->prepare("SELECT id, email, password_hash, full_name FROM users WHERE email = :email");
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($data->password, $user['password_hash'])) {
            // Setup session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            
            echo json_encode([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid password']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'User not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
