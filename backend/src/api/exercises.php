<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('GET');

try {
    $db = mm_db();
    $stmt = $db->prepare('SELECT id, name, muscle_group, difficulty, recommended_reps, description, image_url, created_at FROM exercises ORDER BY muscle_group, name');
    $stmt->execute();
    $exercises = $stmt->fetchAll();

    mm_json(['exercises' => $exercises]);
} catch (PDOException $exception) {
    error_log('Exercises fetch failed: ' . $exception->getMessage());
    mm_json(['error' => 'Unable to load exercises'], 500);
}
