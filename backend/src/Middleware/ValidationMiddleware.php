<?php

declare(strict_types=1);

namespace App\Middleware;

use DateTime;

class ValidationMiddleware
{
    /**
     * @param array<string, mixed> $payload
     * @param array<string, array<string, mixed>> $schema
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     */
    public static function filterPayload(array $payload, array $schema, array $options = []): array
    {
        $rejectUnknown = (bool) ($options['reject_unknown'] ?? true);
        $filtered = [];
        $errors = [];

        if ($rejectUnknown) {
            foreach (array_diff(array_keys($payload), array_keys($schema)) as $field) {
                $errors[$field] = 'Unexpected field.';
            }
        }

        foreach ($schema as $field => $rules) {
            $exists = array_key_exists($field, $payload);

            if (!$exists) {
                if (($rules['required'] ?? false) === true) {
                    $errors[$field] = 'This field is required.';
                    continue;
                }

                if (array_key_exists('default', $rules)) {
                    $filtered[$field] = $rules['default'];
                }

                continue;
            }

            try {
                $filtered[$field] = self::normalizeValue($field, $payload[$field], $rules);
            } catch (ValidationException $exception) {
                $errors = array_merge($errors, $exception->getErrors());
            }
        }

        if ($errors !== []) {
            throw new ValidationException('Validation failed', $errors);
        }

        return $filtered;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeValue(string $field, mixed $value, array $rules): mixed
    {
        if ($value === null) {
            if (($rules['nullable'] ?? false) === true) {
                return null;
            }

            throw self::fieldError($field, 'This field cannot be null.');
        }

        $type = (string) ($rules['type'] ?? 'string');

        return match ($type) {
            'email' => self::normalizeEmail($field, $value, $rules),
            'password' => self::normalizePassword($field, $value, $rules),
            'username' => self::normalizeUsername($field, $value, $rules),
            'phone' => self::normalizePhone($field, $value, $rules),
            'enum' => self::normalizeEnum($field, $value, $rules),
            'date' => self::normalizeDate($field, $value, $rules),
            'int' => self::normalizeInteger($field, $value, $rules),
            'float' => self::normalizeFloat($field, $value, $rules),
            'string_array' => self::normalizeStringArray($field, $value, $rules),
            'image_data_url' => self::normalizeImageDataUrl($field, $value, $rules),
            default => self::normalizeString($field, $value, $rules),
        };
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeString(string $field, mixed $value, array $rules): ?string
    {
        if (!is_scalar($value)) {
            throw self::fieldError($field, 'This field must be a string.');
        }

        $normalized = (string) $value;
        $normalized = self::removeControlCharacters($normalized, (bool) ($rules['preserve_newlines'] ?? false));

        if (($rules['trim'] ?? true) === true) {
            $normalized = trim($normalized);
        }

        if (($rules['strip_tags'] ?? true) === true) {
            $normalized = strip_tags($normalized);
        }

        $normalized = self::applyTransform($normalized, $rules);

        if ($normalized === '' && ($rules['empty_to_null'] ?? false) === true) {
            return null;
        }

        if ($normalized === '' && ($rules['allow_empty'] ?? true) === false) {
            throw self::fieldError($field, 'This field cannot be empty.');
        }

        $length = function_exists('mb_strlen') ? mb_strlen($normalized) : strlen($normalized);
        $minLength = $rules['min_length'] ?? null;
        $maxLength = $rules['max_length'] ?? null;

        if ($minLength !== null && $normalized !== '' && $length < (int) $minLength) {
            throw self::fieldError($field, 'This field is too short.');
        }

        if ($maxLength !== null && $length > (int) $maxLength) {
            throw self::fieldError($field, 'This field is too long.');
        }

        if (isset($rules['regex']) && $normalized !== '' && !preg_match((string) $rules['regex'], $normalized)) {
            throw self::fieldError($field, 'This field has an invalid format.');
        }

        return $normalized;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeEmail(string $field, mixed $value, array $rules): ?string
    {
        $normalized = self::normalizeString($field, $value, array_merge($rules, [
            'strip_tags' => false,
            'max_length' => $rules['max_length'] ?? 254,
            'transform' => $rules['transform'] ?? 'lower',
        ]));

        if ($normalized === null) {
            return null;
        }

        if (!filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            throw self::fieldError($field, 'Please provide a valid email address.');
        }

        return $normalized;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizePassword(string $field, mixed $value, array $rules): string
    {
        if (!is_scalar($value)) {
            throw self::fieldError($field, 'This field must be a string.');
        }

        $normalized = (string) $value;
        if (preg_match('/[\x00-\x1F\x7F]/', $normalized)) {
            throw self::fieldError($field, 'This field contains invalid characters.');
        }

        $length = function_exists('mb_strlen') ? mb_strlen($normalized) : strlen($normalized);
        $minLength = (int) ($rules['min_length'] ?? 1);
        $maxLength = (int) ($rules['max_length'] ?? 255);

        if ($length < $minLength) {
            throw self::fieldError($field, 'This field is too short.');
        }

        if ($length > $maxLength) {
            throw self::fieldError($field, 'This field is too long.');
        }

        return $normalized;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeUsername(string $field, mixed $value, array $rules): string
    {
        return self::normalizeString($field, $value, array_merge($rules, [
            'allow_empty' => false,
            'strip_tags' => true,
            'min_length' => $rules['min_length'] ?? 3,
            'max_length' => $rules['max_length'] ?? 20,
            'regex' => $rules['regex'] ?? '/^[A-Za-z0-9_]{3,20}$/',
        ])) ?? '';
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizePhone(string $field, mixed $value, array $rules): ?string
    {
        return self::normalizeString($field, $value, array_merge($rules, [
            'empty_to_null' => $rules['empty_to_null'] ?? true,
            'max_length' => $rules['max_length'] ?? 20,
            'regex' => $rules['regex'] ?? '/^[0-9+\-\s()]{7,20}$/',
        ]));
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeEnum(string $field, mixed $value, array $rules): ?string
    {
        $normalized = self::normalizeString($field, $value, array_merge($rules, [
            'strip_tags' => false,
        ]));

        if ($normalized === null) {
            return null;
        }

        if ($normalized === '' && ($rules['empty_to_null'] ?? false) === true) {
            return null;
        }

        $allowedValues = $rules['values'] ?? [];
        if (!in_array($normalized, $allowedValues, true)) {
            throw self::fieldError($field, 'This field has an invalid value.');
        }

        return $normalized;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeDate(string $field, mixed $value, array $rules): ?string
    {
        $normalized = self::normalizeString($field, $value, array_merge($rules, [
            'strip_tags' => false,
            'empty_to_null' => $rules['empty_to_null'] ?? false,
            'regex' => '/^\d{4}-\d{2}-\d{2}$/',
        ]));

        if ($normalized === null) {
            return null;
        }

        $date = DateTime::createFromFormat('Y-m-d', $normalized);
        if (!$date || $date->format('Y-m-d') !== $normalized) {
            throw self::fieldError($field, 'Please provide a valid date.');
        }

        if (($rules['not_in_future'] ?? false) === true) {
            $today = new DateTime('today');
            if ($date > $today) {
                throw self::fieldError($field, 'This date cannot be in the future.');
            }
        }

        if (isset($rules['min_age'])) {
            $minimumAge = (int) $rules['min_age'];
            if ($minimumAge > 0) {
                $eligibleDate = (clone $date)->modify('+' . $minimumAge . ' years');
                $today = new DateTime('today');

                if ($eligibleDate > $today) {
                    throw self::fieldError($field, 'You must be at least ' . $minimumAge . ' years old.');
                }
            }
        }

        return $date->format('Y-m-d');
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeInteger(string $field, mixed $value, array $rules): ?int
    {
        if ($value === '' && ($rules['empty_to_null'] ?? false) === true) {
            return null;
        }

        if (!is_scalar($value) || !is_numeric((string) $value) || (string) (int) $value !== trim((string) $value)) {
            throw self::fieldError($field, 'This field must be a whole number.');
        }

        $normalized = (int) $value;
        self::assertNumericRange($field, $normalized, $rules);

        return $normalized;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeFloat(string $field, mixed $value, array $rules): ?float
    {
        if ($value === '' && ($rules['empty_to_null'] ?? false) === true) {
            return null;
        }

        if (!is_scalar($value) || !is_numeric((string) $value)) {
            throw self::fieldError($field, 'This field must be a number.');
        }

        $normalized = (float) $value;
        self::assertNumericRange($field, $normalized, $rules);

        $precision = $rules['precision'] ?? null;
        if ($precision !== null) {
            $normalized = round($normalized, (int) $precision);
        }

        return $normalized;
    }

    /**
     * @param array<string, mixed> $rules
     * @return list<string>
     */
    private static function normalizeStringArray(string $field, mixed $value, array $rules): array
    {
        if (!is_array($value)) {
            throw self::fieldError($field, 'This field must be a list.');
        }

        $normalizedValues = [];
        foreach ($value as $entry) {
            $normalizedEntry = self::normalizeString($field, $entry, array_merge($rules, [
                'allow_empty' => false,
                'empty_to_null' => false,
                'min_length' => null,
            ]));

            if ($normalizedEntry === null || $normalizedEntry === '') {
                continue;
            }

            $normalizedValues[] = $normalizedEntry;
        }

        $normalizedValues = array_values(array_unique($normalizedValues));

        $minItems = $rules['min_items'] ?? null;
        $maxItems = $rules['max_items'] ?? null;

        if ($minItems !== null && count($normalizedValues) < (int) $minItems) {
            throw self::fieldError($field, 'Please choose more options.');
        }

        if ($maxItems !== null && count($normalizedValues) > (int) $maxItems) {
            throw self::fieldError($field, 'Too many options selected.');
        }

        if (isset($rules['values'])) {
            foreach ($normalizedValues as $entry) {
                if (!in_array($entry, $rules['values'], true)) {
                    throw self::fieldError($field, 'This field has an invalid value.');
                }
            }
        }

        return $normalizedValues;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function normalizeImageDataUrl(string $field, mixed $value, array $rules): ?string
    {
        $normalized = self::normalizeString($field, $value, array_merge($rules, [
            'strip_tags' => false,
            'trim' => true,
            'empty_to_null' => $rules['empty_to_null'] ?? true,
            'max_length' => $rules['max_length'] ?? 3670016,
        ]));

        if ($normalized === null) {
            return null;
        }

        if (!preg_match('#^data:image/(?:png|jpe?g|webp|gif)(?:;[a-z0-9.+-]+=[^;,]+)*;base64,#i', $normalized)) {
            throw self::fieldError($field, 'Profile photo must be a valid image data URL.');
        }

        $parts = explode(',', $normalized, 2);
        $encodedPayload = preg_replace('/\s+/', '', $parts[1] ?? '') ?? '';
        if ($encodedPayload === '' || base64_decode($encodedPayload, true) === false) {
            throw self::fieldError($field, 'Profile photo data is invalid.');
        }

        $maxBinaryBytes = (int) ($rules['max_binary_bytes'] ?? 2621440);
        if (self::decodedBase64ByteLength($encodedPayload) > $maxBinaryBytes) {
            throw self::fieldError($field, 'Profile photo is too large.');
        }

        return $normalized;
    }

    private static function decodedBase64ByteLength(string $encodedPayload): int
    {
        $length = strlen($encodedPayload);
        $padding = 0;

        if ($length >= 2 && str_ends_with($encodedPayload, '==')) {
            $padding = 2;
        } elseif ($length >= 1 && str_ends_with($encodedPayload, '=')) {
            $padding = 1;
        }

        return (int) (($length * 3) / 4) - $padding;
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function assertNumericRange(string $field, int|float $value, array $rules): void
    {
        if (isset($rules['min']) && $value < $rules['min']) {
            throw self::fieldError($field, 'This value is below the allowed range.');
        }

        if (isset($rules['max']) && $value > $rules['max']) {
            throw self::fieldError($field, 'This value is above the allowed range.');
        }
    }

    /**
     * @param array<string, mixed> $rules
     */
    private static function applyTransform(string $value, array $rules): string
    {
        return match ($rules['transform'] ?? null) {
            'lower' => strtolower($value),
            'upper' => strtoupper($value),
            default => $value,
        };
    }

    private static function removeControlCharacters(string $value, bool $preserveNewlines): string
    {
        $pattern = $preserveNewlines
            ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/'
            : '/[\x00-\x1F\x7F]/';

        return preg_replace($pattern, '', $value) ?? $value;
    }

    private static function fieldError(string $field, string $message): ValidationException
    {
        return new ValidationException('Validation failed', [$field => $message]);
    }
}
