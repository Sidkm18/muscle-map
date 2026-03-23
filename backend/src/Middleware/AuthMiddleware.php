<?php

declare(strict_types=1);

namespace App\Middleware;

class AuthMiddleware
{
    public static function requireUser(): int
    {
        $userId = $_SESSION['user_id'] ?? null;

        if (!is_numeric($userId) || (int) $userId <= 0) {
            \mm_json(['error' => 'Not authenticated'], 401);
        }

        return (int) $userId;
    }
}
