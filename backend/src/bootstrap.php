<?php

declare(strict_types=1);

use App\Middleware\AuthMiddleware;
use App\Middleware\SecurityMiddleware;
use App\Middleware\ValidationException;
use App\Middleware\ValidationMiddleware;
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
            ini_set('session.use_strict_mode', '1');
            ini_set('session.use_only_cookies', '1');
            ini_set('session.cookie_httponly', '1');
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

        if (!mm_is_authenticated()) {
            mm_restore_session_from_remember_me();
        }

        $bootstrapped = true;
    }
}

if (!function_exists('mm_apply_api_security')) {
    function mm_apply_api_security(): void
    {
        SecurityMiddleware::applyApiSecurity();
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
        if ($rawBody === false) {
            mm_json(['error' => 'Unable to read request body'], 400);
        }

        SecurityMiddleware::assertJsonBodySize($rawBody);

        if (trim($rawBody) === '') {
            return [];
        }

        SecurityMiddleware::assertJsonRequest($rawBody);

        $decoded = json_decode($rawBody, true);
        if (!is_array($decoded)) {
            mm_json(['error' => 'Invalid JSON payload'], 400);
        }

        return $decoded;
    }
}

if (!function_exists('mm_filter_request')) {
    function mm_filter_request(array $schema, array $options = []): array
    {
        try {
            return ValidationMiddleware::filterPayload(mm_request_body(), $schema, $options);
        } catch (ValidationException $exception) {
            mm_json([
                'error' => $exception->getMessage(),
                'details' => $exception->getErrors(),
            ], $exception->getStatusCode());
        }
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

if (!function_exists('mm_require_auth')) {
    function mm_require_auth(): int
    {
        return AuthMiddleware::requireUser();
    }
}

if (!function_exists('mm_is_authenticated')) {
    function mm_is_authenticated(): bool
    {
        $userId = $_SESSION['user_id'] ?? null;

        return is_numeric($userId) && (int) $userId > 0;
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
        unset($_SESSION['csrf_token']);
    }
}

if (!function_exists('mm_remember_me_cookie_name')) {
    function mm_remember_me_cookie_name(): string
    {
        return 'mm_remember_me';
    }
}

if (!function_exists('mm_remember_me_duration')) {
    function mm_remember_me_duration(): int
    {
        $configured = (int) ($_ENV['REMEMBER_ME_TTL'] ?? 0);

        return $configured > 0 ? $configured : 604800;
    }
}

if (!function_exists('mm_remember_me_secret')) {
    function mm_remember_me_secret(): string
    {
        $candidate = trim((string) ($_ENV['REMEMBER_ME_SECRET'] ?? $_ENV['APP_KEY'] ?? ''));

        if ($candidate !== '') {
            return $candidate;
        }

        return hash('sha256', __DIR__ . '|' . session_name() . '|musclemap-remember-me');
    }
}

if (!function_exists('mm_remember_me_cookie_options')) {
    function mm_remember_me_cookie_options(int $expires): array
    {
        return [
            'expires' => $expires,
            'path' => '/',
            'domain' => '',
            'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Lax',
        ];
    }
}

if (!function_exists('mm_clear_remember_me_cookie')) {
    function mm_clear_remember_me_cookie(): void
    {
        setcookie(mm_remember_me_cookie_name(), '', mm_remember_me_cookie_options(time() - 42000));
        unset($_COOKIE[mm_remember_me_cookie_name()]);
    }
}

if (!function_exists('mm_issue_remember_me_cookie')) {
    function mm_issue_remember_me_cookie(array $user): void
    {
        $userId = (int) ($user['id'] ?? 0);
        $email = trim((string) ($user['email'] ?? ''));
        $passwordHash = (string) ($user['password_hash'] ?? '');

        if ($userId <= 0 || $email === '' || $passwordHash === '') {
            return;
        }

        $expires = time() + mm_remember_me_duration();
        $signature = hash_hmac('sha256', $userId . '|' . strtolower($email) . '|' . $passwordHash . '|' . $expires, mm_remember_me_secret());
        $payload = base64_encode(json_encode([
            'user_id' => $userId,
            'email' => strtolower($email),
            'expires' => $expires,
            'signature' => $signature,
        ], JSON_UNESCAPED_SLASHES));

        setcookie(mm_remember_me_cookie_name(), $payload, mm_remember_me_cookie_options($expires));
        $_COOKIE[mm_remember_me_cookie_name()] = $payload;
    }
}

if (!function_exists('mm_restore_session_from_remember_me')) {
    function mm_restore_session_from_remember_me(): void
    {
        $cookieValue = trim((string) ($_COOKIE[mm_remember_me_cookie_name()] ?? ''));
        if ($cookieValue === '') {
            return;
        }

        $decoded = base64_decode($cookieValue, true);
        $payload = is_string($decoded) ? json_decode($decoded, true) : null;

        if (!is_array($payload)) {
            mm_clear_remember_me_cookie();
            return;
        }

        $userId = isset($payload['user_id']) ? (int) $payload['user_id'] : 0;
        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $expires = isset($payload['expires']) ? (int) $payload['expires'] : 0;
        $signature = trim((string) ($payload['signature'] ?? ''));

        if ($userId <= 0 || $email === '' || $expires <= time() || $signature === '') {
            mm_clear_remember_me_cookie();
            return;
        }

        try {
            $db = mm_db();
            $stmt = $db->prepare('SELECT id, email, password_hash, full_name, username FROM users WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch();

            if (!is_array($user)) {
                mm_clear_remember_me_cookie();
                return;
            }

            $expectedSignature = hash_hmac(
                'sha256',
                ((int) $user['id']) . '|' . strtolower((string) $user['email']) . '|' . (string) $user['password_hash'] . '|' . $expires,
                mm_remember_me_secret()
            );

            if (
                strtolower((string) $user['email']) !== $email
                || !hash_equals($expectedSignature, $signature)
            ) {
                mm_clear_remember_me_cookie();
                return;
            }

            mm_start_session_user([
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'full_name' => (string) ($user['full_name'] ?? ''),
                'username' => (string) ($user['username'] ?? ''),
            ]);

            mm_issue_remember_me_cookie([
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'password_hash' => (string) $user['password_hash'],
            ]);
        } catch (Throwable $exception) {
            error_log('Remember-me restore failed: ' . $exception->getMessage());
            mm_clear_remember_me_cookie();
        }
    }
}

if (!function_exists('mm_csrf_token')) {
    function mm_csrf_token(): string
    {
        if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token']) || $_SESSION['csrf_token'] === '') {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }
}

if (!function_exists('mm_require_csrf')) {
    function mm_require_csrf(): void
    {
        $providedToken = trim((string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));
        $sessionToken = trim((string) ($_SESSION['csrf_token'] ?? ''));

        if ($providedToken === '' || $sessionToken === '' || !hash_equals($sessionToken, $providedToken)) {
            mm_json(['error' => 'Invalid CSRF token'], 419);
        }
    }
}

if (!function_exists('mm_session_payload')) {
    /**
     * @param array<string, mixed>|null $user
     * @return array<string, mixed>
     */
    function mm_session_payload(?array $user): array
    {
        if (!mm_is_authenticated() || !is_array($user) || $user === []) {
            return [
                'authenticated' => false,
                'user' => null,
            ];
        }

        return [
            'authenticated' => true,
            'user' => $user,
            'csrf_token' => mm_csrf_token(),
        ];
    }
}

if (!function_exists('mm_api_routes')) {
    /**
     * @return list<array{method: string, path: string, endpoint: string}>
     */
    function mm_api_routes(): array
    {
        static $routes = null;

        if (is_array($routes)) {
            return $routes;
        }

        $routes = require __DIR__ . '/config/api-routes.php';

        return $routes;
    }
}

if (!function_exists('mm_public_endpoint_list')) {
    /**
     * @return list<string>
     */
    function mm_public_endpoint_list(): array
    {
        $endpoints = [];

        foreach (mm_api_routes() as $route) {
            $endpoints[] = strtoupper((string) $route['method']) . ' ' . (string) $route['path'];
        }

        return array_values(array_unique($endpoints));
    }
}

if (!function_exists('mm_find_api_route')) {
    /**
     * @return array{method: string, path: string, endpoint: string}|null
     */
    function mm_find_api_route(string $method, string $path): ?array
    {
        $normalizedMethod = strtoupper(trim($method));
        $normalizedPath = '/' . ltrim(trim($path), '/');
        if ($normalizedPath !== '/api') {
            $normalizedPath = rtrim($normalizedPath, '/');
        }

        foreach (mm_api_routes() as $route) {
            if (strtoupper((string) $route['method']) !== $normalizedMethod) {
                continue;
            }

            if ((string) $route['path'] !== $normalizedPath) {
                continue;
            }

            return $route;
        }

        return null;
    }
}

if (!function_exists('mm_pricing_catalog')) {
    /**
     * @return array{
     *   currency: string,
     *   defaults: array{plan_name: string, duration_months: int},
     *   plans: array<string, array{label: string, monthly_price: float}>,
     *   durations: array<int, array{label: string, discount_percent: float}>
     * }
     */
    function mm_pricing_catalog(): array
    {
        return [
            'currency' => 'INR',
            'defaults' => [
                'plan_name' => 'basic',
                'duration_months' => 1,
            ],
            'plans' => [
                'basic' => [
                    'label' => 'Basic',
                    'monthly_price' => 100.0,
                ],
                'pro' => [
                    'label' => 'Pro',
                    'monthly_price' => 250.0,
                ],
                'elite' => [
                    'label' => 'Elite',
                    'monthly_price' => 500.0,
                ],
            ],
            'durations' => [
                1 => [
                    'label' => '1 Month',
                    'discount_percent' => 0.0,
                ],
                3 => [
                    'label' => '3 Months',
                    'discount_percent' => 5.0,
                ],
                12 => [
                    'label' => '1 Year',
                    'discount_percent' => 15.0,
                ],
            ],
        ];
    }
}

if (!function_exists('mm_subscription_quote')) {
    /**
     * @return array{
     *   currency: string,
     *   plan_name: string,
     *   plan_label: string,
     *   duration_months: int,
     *   duration_label: string,
     *   monthly_price: float,
     *   base_amount: float,
     *   discount_percent: float,
     *   discount_amount: float,
     *   total_amount: float,
     *   renewal_date: string
     * }
     */
    function mm_subscription_quote(string $planName, int $durationMonths): array
    {
        $catalog = mm_pricing_catalog();
        $normalizedPlanName = strtolower(trim($planName));

        if (!isset($catalog['plans'][$normalizedPlanName])) {
            throw new InvalidArgumentException('Unknown membership plan.');
        }

        if (!isset($catalog['durations'][$durationMonths])) {
            throw new InvalidArgumentException('Unsupported billing duration.');
        }

        $plan = $catalog['plans'][$normalizedPlanName];
        $duration = $catalog['durations'][$durationMonths];
        $monthlyPrice = (float) $plan['monthly_price'];
        $baseAmount = round($monthlyPrice * $durationMonths, 2);
        $discountPercent = round((float) $duration['discount_percent'], 2);
        $discountAmount = round(($baseAmount * $discountPercent) / 100, 2);
        $totalAmount = round($baseAmount - $discountAmount, 2);
        $renewalDate = (new \DateTimeImmutable('today'))->modify('+' . $durationMonths . ' months')->format('Y-m-d');

        return [
            'currency' => $catalog['currency'],
            'plan_name' => $normalizedPlanName,
            'plan_label' => (string) $plan['label'],
            'duration_months' => $durationMonths,
            'duration_label' => (string) $duration['label'],
            'monthly_price' => $monthlyPrice,
            'base_amount' => $baseAmount,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'renewal_date' => $renewalDate,
        ];
    }
}

if (!function_exists('mm_table_has_column')) {
    function mm_table_has_column(PDO $db, string $table, string $column): bool
    {
        static $cache = [];

        $table = trim($table);
        $column = trim($column);

        if (!preg_match('/^[A-Za-z0-9_]+$/', $table) || !preg_match('/^[A-Za-z0-9_]+$/', $column)) {
            return false;
        }

        $cacheKey = $table . '.' . $column;
        if (array_key_exists($cacheKey, $cache)) {
            return $cache[$cacheKey];
        }

        $statement = $db->prepare(sprintf('SHOW COLUMNS FROM `%s` LIKE :column', $table));
        $statement->execute([':column' => $column]);

        $cache[$cacheKey] = (bool) $statement->fetch();

        return $cache[$cacheKey];
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
