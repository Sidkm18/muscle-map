<?php

declare(strict_types=1);

namespace App\Core;

use PDO;

/**
 * Thin singleton wrapper that reuses the bootstrap-managed PDO connection.
 * Controllers and repositories should call Database::getInstance() rather
 * than mm_db() so they remain decoupled from global helper functions.
 */
class Database
{
    private static ?PDO $instance = null;

    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            self::$instance = \mm_db();
        }

        return self::$instance;
    }

    private function __construct() {}

    private function __clone() {}
}
