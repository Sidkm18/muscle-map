<?php

declare(strict_types=1);

// Normalize requests like /muscle-map/api/login so the backend router can
// resolve them as /api/login regardless of the project folder name.
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/api', PHP_URL_PATH) ?: '/api';
$apiMarker = '/api/';
$apiPosition = strpos($requestUri, $apiMarker);

if ($apiPosition !== false) {
    $_SERVER['REQUEST_URI'] = substr($requestUri, $apiPosition);
} else {
    $_SERVER['REQUEST_URI'] = '/api';
}

require __DIR__ . '/../backend/public/index.php';
