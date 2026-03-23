<?php

declare(strict_types=1);

namespace App\Middleware;

use RuntimeException;

class ValidationException extends RuntimeException
{
    /**
     * @param array<string, string> $errors
     */
    public function __construct(
        string $message = 'Validation failed',
        private readonly array $errors = [],
        private readonly int $statusCode = 422
    ) {
        parent::__construct($message);
    }

    /**
     * @return array<string, string>
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }
}
