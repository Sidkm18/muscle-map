<?php

require_once __DIR__ . '/../src/bootstrap.php';

use App\Controllers\ExerciseController;
use App\Controllers\UserController;
use App\Core\Router;

mm_apply_api_security();

$router = new Router();

// ------------------------------------------------------------------
// API info
// ------------------------------------------------------------------
$router->get('/api', static function (): void {
    mm_json([
        'status'    => 'ok',
        'message'   => 'MuscleMap API is running.',
        'endpoints' => [
            'GET  /api',
            'GET  /api/exercises',
            'GET  /api/exercises/{id}',
            'GET  /api/me',
            'GET  /api/profile',
            'POST /api/login',
            'POST /api/register',
            'POST /api/onboarding',
            'POST /api/subscribe',
            'POST /api/logout',
            'PUT  /api/profile',
        ],
    ]);
});

// ------------------------------------------------------------------
// Exercise routes
// ------------------------------------------------------------------
$router->get('/api/exercises',      [ExerciseController::class, 'index']);
$router->get('/api/exercises/{id}', [ExerciseController::class, 'show']);

// ------------------------------------------------------------------
// Auth routes
// ------------------------------------------------------------------
$router->post('/api/login',    [UserController::class, 'login']);
$router->post('/api/register', [UserController::class, 'register']);
$router->post('/api/logout',   [UserController::class, 'logout']);

// ------------------------------------------------------------------
// User routes
// ------------------------------------------------------------------
$router->get('/api/me', [UserController::class, 'me']);
$router->match(['GET', 'PUT'], '/api/profile',    [UserController::class, 'profile']);
$router->post('/api/onboarding', [UserController::class, 'onboarding']);
$router->post('/api/subscribe',  [UserController::class, 'subscribe']);

// ------------------------------------------------------------------
// Dispatch
// ------------------------------------------------------------------
$router->dispatch(
    $_SERVER['REQUEST_METHOD'] ?? 'GET',
    $_SERVER['REQUEST_URI']    ?? '/api'
);
