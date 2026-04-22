<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('GET');

$catalog = mm_pricing_catalog();
$plans = [];
$durations = [];

foreach ($catalog['plans'] as $planName => $planConfig) {
    $plans[$planName] = [
        'id' => $planName,
        'label' => $planConfig['label'],
        'monthly_price' => round((float) $planConfig['monthly_price'], 2),
    ];
}

foreach ($catalog['durations'] as $months => $durationConfig) {
    $durations[(string) $months] = [
        'months' => (int) $months,
        'label' => $durationConfig['label'],
        'discount_percent' => round((float) $durationConfig['discount_percent'], 2),
    ];
}

mm_json([
    'currency' => $catalog['currency'],
    'defaults' => $catalog['defaults'],
    'plans' => $plans,
    'durations' => $durations,
]);
