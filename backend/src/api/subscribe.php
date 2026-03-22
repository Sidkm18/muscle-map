<?php

use App\config\DatabaseConfig;

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->plan_name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing plan name']);
    exit();
}

$user_id = $_SESSION['user_id'];
$db = (new DatabaseConfig())->getConnection();

try {
    // End old active memberships
    $stmt = $db->prepare("UPDATE memberships SET status = 'Inactive' WHERE user_id = ? AND status = 'Active'");
    $stmt->execute([$user_id]);

    // Create new membership (1 year arbitrarily)
    $renewal = date('Y-m-d', strtotime('+1 year'));
    $stmt = $db->prepare("INSERT INTO memberships (user_id, plan_name, renewal_date) VALUES (?, ?, ?)");
    $stmt->execute([$user_id, $data->plan_name, $renewal]);

    echo json_encode(['message' => 'Subscribed to ' . $data->plan_name . ' successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
