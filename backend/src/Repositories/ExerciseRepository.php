<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

class ExerciseRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findAll(?string $muscleGroup = null): array
    {
        if ($muscleGroup !== null && $muscleGroup !== '') {
            $stmt = $this->db->prepare(
                'SELECT id, name, muscle_group, sub_muscle, equipment, difficulty, recommended_reps, description, image_url
                 FROM exercises
                 WHERE muscle_group = :muscle_group
                 ORDER BY name'
            );
            $stmt->execute([':muscle_group' => strtolower($muscleGroup)]);
        } else {
            $stmt = $this->db->prepare(
                'SELECT id, name, muscle_group, sub_muscle, equipment, difficulty, recommended_reps, description, image_url
                 FROM exercises
                 ORDER BY muscle_group, name'
            );
            $stmt->execute();
        }

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, name, muscle_group, sub_muscle, equipment, difficulty, recommended_reps, description, image_url
             FROM exercises
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }
}
