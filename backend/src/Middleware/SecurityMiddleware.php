<?php

declare(strict_types=1);

namespace App\Middleware;

class SecurityMiddleware
{
    private const DEFAULT_MAX_JSON_BODY_BYTES = 8388608;

    public static function applyApiSecurity(): void
    {
        self::sendSecurityHeaders();
        self::applyCorsHeaders();

        if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(204);
            exit();
        }
    }

    public static function assertJsonRequest(string $rawBody): void
    {
        if (trim($rawBody) === '') {
            return;
        }

        $contentType = strtolower(trim((string) ($_SERVER['CONTENT_TYPE'] ?? '')));
        if ($contentType === '') {
            \mm_json(['error' => 'Missing Content-Type header'], 415);
        }

        if (!str_contains($contentType, 'application/json') && !str_contains($contentType, '+json')) {
            \mm_json(['error' => 'Only JSON requests are supported'], 415);
        }
    }

    public static function assertJsonBodySize(string $rawBody): void
    {
        $maxBytes = self::getMaxJsonBodyBytes();
        if (strlen($rawBody) > $maxBytes) {
            \mm_json(['error' => 'Request payload is too large'], 413);
        }
    }

    private static function sendSecurityHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
        header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
    }

    private static function applyCorsHeaders(): void
    {
        $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
        if ($origin === '') {
            return;
        }

        if (!self::isAllowedOrigin($origin)) {
            \mm_json(['error' => 'Origin not allowed'], 403);
        }

        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }

    private static function isAllowedOrigin(string $origin): bool
    {
        $allowedOrigins = self::getAllowedOrigins();
        if (in_array($origin, $allowedOrigins, true)) {
            return true;
        }

        $originParts = parse_url($origin);
        $host = strtolower((string) ($originParts['host'] ?? ''));

        if ($host === '') {
            return false;
        }

        return in_array($host, ['localhost', '127.0.0.1'], true);
    }

    /**
     * @return list<string>
     */
    private static function getAllowedOrigins(): array
    {
        $allowedOrigins = [];
        $envValues = [
            $_ENV['APP_URL'] ?? null,
            $_ENV['FRONTEND_URL'] ?? null,
        ];

        $configuredOrigins = trim((string) ($_ENV['ALLOWED_ORIGINS'] ?? ''));
        if ($configuredOrigins !== '') {
            $envValues = array_merge($envValues, preg_split('/\s*,\s*/', $configuredOrigins) ?: []);
        }

        foreach ($envValues as $value) {
            $normalized = self::normalizeOrigin((string) $value);
            if ($normalized !== null) {
                $allowedOrigins[] = $normalized;
            }
        }

        $requestOrigin = self::normalizeOrigin(self::currentRequestOrigin());
        if ($requestOrigin !== null) {
            $allowedOrigins[] = $requestOrigin;
        }

        return array_values(array_unique($allowedOrigins));
    }

    private static function currentRequestOrigin(): string
    {
        $host = trim((string) ($_SERVER['HTTP_HOST'] ?? ''));
        if ($host === '') {
            return '';
        }

        $scheme = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http';

        return $scheme . '://' . $host;
    }

    private static function normalizeOrigin(string $origin): ?string
    {
        $origin = trim($origin);
        if ($origin === '') {
            return null;
        }

        $parts = parse_url($origin);
        if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }

        $normalized = strtolower($parts['scheme']) . '://' . strtolower($parts['host']);
        if (!empty($parts['port'])) {
            $normalized .= ':' . (int) $parts['port'];
        }

        return $normalized;
    }

    private static function getMaxJsonBodyBytes(): int
    {
        $configuredValue = (int) ($_ENV['MAX_JSON_BODY_BYTES'] ?? 0);

        return $configuredValue > 0 ? $configuredValue : self::DEFAULT_MAX_JSON_BODY_BYTES;
    }
}
