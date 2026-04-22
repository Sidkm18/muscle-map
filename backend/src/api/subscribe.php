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
    'duration_months' => [
        'type' => 'int',
        'required' => true,
        'min' => 1,
        'max' => 12,
    ],
]);

$db = mm_db();
mm_require_csrf();

try {
    $quote = mm_subscription_quote($data['plan_name'], (int) $data['duration_months']);
} catch (InvalidArgumentException $exception) {
    mm_json(['error' => $exception->getMessage()], 422);
}

try {
    $db->beginTransaction();

    // End old active memberships
    $stmt = $db->prepare("UPDATE memberships SET status = 'Inactive' WHERE user_id = ? AND status = 'Active'");
    $stmt->execute([$userId]);

    // Store billing details when the current schema includes them, but keep
    // backward compatibility with existing XAMPP databases that only have the
    // original membership columns.
    if (
        mm_table_has_column($db, 'memberships', 'billing_duration_months')
        && mm_table_has_column($db, 'memberships', 'monthly_price')
        && mm_table_has_column($db, 'memberships', 'discount_percent')
        && mm_table_has_column($db, 'memberships', 'amount_paid')
    ) {
        $stmt = $db->prepare('
            INSERT INTO memberships (
                user_id,
                plan_name,
                renewal_date,
                billing_duration_months,
                monthly_price,
                discount_percent,
                amount_paid
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $userId,
            $quote['plan_name'],
            $quote['renewal_date'],
            $quote['duration_months'],
            $quote['monthly_price'],
            $quote['discount_percent'],
            $quote['total_amount'],
        ]);
    } else {
        $stmt = $db->prepare('INSERT INTO memberships (user_id, plan_name, renewal_date) VALUES (?, ?, ?)');
        $stmt->execute([$userId, $quote['plan_name'], $quote['renewal_date']]);
    }

    $db->commit();

    mm_json([
        'message' => 'Subscribed to ' . $quote['plan_label'] . ' successfully',
        'membership' => [
            'plan_name' => $quote['plan_name'],
            'duration_months' => $quote['duration_months'],
            'renewal_date' => $quote['renewal_date'],
            'status' => 'Active',
        ],
        'pricing' => [
            'currency' => $quote['currency'],
            'monthly_price' => $quote['monthly_price'],
            'base_amount' => $quote['base_amount'],
            'discount_percent' => $quote['discount_percent'],
            'discount_amount' => $quote['discount_amount'],
            'total_amount' => $quote['total_amount'],
        ],
    ]);
} catch (PDOException $exception) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    error_log('Subscription failed: ' . $exception->getMessage());
    mm_json(['error' => 'Subscription failed'], 500);
}
