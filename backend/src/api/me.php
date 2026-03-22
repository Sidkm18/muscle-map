<?php

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

echo json_encode([
    'user' => [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['email']
    ]
]);
