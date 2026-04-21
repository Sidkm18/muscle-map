<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Repositories\ExerciseRepository;
use App\Services\ExerciseService;

class ExerciseController
{
    private ExerciseService $service;

    public function __construct()
    {
        $this->service = new ExerciseService(new ExerciseRepository(Database::getInstance()));
    }

    /**
     * GET /api/exercises[?muscle_group=<group>]
     */
    public function index(): void
    {
        mm_require_method('GET');

        $muscleGroup = isset($_GET['muscle_group']) ? trim((string) $_GET['muscle_group']) : null;

        try {
            $exercises = $this->service->getAll($muscleGroup ?: null);
            mm_json(['exercises' => $exercises]);
        } catch (\Throwable $e) {
            error_log('ExerciseController::index failed: ' . $e->getMessage());
            mm_json(['error' => 'Unable to load exercises'], 500);
        }
    }

    /**
     * GET /api/exercises/{id}
     */
    public function show(string $id): void
    {
        mm_require_method('GET');

        $parsedId = filter_var($id, FILTER_VALIDATE_INT);
        if ($parsedId === false || $parsedId <= 0) {
            mm_json(['error' => 'Invalid exercise ID'], 400);
        }

        try {
            $exercise = $this->service->getById((int) $parsedId);
            if ($exercise === null) {
                mm_json(['error' => 'Exercise not found'], 404);
            }
            mm_json(['exercise' => $exercise]);
        } catch (\Throwable $e) {
            error_log('ExerciseController::show failed: ' . $e->getMessage());
            mm_json(['error' => 'Unable to load exercise'], 500);
        }
    }
}
