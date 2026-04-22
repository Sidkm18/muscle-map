<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method(['GET', 'POST', 'DELETE']);

$userId = mm_require_auth();
$db = mm_db();
mm_ensure_workout_calculator_sets_table($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->prepare(
            'SELECT id, weight, reps, bodyweight, logged_at
             FROM workout_calculator_sets
             WHERE user_id = :user_id
             ORDER BY logged_at ASC, id ASC'
        );
        $stmt->execute([':user_id' => $userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        mm_json([
            'sets' => array_map('mm_format_workout_calculator_set', $rows),
        ]);
    } catch (PDOException $exception) {
        error_log('Calculator sets fetch failed: ' . $exception->getMessage());
        mm_json(['error' => 'Unable to load workout sets'], 500);
    }
}

mm_require_csrf();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = mm_filter_request([
        'weight' => [
            'type' => 'float',
            'required' => true,
            'min' => 0.1,
            'max' => 1000,
            'precision' => 2,
        ],
        'reps' => [
            'type' => 'int',
            'required' => true,
            'min' => 1,
            'max' => 100,
        ],
        'bodyweight' => [
            'type' => 'float',
            'empty_to_null' => true,
            'min' => 1,
            'max' => 500,
            'precision' => 2,
        ],
    ]);

    try {
        $stmt = $db->prepare(
            'INSERT INTO workout_calculator_sets (user_id, weight, reps, bodyweight)
             VALUES (:user_id, :weight, :reps, :bodyweight)'
        );
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':weight', $data['weight']);
        $stmt->bindValue(':reps', $data['reps'], PDO::PARAM_INT);
        $stmt->bindValue(':bodyweight', $data['bodyweight'], $data['bodyweight'] !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->execute();

        $id = (int) $db->lastInsertId();
        $fetchStmt = $db->prepare(
            'SELECT id, weight, reps, bodyweight, logged_at
             FROM workout_calculator_sets
             WHERE id = :id AND user_id = :user_id
             LIMIT 1'
        );
        $fetchStmt->execute([
            ':id' => $id,
            ':user_id' => $userId,
        ]);
        $row = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        mm_json([
            'message' => 'Set logged successfully',
            'set' => $row ? mm_format_workout_calculator_set($row) : null,
        ], 201);
    } catch (PDOException $exception) {
        error_log('Calculator set insert failed: ' . $exception->getMessage());
        mm_json(['error' => 'Unable to save workout set'], 500);
    }
}

$data = mm_filter_request([
    'id' => [
        'type' => 'int',
        'required' => false,
        'min' => 1,
    ],
    'clear_all' => [
        'type' => 'int',
        'required' => false,
        'default' => 0,
        'min' => 0,
        'max' => 1,
    ],
], ['reject_unknown' => false]);

try {
    if ((int) ($data['clear_all'] ?? 0) === 1) {
        $stmt = $db->prepare('DELETE FROM workout_calculator_sets WHERE user_id = :user_id');
        $stmt->execute([':user_id' => $userId]);

        mm_json([
            'message' => 'All calculator sets cleared',
        ]);
    }

    if (empty($data['id'])) {
        mm_json(['error' => 'Set id is required'], 422);
    }

    $stmt = $db->prepare(
        'DELETE FROM workout_calculator_sets
         WHERE id = :id AND user_id = :user_id
         LIMIT 1'
    );
    $stmt->execute([
        ':id' => (int) $data['id'],
        ':user_id' => $userId,
    ]);

    if ($stmt->rowCount() === 0) {
        mm_json(['error' => 'Set not found'], 404);
    }

    mm_json([
        'message' => 'Set deleted successfully',
    ]);
} catch (PDOException $exception) {
    error_log('Calculator set deletion failed: ' . $exception->getMessage());
    mm_json(['error' => 'Unable to update calculator sets'], 500);
}

function mm_ensure_workout_calculator_sets_table(PDO $db): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $db->exec(
        'CREATE TABLE IF NOT EXISTS workout_calculator_sets (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            weight DECIMAL(8,2) NOT NULL,
            reps SMALLINT UNSIGNED NOT NULL,
            bodyweight DECIMAL(8,2) NULL,
            logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_workout_calculator_sets_user (user_id),
            INDEX idx_workout_calculator_sets_logged_at (logged_at),
            CONSTRAINT fk_workout_calculator_sets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $initialized = true;
}

function mm_format_workout_calculator_set(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'weight' => isset($row['weight']) ? (float) $row['weight'] : 0,
        'reps' => isset($row['reps']) ? (int) $row['reps'] : 0,
        'bodyweight' => isset($row['bodyweight']) ? (float) $row['bodyweight'] : null,
        'timestamp' => strtotime((string) ($row['logged_at'] ?? 'now')) * 1000,
        'logged_at' => (string) ($row['logged_at'] ?? ''),
    ];
}
