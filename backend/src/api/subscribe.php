<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

$userId = mm_require_auth();

$data = mm_filter_request([
    'plan_name' => [
        'type' => 'string',
        'required' => true,
        'allow_empty' => false,
        'max_length' => 50,
        'transform' => 'lower',
        'regex' => '/^(basic|pro|elite)$/',
    ],
]);

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
