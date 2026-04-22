<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('GET');

$db = mm_db();
mm_ensure_workout_programs_table($db);

try {
    $stmt = $db->query(
        'SELECT id, slug, title, level, description, weekly_split, exercises_json, duration_weeks, frequency_per_week, session_minutes, access_tier
         FROM workout_programs
         ORDER BY sort_order ASC, id ASC'
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    mm_json([
        'programs' => array_map('mm_format_workout_program', $rows),
    ]);
} catch (PDOException $exception) {
    error_log('Programs fetch failed: ' . $exception->getMessage());
    mm_json(['error' => 'Unable to load workout programs'], 500);
}

function mm_ensure_workout_programs_table(PDO $db): void
{
    static $initialized = false;

    if ($initialized) {
        return;
    }

    $db->exec(
        'CREATE TABLE IF NOT EXISTS workout_programs (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(80) NOT NULL UNIQUE,
            title VARCHAR(120) NOT NULL,
            level ENUM(\'Beginner\', \'Intermediate\', \'Advanced\') NOT NULL DEFAULT \'Beginner\',
            description TEXT NOT NULL,
            weekly_split TEXT NOT NULL,
            exercises_json LONGTEXT NOT NULL,
            duration_weeks SMALLINT UNSIGNED NOT NULL DEFAULT 8,
            frequency_per_week TINYINT UNSIGNED NOT NULL DEFAULT 4,
            session_minutes VARCHAR(40) NOT NULL DEFAULT \'45-60\',
            access_tier ENUM(\'Free\', \'Premium\') NOT NULL DEFAULT \'Free\',
            sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $count = (int) $db->query('SELECT COUNT(*) FROM workout_programs')->fetchColumn();
    if ($count === 0) {
        $seedPrograms = [
            [
                'slug' => 'starting-strength',
                'title' => 'Starting Strength',
                'level' => 'Beginner',
                'description' => 'A foundational barbell program centered on squat, press, bench, and deadlift with simple linear progression.',
                'weekly_split' => json_encode(['Day 1: Squat + Press + Deadlift', 'Day 2: Squat + Bench + Row', 'Day 3: Squat + Press + Pull'], JSON_UNESCAPED_SLASHES),
                'exercises_json' => json_encode([
                    ['day' => 'Day 1', 'items' => ['Back Squat (3x5)', 'Overhead Press (3x5)', 'Deadlift (1x5)']],
                    ['day' => 'Day 2', 'items' => ['Back Squat (3x5)', 'Bench Press (3x5)', 'Barbell Row (3x5)']],
                    ['day' => 'Day 3', 'items' => ['Back Squat (3x5)', 'Overhead Press (3x5)', 'Pull-Ups (3xAMRAP)']],
                ], JSON_UNESCAPED_SLASHES),
                'duration_weeks' => 8,
                'frequency_per_week' => 3,
                'session_minutes' => '60-75',
                'access_tier' => 'Free',
                'sort_order' => 1,
            ],
            [
                'slug' => 'push-pull-legs',
                'title' => 'Push Pull Legs',
                'level' => 'Intermediate',
                'description' => 'A balanced hypertrophy split with repeat exposure across push, pull, and legs for weekly volume and structure.',
                'weekly_split' => json_encode(['Day 1: Push', 'Day 2: Pull', 'Day 3: Legs', 'Day 4: Push', 'Day 5: Pull', 'Day 6: Legs'], JSON_UNESCAPED_SLASHES),
                'exercises_json' => json_encode([
                    ['day' => 'Push Day', 'items' => ['Bench Press (4x8)', 'Incline Dumbbell Press (3x10)', 'Cable Fly (3x12)', 'Lateral Raise (3x15)']],
                    ['day' => 'Pull Day', 'items' => ['Lat Pulldown (4x10)', 'Chest-Supported Row (3x10)', 'Face Pull (3x15)', 'Hammer Curl (3x12)']],
                    ['day' => 'Leg Day', 'items' => ['Hack Squat (4x8)', 'Romanian Deadlift (3x10)', 'Leg Curl (3x12)', 'Standing Calf Raise (4x15)']],
                ], JSON_UNESCAPED_SLASHES),
                'duration_weeks' => 6,
                'frequency_per_week' => 6,
                'session_minutes' => '60-75',
                'access_tier' => 'Premium',
                'sort_order' => 2,
            ],
            [
                'slug' => 'powerbuilding-531',
                'title' => 'Powerbuilding 5/3/1',
                'level' => 'Advanced',
                'description' => 'A heavier strength-focused block pairing main lift waves with bodybuilding accessories to drive both numbers and size.',
                'weekly_split' => json_encode(['Day 1: Squat Focus', 'Day 2: Bench Focus', 'Day 3: Deadlift Focus', 'Day 4: Press Focus'], JSON_UNESCAPED_SLASHES),
                'exercises_json' => json_encode([
                    ['day' => 'Squat Focus', 'items' => ['Back Squat 5/3/1', 'Paused Squat (3x5)', 'Leg Press (3x12)', 'Split Squat (3x10)']],
                    ['day' => 'Bench Focus', 'items' => ['Bench Press 5/3/1', 'Close-Grip Bench (3x6)', 'Weighted Dip (3x8)', 'Cable Fly (3x15)']],
                    ['day' => 'Deadlift Focus', 'items' => ['Deadlift 5/3/1', 'Romanian Deadlift (3x8)', 'Barbell Row (4x8)', 'Back Extension (3x15)']],
                    ['day' => 'Press Focus', 'items' => ['Overhead Press 5/3/1', 'Incline Bench (3x8)', 'Lateral Raise (4x15)', 'Triceps Pushdown (3x15)']],
                ], JSON_UNESCAPED_SLASHES),
                'duration_weeks' => 9,
                'frequency_per_week' => 4,
                'session_minutes' => '75-90',
                'access_tier' => 'Premium',
                'sort_order' => 3,
            ],
            [
                'slug' => 'upper-lower-split',
                'title' => 'Upper/Lower Split',
                'level' => 'Intermediate',
                'description' => 'A flexible four-day structure that balances recovery with enough volume to build muscle and strength together.',
                'weekly_split' => json_encode(['Day 1: Upper A', 'Day 2: Lower A', 'Day 3: Rest', 'Day 4: Upper B', 'Day 5: Lower B'], JSON_UNESCAPED_SLASHES),
                'exercises_json' => json_encode([
                    ['day' => 'Upper A', 'items' => ['Bench Press (4x6)', 'Barbell Row (4x8)', 'Overhead Press (3x8)', 'Cable Curl (3x12)']],
                    ['day' => 'Lower A', 'items' => ['Back Squat (4x6)', 'Romanian Deadlift (3x8)', 'Leg Extension (3x12)', 'Calf Raise (4x15)']],
                    ['day' => 'Upper B', 'items' => ['Incline Press (4x8)', 'Pull-Up (4xAMRAP)', 'Lateral Raise (3x15)', 'Triceps Extension (3x12)']],
                    ['day' => 'Lower B', 'items' => ['Deadlift (3x5)', 'Leg Press (3x10)', 'Leg Curl (3x12)', 'Walking Lunge (2x20 steps)']],
                ], JSON_UNESCAPED_SLASHES),
                'duration_weeks' => 8,
                'frequency_per_week' => 4,
                'session_minutes' => '50-70',
                'access_tier' => 'Free',
                'sort_order' => 4,
            ],
            [
                'slug' => 'calisthenics-foundation',
                'title' => 'Calisthenics Foundation',
                'level' => 'Beginner',
                'description' => 'A bodyweight-first plan for building control, joint confidence, and movement capacity without depending on machines.',
                'weekly_split' => json_encode(['Day 1: Push + Core', 'Day 2: Pull + Mobility', 'Day 3: Legs + Conditioning'], JSON_UNESCAPED_SLASHES),
                'exercises_json' => json_encode([
                    ['day' => 'Push + Core', 'items' => ['Incline Push-Up (4x10)', 'Bench Dip (3x12)', 'Plank (3x45s)', 'Dead Bug (3x12/side)']],
                    ['day' => 'Pull + Mobility', 'items' => ['Assisted Pull-Up (4x6)', 'Inverted Row (3x10)', 'Scap Pull-Up (3x10)', 'Thoracic Mobility (8 mins)']],
                    ['day' => 'Legs + Conditioning', 'items' => ['Bodyweight Squat (4x15)', 'Reverse Lunge (3x10/side)', 'Glute Bridge (3x15)', 'Jump Rope (10 mins)']],
                ], JSON_UNESCAPED_SLASHES),
                'duration_weeks' => 6,
                'frequency_per_week' => 3,
                'session_minutes' => '40-55',
                'access_tier' => 'Free',
                'sort_order' => 5,
            ],
            [
                'slug' => 'olympic-weightlifting',
                'title' => 'Olympic Weightlifting',
                'level' => 'Advanced',
                'description' => 'A technical peaking block emphasizing bar speed, positional precision, and structured practice for the competition lifts.',
                'weekly_split' => json_encode(['Day 1: Snatch', 'Day 2: Clean & Jerk', 'Day 3: Front Squat + Pulls', 'Day 4: Technique + Power Work'], JSON_UNESCAPED_SLASHES),
                'exercises_json' => json_encode([
                    ['day' => 'Snatch Day', 'items' => ['Snatch (6x2)', 'Snatch Pull (4x3)', 'Overhead Squat (4x3)']],
                    ['day' => 'Clean & Jerk Day', 'items' => ['Clean & Jerk (6x2)', 'Clean Pull (4x3)', 'Push Press (4x4)']],
                    ['day' => 'Strength Day', 'items' => ['Front Squat (5x3)', 'Romanian Deadlift (3x6)', 'Core Rotation (3x12)']],
                    ['day' => 'Power Day', 'items' => ['Power Snatch (5x2)', 'Power Clean (5x2)', 'Jerk Dip + Drive (4x3)']],
                ], JSON_UNESCAPED_SLASHES),
                'duration_weeks' => 6,
                'frequency_per_week' => 4,
                'session_minutes' => '75-90',
                'access_tier' => 'Premium',
                'sort_order' => 6,
            ],
        ];

        $stmt = $db->prepare(
            'INSERT INTO workout_programs (
                slug, title, level, description, weekly_split, exercises_json, duration_weeks, frequency_per_week, session_minutes, access_tier, sort_order
             ) VALUES (
                :slug, :title, :level, :description, :weekly_split, :exercises_json, :duration_weeks, :frequency_per_week, :session_minutes, :access_tier, :sort_order
             )'
        );

        foreach ($seedPrograms as $program) {
            $stmt->execute($program);
        }
    }

    $initialized = true;
}

function mm_format_workout_program(array $row): array
{
    $weeklySplit = json_decode((string) ($row['weekly_split'] ?? '[]'), true);
    $exerciseDays = json_decode((string) ($row['exercises_json'] ?? '[]'), true);

    return [
        'id' => (int) $row['id'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'level' => (string) $row['level'],
        'description' => (string) $row['description'],
        'weekly_split' => is_array($weeklySplit) ? array_values($weeklySplit) : [],
        'exercise_days' => is_array($exerciseDays) ? array_values($exerciseDays) : [],
        'duration_weeks' => (int) $row['duration_weeks'],
        'frequency_per_week' => (int) $row['frequency_per_week'],
        'session_minutes' => (string) $row['session_minutes'],
        'access_tier' => (string) $row['access_tier'],
    ];
}
