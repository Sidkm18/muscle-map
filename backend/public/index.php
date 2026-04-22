<?php

require_once __DIR__ . '/../src/bootstrap.php';

mm_apply_api_security();

$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$normalizedPath = '/' . ltrim(trim($uriPath), '/');
$normalizedPath = $normalizedPath === '/api' ? $normalizedPath : rtrim($normalizedPath, '/');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if (str_starts_with($normalizedPath, '/api')) {
    if ($normalizedPath === '/api') {
        mm_json([
            'status' => 'ok',
            'message' => 'MuscleMap API is running.',
            'endpoints' => mm_public_endpoint_list(),
        ]);
    }

    $route = mm_find_api_route($method, $normalizedPath);
    if ($route !== null) {
        require __DIR__ . '/../src/api/' . $route['endpoint'] . '.php';
        exit();
    }

    mm_json(['error' => 'API Endpoint Not Found'], 404);
}

header('Content-Type: text/plain; charset=UTF-8');
echo 'MuscleMap API is running.';
