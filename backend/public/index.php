<?php

require_once __DIR__ . '/../src/bootstrap.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if ($origin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if (preg_match('#(?:^|/)api(?:/|$)(?P<endpoint>[A-Za-z0-9_-]+)?/?$#', $uriPath, $matches)) {
    $endpoint = $matches['endpoint'] ?? '';

    if ($endpoint === '') {
        mm_json([
            'status' => 'ok',
            'message' => 'MuscleMap API is running.',
            'endpoints' => [
                'GET /api/exercises',
                'GET /api/me',
                'GET /api/profile',
                'POST /api/login',
                'POST /api/register',
                'POST /api/onboarding',
                'POST /api/subscribe',
                'POST /api/logout',
            ],
        ]);
    }

    $controllerPath = __DIR__ . '/../src/api/' . $endpoint . '.php';
    if (is_file($controllerPath)) {
        require $controllerPath;
        exit();
    }

    mm_json(['error' => 'API Endpoint Not Found'], 404);
}

header('Content-Type: text/plain; charset=UTF-8');
echo 'MuscleMap API is running.';
