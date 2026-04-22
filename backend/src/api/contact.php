<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

$db = mm_db();
mm_ensure_contact_messages_table($db);

$data = mm_filter_request([
    'name' => [
        'type' => 'string',
        'required' => true,
        'allow_empty' => false,
        'min_length' => 2,
        'max_length' => 120,
    ],
    'email' => [
        'type' => 'email',
        'required' => true,
        'allow_empty' => false,
    ],
    'subject' => [
        'type' => 'enum',
        'required' => true,
        'allow_empty' => false,
        'values' => ['billing', 'technical', 'feedback', 'other'],
    ],
    'message' => [
        'type' => 'string',
        'required' => true,
        'allow_empty' => false,
        'min_length' => 10,
        'max_length' => 2000,
        'preserve_newlines' => true,
    ],
]);

$userId = mm_is_authenticated() ? (int) ($_SESSION['user_id'] ?? 0) : null;

try {
    $stmt = $db->prepare(
        'INSERT INTO contact_messages (user_id, name, email, subject, message)
         VALUES (:user_id, :name, :email, :subject, :message)'
    );
    $stmt->bindValue(':user_id', $userId, $userId !== null ? PDO::PARAM_INT : PDO::PARAM_NULL);
    $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
    $stmt->bindValue(':email', $data['email'], PDO::PARAM_STR);
    $stmt->bindValue(':subject', $data['subject'], PDO::PARAM_STR);
    $stmt->bindValue(':message', $data['message'], PDO::PARAM_STR);
    $stmt->execute();

    mm_json([
        'message' => 'Support request submitted successfully',
        'request_id' => (int) $db->lastInsertId(),
    ], 201);
} catch (PDOException $exception) {
    error_log('Contact submission failed: ' . $exception->getMessage());
    mm_json(['error' => 'Unable to submit your request'], 500);
}

function mm_ensure_contact_messages_table(PDO $db): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $db->exec(
        'CREATE TABLE IF NOT EXISTS contact_messages (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL,
            subject VARCHAR(40) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_contact_messages_created_at (created_at),
            INDEX idx_contact_messages_subject (subject),
            CONSTRAINT fk_contact_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $initialized = true;
}
