<?php

declare(strict_types=1);

namespace App\Middleware;

/**
 * CSRF protection using a synchroniser token stored in the PHP session.
 *
 * Flow:
 *   1. CsrfMiddleware::generate() is called from mm_start_session_user() so
 *      every authenticated session gets a token immediately.
 *   2. The token is returned in the GET /api/me response as "csrf_token".
 *   3. site-runtime.js stores it in window.MuscleMap.csrfToken and attaches
 *      it as the X-CSRF-Token header on every non-GET request.
 *   4. Mutating endpoints call CsrfMiddleware::validate() before processing.
 *
 * Why this works even with the existing Content-Type enforcement:
 * - Requiring application/json already prevents plain-form CSRF.
 * - This layer adds defence-in-depth for any edge cases or future changes.
 */
class CsrfMiddleware
{
    private const SESSION_KEY = 'csrf_token';
    private const HEADER_KEY  = 'HTTP_X_CSRF_TOKEN';

    /**
     * Return the existing token or generate a fresh one.
     */
    public static function generate(): string
    {
        if (empty($_SESSION[self::SESSION_KEY])) {
            $_SESSION[self::SESSION_KEY] = bin2hex(random_bytes(32));
        }

        return (string) $_SESSION[self::SESSION_KEY];
    }

    /**
     * Return the current session token, or null when none exists.
     */
    public static function token(): ?string
    {
        $token = $_SESSION[self::SESSION_KEY] ?? null;

        return is_string($token) && $token !== '' ? $token : null;
    }

    /**
     * Validate the X-CSRF-Token header against the session token.
     * Responds with 403 and terminates on mismatch.
     */
    public static function validate(): void
    {
        $sessionToken = self::token();
        $requestToken = trim((string) ($_SERVER[self::HEADER_KEY] ?? ''));

        if (
            $sessionToken === null
            || $requestToken === ''
            || !hash_equals($sessionToken, $requestToken)
        ) {
            \mm_json(['error' => 'CSRF token mismatch'], 403);
        }
    }
}
