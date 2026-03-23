<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

if (!isset($_SESSION['user_id'])) {
    mm_json(['error' => 'Not authenticated'], 401);
}

$data = mm_request_body();

if (!isset($data['plan_name']) || trim((string) $data['plan_name']) === '') {
    mm_json(['error' => 'Missing plan name'], 400);
}

$userId = (int) $_SESSION['user_id'];
$db = mm_db();

try {
    $db->beginTransaction();

    // End old active memberships
    $stmt = $db->prepare("UPDATE memberships SET status = 'Inactive' WHERE user_id = ? AND status = 'Active'");
    $stmt->execute([$userId]);

    // Create new membership (1 year arbitrarily)
    $renewal = date('Y-m-d', strtotime('+1 year'));
    $stmt = $db->prepare('INSERT INTO memberships (user_id, plan_name, renewal_date) VALUES (?, ?, ?)');
    $stmt->execute([$userId, $data['plan_name'], $renewal]);

    $db->commit();

    mm_json(['message' => 'Subscribed to ' . $data['plan_name'] . ' successfully']);
} catch (PDOException $exception) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    error_log('Subscription failed: ' . $exception->getMessage());
    mm_json(['error' => 'Subscription failed'], 500);
}
