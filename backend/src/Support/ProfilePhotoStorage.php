<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;
use RuntimeException;

class ProfilePhotoStorage
{
    private const MIME_TO_EXTENSION = [
        'image/gif' => 'gif',
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    private const UPLOAD_DIRECTORY = 'uploads/profile-photos';

    private string $projectRoot;

    private string $publicBasePath;

    public function __construct(?string $projectRoot = null, ?string $publicBasePath = null)
    {
        $this->projectRoot = rtrim($projectRoot ?? dirname(__DIR__, 3), DIRECTORY_SEPARATOR);
        $this->publicBasePath = $this->normalizeBasePath($publicBasePath ?? $this->derivePublicBasePath());
    }

    /**
     * @return array{stored_value: ?string, created_value: ?string, obsolete_value: ?string}
     */
    public function prepare(int $userId, ?string $incomingValue, ?string $currentValue): array
    {
        $normalizedIncoming = trim((string) $incomingValue);
        $normalizedCurrent = trim((string) $currentValue);

        if ($normalizedIncoming === '') {
            return [
                'stored_value' => null,
                'created_value' => null,
                'obsolete_value' => $this->isManagedUpload($normalizedCurrent) ? $normalizedCurrent : null,
            ];
        }

        if (!self::isDataUrl($normalizedIncoming)) {
            if ($normalizedCurrent !== '' && hash_equals($normalizedCurrent, $normalizedIncoming)) {
                return [
                    'stored_value' => $normalizedCurrent,
                    'created_value' => null,
                    'obsolete_value' => null,
                ];
            }

            throw new InvalidArgumentException('Profile photo must be uploaded as a PNG, JPG, GIF, or WEBP image.');
        }

        [$extension, $binary] = $this->decodeDataUrl($normalizedIncoming);

        $relativePath = sprintf(
            '%s/user-%d/%s.%s',
            self::UPLOAD_DIRECTORY,
            $userId,
            bin2hex(random_bytes(16)),
            $extension
        );
        $absolutePath = $this->buildAbsolutePath($relativePath);
        $directory = dirname($absolutePath);

        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException('Unable to prepare the profile photo directory.');
        }

        if (file_put_contents($absolutePath, $binary, LOCK_EX) === false) {
            throw new RuntimeException('Unable to write the profile photo to disk.');
        }

        $storedValue = $this->buildPublicPath($relativePath);

        return [
            'stored_value' => $storedValue,
            'created_value' => $storedValue,
            'obsolete_value' => $this->isManagedUpload($normalizedCurrent) ? $normalizedCurrent : null,
        ];
    }

    public function deleteManagedPhoto(?string $storedValue): void
    {
        $relativePath = $this->relativePathFromPublicPath(trim((string) $storedValue));
        if ($relativePath === null) {
            return;
        }

        $absolutePath = $this->buildAbsolutePath($relativePath);
        if (is_file($absolutePath)) {
            @unlink($absolutePath);
        }

        $uploadsRoot = $this->buildAbsolutePath(self::UPLOAD_DIRECTORY);
        $directory = dirname($absolutePath);

        while ($directory !== $uploadsRoot && str_starts_with($directory, $uploadsRoot) && is_dir($directory)) {
            $entries = array_diff(scandir($directory) ?: [], ['.', '..']);
            if ($entries !== []) {
                break;
            }

            @rmdir($directory);
            $directory = dirname($directory);
        }
    }

    public function isManagedUpload(?string $storedValue): bool
    {
        return $this->relativePathFromPublicPath(trim((string) $storedValue)) !== null;
    }

    public static function isDataUrl(?string $value): bool
    {
        return is_string($value)
            && preg_match('#^data:image/(?:png|jpe?g|webp|gif)(?:;[a-z0-9.+-]+=[^;,]+)*;base64,#i', $value) === 1;
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function decodeDataUrl(string $dataUrl): array
    {
        if (!preg_match('#^data:(image/(?:png|jpe?g|webp|gif))(?:;[a-z0-9.+-]+=[^;,]+)*;base64,(.+)$#is', $dataUrl, $matches)) {
            throw new InvalidArgumentException('Profile photo must be uploaded as a PNG, JPG, GIF, or WEBP image.');
        }

        $encodedPayload = preg_replace('/\s+/', '', $matches[2]) ?? '';
        $binary = base64_decode($encodedPayload, true);
        if ($binary === false || $binary === '') {
            throw new InvalidArgumentException('Profile photo data is invalid.');
        }

        $detectedMime = '';
        if (class_exists('\finfo')) {
            $fileInfo = new \finfo(FILEINFO_MIME_TYPE);
            $detectedMime = strtolower((string) $fileInfo->buffer($binary));
        }

        $mimeType = $detectedMime !== '' ? $detectedMime : strtolower($matches[1]);
        if (!isset(self::MIME_TO_EXTENSION[$mimeType])) {
            throw new InvalidArgumentException('Profile photo must be uploaded as a PNG, JPG, GIF, or WEBP image.');
        }

        return [self::MIME_TO_EXTENSION[$mimeType], $binary];
    }

    private function buildAbsolutePath(string $relativePath): string
    {
        $normalizedPath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, trim($relativePath, '/\\'));

        return $this->projectRoot . DIRECTORY_SEPARATOR . $normalizedPath;
    }

    private function buildPublicPath(string $relativePath): string
    {
        $normalizedPath = trim(str_replace('\\', '/', $relativePath), '/');
        $prefix = $this->publicBasePath !== '' ? $this->publicBasePath : '';

        return ($prefix !== '' ? $prefix : '') . '/' . $normalizedPath;
    }

    private function derivePublicBasePath(): string
    {
        $appUrl = trim((string) ($_ENV['APP_URL'] ?? ''));
        if ($appUrl !== '') {
            $appPath = parse_url($appUrl, PHP_URL_PATH);
            if (is_string($appPath)) {
                return $appPath;
            }
        }

        $scriptName = trim((string) ($_SERVER['SCRIPT_NAME'] ?? ''));
        if ($scriptName !== '') {
            $scriptDirectory = str_replace('\\', '/', dirname($scriptName));
            if ($scriptDirectory !== '' && $scriptDirectory !== '.') {
                $basePath = preg_replace('#/api/?$#', '', $scriptDirectory) ?? $scriptDirectory;
                if ($basePath !== '' && $basePath !== '/') {
                    return $basePath;
                }
            }
        }

        $requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $requestPath = is_string($requestUri) ? $requestUri : '/';
        $apiPosition = strpos($requestPath, '/api');

        return $apiPosition === false ? '' : substr($requestPath, 0, $apiPosition);
    }

    private function normalizeBasePath(string $basePath): string
    {
        $path = trim($basePath);
        if ($path === '' || $path === '/') {
            return '';
        }

        if (preg_match('#^https?://#i', $path) === 1) {
            $parsedPath = parse_url($path, PHP_URL_PATH);
            $path = is_string($parsedPath) ? $parsedPath : '';
        }

        $path = '/' . trim($path, '/');

        return $path === '/' ? '' : rtrim($path, '/');
    }

    private function relativePathFromPublicPath(string $publicPath): ?string
    {
        if ($publicPath === '') {
            return null;
        }

        $normalizedPath = parse_url($publicPath, PHP_URL_PATH);
        $normalizedPath = is_string($normalizedPath) ? $normalizedPath : $publicPath;
        $managedPrefix = $this->buildPublicPath(self::UPLOAD_DIRECTORY);

        if (!str_starts_with($normalizedPath, $managedPrefix . '/')) {
            return null;
        }

        $basePrefix = $this->publicBasePath !== '' ? $this->publicBasePath : '';
        $relativePath = ltrim(substr($normalizedPath, strlen($basePrefix)), '/');

        return $relativePath !== '' ? $relativePath : null;
    }
}
