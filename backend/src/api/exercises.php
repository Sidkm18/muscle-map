<?php

use App\config\DatabaseConfig;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$db = (new DatabaseConfig())->getConnection();

try {
    $stmt = $db->prepare("SELECT * FROM exercises");
    $stmt->execute();
    $exercises = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['exercises' => $exercises]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
