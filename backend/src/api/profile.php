<?php

use App\config\DatabaseConfig;

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit();
}

$user_id = $_SESSION['user_id'];
$db = (new DatabaseConfig())->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch profile data
    try {
        $stmt = $db->prepare("SELECT id, username, email, full_name, phone, gender, dob, bio, profile_photo, created_at FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $db->prepare("SELECT * FROM user_stats WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $db->prepare("SELECT * FROM user_fitness_profiles WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $fitness = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $db->prepare("SELECT * FROM memberships WHERE user_id = ? AND status = 'Active' ORDER BY id DESC LIMIT 1");
        $stmt->execute([$user_id]);
        $membership = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'user' => $user,
            'stats' => $stats,
            'fitness' => $fitness,
            'membership' => $membership
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update profile data
    $data = json_decode(file_get_contents("php://input"));
    
    try {
        if (isset($data->full_name)) {
            $stmt = $db->prepare("UPDATE users SET full_name=?, phone=?, bio=? WHERE id=?");
            $stmt->execute([$data->full_name, $data->phone ?? null, $data->bio ?? null, $user_id]);
        }
        
        echo json_encode(['message' => 'Profile updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
