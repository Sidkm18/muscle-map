<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method(['GET', 'POST']);

$userId = mm_require_auth();
$db = mm_db();

mm_ensure_connect_posts_table($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->query(
            'SELECT cp.id, cp.user_id, cp.post_type, cp.media_type, cp.media_path, cp.caption, cp.crop_scale, cp.crop_x, cp.crop_y, cp.crop_rotation, cp.like_count, cp.created_at, u.username, u.full_name, u.profile_photo
             FROM connect_posts cp
             INNER JOIN users u ON u.id = cp.user_id
             ORDER BY cp.created_at DESC, cp.id DESC'
        );

        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        mm_json([
            'posts' => array_map('mm_format_connect_post', $posts),
        ]);
    } catch (PDOException $exception) {
        error_log('Posts fetch failed: ' . $exception->getMessage());
        mm_json(['error' => 'Unable to load posts'], 500);
    }
}

$allowedTypes = ['post', 'reel', 'story'];
$postType = strtolower(trim((string) ($_POST['type'] ?? 'post')));
$caption = trim((string) ($_POST['caption'] ?? ''));

if (!in_array($postType, $allowedTypes, true)) {
    mm_json(['error' => 'Invalid post type'], 422);
}

if (mb_strlen($caption) > 1000) {
    mm_json(['error' => 'Caption is too long'], 422);
}

if (!isset($_FILES['media']) || !is_array($_FILES['media'])) {
    mm_json(['error' => 'Media upload is required'], 422);
}

$upload = $_FILES['media'];
if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    mm_json(['error' => mm_upload_error_message((int) ($upload['error'] ?? UPLOAD_ERR_NO_FILE))], 422);
}

$tmpPath = (string) ($upload['tmp_name'] ?? '');
if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
    mm_json(['error' => 'Invalid uploaded file'], 422);
}

$maxUploadBytes = 25 * 1024 * 1024;
$fileSize = (int) ($upload['size'] ?? 0);
if ($fileSize <= 0 || $fileSize > $maxUploadBytes) {
    mm_json(['error' => 'Media file is too large'], 413);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = strtolower((string) $finfo->file($tmpPath));
$allowedMimeTypes = [
    'image/jpeg' => ['type' => 'image', 'ext' => 'jpg'],
    'image/png' => ['type' => 'image', 'ext' => 'png'],
    'image/webp' => ['type' => 'image', 'ext' => 'webp'],
    'image/gif' => ['type' => 'image', 'ext' => 'gif'],
    'video/mp4' => ['type' => 'video', 'ext' => 'mp4'],
    'video/webm' => ['type' => 'video', 'ext' => 'webm'],
    'video/quicktime' => ['type' => 'video', 'ext' => 'mov'],
];

if (!isset($allowedMimeTypes[$mimeType])) {
    mm_json(['error' => 'Unsupported file type'], 422);
}

$mediaConfig = $allowedMimeTypes[$mimeType];
$cropScale = mm_nullable_float($_POST['crop_scale'] ?? null);
$cropX = mm_nullable_int($_POST['crop_x'] ?? null);
$cropY = mm_nullable_int($_POST['crop_y'] ?? null);
$cropRotation = mm_nullable_int($_POST['crop_rotation'] ?? null);

$relativeDirectory = 'posts/' . date('Y/m');
$targetDirectory = mm_connect_uploads_root() . '/' . $relativeDirectory;
if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0775, true) && !is_dir($targetDirectory)) {
    mm_json(['error' => 'Unable to create upload directory'], 500);
}

$fileName = sprintf(
    '%d_%s.%s',
    $userId,
    bin2hex(random_bytes(12)),
    $mediaConfig['ext']
);
$relativePath = $relativeDirectory . '/' . $fileName;
$targetPath = mm_connect_uploads_root() . '/' . $relativePath;

if (!move_uploaded_file($tmpPath, $targetPath)) {
    mm_json(['error' => 'Unable to save uploaded media'], 500);
}

try {
    $stmt = $db->prepare(
        'INSERT INTO connect_posts (user_id, post_type, media_type, media_path, caption, crop_scale, crop_x, crop_y, crop_rotation)
         VALUES (:user_id, :post_type, :media_type, :media_path, :caption, :crop_scale, :crop_x, :crop_y, :crop_rotation)'
    );
    $stmt->execute([
        ':user_id' => $userId,
        ':post_type' => $postType,
        ':media_type' => $mediaConfig['type'],
        ':media_path' => $relativePath,
        ':caption' => $caption !== '' ? $caption : null,
        ':crop_scale' => $cropScale,
        ':crop_x' => $cropX,
        ':crop_y' => $cropY,
        ':crop_rotation' => $cropRotation,
    ]);

    $postId = (int) $db->lastInsertId();
    $postStmt = $db->prepare(
        'SELECT cp.id, cp.user_id, cp.post_type, cp.media_type, cp.media_path, cp.caption, cp.crop_scale, cp.crop_x, cp.crop_y, cp.crop_rotation, cp.like_count, cp.created_at, u.username, u.full_name, u.profile_photo
         FROM connect_posts cp
         INNER JOIN users u ON u.id = cp.user_id
         WHERE cp.id = :id
         LIMIT 1'
    );
    $postStmt->execute([':id' => $postId]);
    $post = $postStmt->fetch(PDO::FETCH_ASSOC);

    if (!$post) {
        mm_json(['error' => 'Post created but could not be loaded'], 500);
    }

    mm_json([
        'message' => 'Post created successfully',
        'post' => mm_format_connect_post($post),
    ], 201);
} catch (PDOException $exception) {
    if (is_file($targetPath)) {
        @unlink($targetPath);
    }

    error_log('Post creation failed: ' . $exception->getMessage());
    mm_json(['error' => 'Unable to create post'], 500);
}

function mm_ensure_connect_posts_table(PDO $db): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $db->exec(
        'CREATE TABLE IF NOT EXISTS connect_posts (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            post_type VARCHAR(20) NOT NULL,
            media_type VARCHAR(20) NOT NULL,
            media_path VARCHAR(255) NOT NULL,
            caption TEXT NULL,
            crop_scale DECIMAL(4,2) NULL,
            crop_x SMALLINT NULL,
            crop_y SMALLINT NULL,
            crop_rotation SMALLINT NULL,
            like_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_connect_posts_created_at (created_at),
            INDEX idx_connect_posts_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $initialized = true;
}

function mm_format_connect_post(array $post): array
{
    $displayName = trim((string) ($post['full_name'] ?? ''));
    $username = trim((string) ($post['username'] ?? ''));
    $userLabel = $displayName !== '' ? $displayName : ($username !== '' ? $username : ('User ' . (int) ($post['user_id'] ?? 0)));

    return [
        'id' => (int) $post['id'],
        'user' => $userLabel,
        'username' => $username,
        'avatar' => (string) ($post['profile_photo'] ?? ''),
        'type' => (string) $post['post_type'],
        'mediaType' => (string) $post['media_type'],
        'media' => mm_connect_media_url((string) $post['media_path']),
        'persistentMedia' => mm_connect_media_url((string) $post['media_path']),
        'caption' => (string) ($post['caption'] ?? ''),
        'likes' => (int) ($post['like_count'] ?? 0),
        'liked' => false,
        'createdAt' => (string) $post['created_at'],
        'crop' => [
            'scale' => isset($post['crop_scale']) ? (float) $post['crop_scale'] : 1,
            'x' => isset($post['crop_x']) ? (int) $post['crop_x'] : 50,
            'y' => isset($post['crop_y']) ? (int) $post['crop_y'] : 50,
            'rotation' => isset($post['crop_rotation']) ? (int) $post['crop_rotation'] : 0,
        ],
    ];
}

function mm_connect_media_url(string $relativePath): string
{
    $relativePath = mm_normalize_connect_media_path($relativePath);
    if ($relativePath === '') {
        return '';
    }

    mm_sync_legacy_connect_upload($relativePath);
    $scriptName = parse_url((string) ($_SERVER['SCRIPT_NAME'] ?? ''), PHP_URL_PATH) ?: '';
    $basePath = preg_replace('#/backend/public/index\.php$#', '', $scriptName);
    $basePath = is_string($basePath) ? rtrim($basePath, '/') : '';

    if ($basePath === '') {
        $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $derivedBasePath = preg_replace('#/api(?:/.*)?$#', '', $uriPath);
        $basePath = is_string($derivedBasePath) ? rtrim($derivedBasePath, '/') : '';
    }

    return ($basePath !== '' ? $basePath : '') . '/uploads/' . $relativePath;
}

function mm_connect_uploads_root(): string
{
    return dirname(__DIR__, 3) . '/uploads';
}

function mm_legacy_connect_uploads_root(): string
{
    return dirname(__DIR__, 2) . '/public/uploads';
}

function mm_sync_legacy_connect_upload(string $relativePath): void
{
    $relativePath = mm_normalize_connect_media_path($relativePath);
    if ($relativePath === '') {
        return;
    }

    $publicPath = mm_connect_uploads_root() . '/' . $relativePath;
    if (is_file($publicPath)) {
        return;
    }

    $legacyPath = mm_legacy_connect_uploads_root() . '/' . $relativePath;
    if (!is_file($legacyPath)) {
        return;
    }

    $publicDirectory = dirname($publicPath);
    if (!is_dir($publicDirectory) && !mkdir($publicDirectory, 0775, true) && !is_dir($publicDirectory)) {
        return;
    }

    @copy($legacyPath, $publicPath);
}

function mm_normalize_connect_media_path(string $relativePath): string
{
    $normalizedPath = ltrim(str_replace('\\', '/', $relativePath), '/');

    if (str_starts_with($normalizedPath, 'uploads/')) {
        $normalizedPath = substr($normalizedPath, strlen('uploads/'));
    }

    return $normalizedPath;
}

function mm_nullable_float(mixed $value): ?float
{
    if ($value === null || $value === '') {
        return null;
    }

    return is_numeric($value) ? (float) $value : null;
}

function mm_nullable_int(mixed $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    return is_numeric($value) ? (int) $value : null;
}

function mm_upload_error_message(int $errorCode): string
{
    return match ($errorCode) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Uploaded file is too large',
        UPLOAD_ERR_PARTIAL => 'Uploaded file was not received completely',
        UPLOAD_ERR_NO_FILE => 'Please choose a file to upload',
        default => 'Unable to process uploaded file',
    };
}
