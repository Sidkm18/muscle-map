<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\ExerciseRepository;

class ExerciseService
{
    private ExerciseRepository $repository;

    public function __construct(ExerciseRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getAll(?string $muscleGroup = null): array
    {
        $rows = $this->repository->findAll($muscleGroup);

        return array_map([$this, 'format'], $rows);
    }

    public function getById(int $id): ?array
    {
        $row = $this->repository->findById($id);

        return $row !== null ? $this->format($row) : null;
    }

    private function format(array $row): array
    {
        return [
            'id'          => (int) $row['id'],
            'name'        => $row['name'],
            'category'    => $row['muscle_group'],
            'muscle'      => ucfirst((string) $row['muscle_group']),
            'subMuscle'   => $row['sub_muscle'] ?? null,
            'equipment'   => $row['equipment'] ?? null,
            'difficulty'  => $row['difficulty'],
            'reps'        => $row['recommended_reps'],
            'description' => $row['description'],
            'image_url'   => $row['image_url'] ?? null,
        ];
    }
}
