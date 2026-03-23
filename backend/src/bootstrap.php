<?php

declare(strict_types=1);

use App\config\DatabaseConfig;
use App\config\Env;

if (!function_exists('mm_bootstrap')) {
    function mm_bootstrap(): void
    {
        static $bootstrapped = false;

        if ($bootstrapped) {
            return;
        }

        require_once __DIR__ . '/../vendor/autoload.php';
        Env::load(__DIR__ . '/../.env');

        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }

        $bootstrapped = true;
    }
}

if (!function_exists('mm_json')) {
    function mm_json(array $payload, int $status = 200): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit();
    }
}

if (!function_exists('mm_require_method')) {
    function mm_require_method(string|array $methods): void
    {
        $allowed = array_map('strtoupper', (array) $methods);
        $current = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        if (!in_array($current, $allowed, true)) {
            mm_json(['error' => 'Method not allowed'], 405);
        }
    }
}

if (!function_exists('mm_request_body')) {
    function mm_request_body(): array
    {
        $rawBody = file_get_contents('php://input');
        if ($rawBody === false || trim($rawBody) === '') {
            return [];
        }

        $decoded = json_decode($rawBody, true);
        if (!is_array($decoded)) {
            mm_json(['error' => 'Invalid JSON payload'], 400);
        }

        return $decoded;
    }
}

if (!function_exists('mm_db')) {
    function mm_db()
    {
        static $connection = null;

        if ($connection instanceof PDO) {
            return $connection;
        }

        try {
            $connection = (new DatabaseConfig())->getConnection();
        } catch (Throwable $exception) {
            error_log('Database connection error: ' . $exception->getMessage());
            mm_json(['error' => 'Database connection failed'], 500);
        }

        if (!$connection instanceof PDO) {
            mm_json(['error' => 'Database connection failed'], 500);
        }

        return $connection;
    }
}

if (!function_exists('mm_username_from_email')) {
    function mm_username_from_email(string $email): string
    {
        $localPart = strtolower((string) strstr($email, '@', true));
        $candidate = preg_replace('/[^a-z0-9_]+/i', '_', $localPart ?: 'user');
        $candidate = trim((string) preg_replace('/_+/', '_', $candidate), '_');

        return $candidate !== '' ? $candidate : 'user';
    }
}

if (!function_exists('mm_start_session_user')) {
    function mm_start_session_user(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        $_SESSION['email'] = (string) $user['email'];
    }
}

if (!function_exists('mm_destroy_session')) {
    function mm_destroy_session(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            return;
        }

        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
        }

        session_destroy();
    }
}

mm_bootstrap();
