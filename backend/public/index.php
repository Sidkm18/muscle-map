<?php

// CORS Headers for local development
header('Access-Control-Allow-Origin: *'); // Allow all for simplicity locally
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';

use App\config\Env;

// Load Env
Env::load(__DIR__ . '/../.env');

// Start session to store logged in user info
session_start();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Extremely simple router
if (preg_match('/^\/api\/(.*)$/', $uri, $matches)) {
    $endpoint = $matches[1];
    $controllerPath = __DIR__ . '/../src/api/' . $endpoint . '.php';
    if (file_exists($controllerPath)) {
        require $controllerPath;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'API Endpoint Not Found']);
    }
} else {
    echo "MuscleMap API is running.";
}

