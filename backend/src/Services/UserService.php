<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\UserRepository;
use InvalidArgumentException;
use PDO;
use RuntimeException;

class UserService
{
    private UserRepository $repository;
    private PDO $db;

    public function __construct(UserRepository $repository, PDO $db)
    {
        $this->repository = $repository;
        $this->db         = $db;
    }

    public function authenticate(string $email, string $password): array
    {
        $user = $this->repository->findByEmail($email);

        if ($user === null) {
            throw new RuntimeException('User not found', 401);
        }

        if (!password_verify($password, $user['password_hash'])) {
            throw new RuntimeException('Invalid password', 401);
        }

        return $user;
    }

    public function register(string $email, string $password, ?string $fullName): array
    {
        if ($this->repository->emailExists($email)) {
            throw new RuntimeException('Email already exists', 409);
        }

        $usernameBase = \mm_username_from_email($email);
        $username     = $usernameBase;
        $counter      = 1;

        while ($this->repository->findByUsername($username) !== null) {
            $username = $usernameBase . $counter;
            $counter++;
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $this->db->beginTransaction();
        try {
            $userId = $this->repository->create([
                'username'      => $username,
                'email'         => $email,
                'password_hash' => $passwordHash,
                'full_name'     => $fullName,
            ]);
            $this->repository->initUserStats($userId);
            $this->repository->initFitnessProfile($userId);
            $this->db->commit();
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }

        return [
            'id'        => $userId,
            'email'     => $email,
            'full_name' => $fullName ?? '',
            'username'  => $username,
        ];
    }

    public function getCurrentUser(int $userId): ?array
    {
        return $this->repository->findById($userId);
    }

    public function getProfile(int $userId): array
    {
        return [
            'user'       => $this->repository->findProfileById($userId),
            'stats'      => $this->repository->getStats($userId),
            'fitness'    => $this->repository->getFitnessProfile($userId),
            'membership' => $this->repository->getActiveMembership($userId),
        ];
    }

    public function updateProfile(int $userId, array $data): void
    {
        $allowed = ['full_name', 'phone', 'gender', 'dob', 'bio', 'username', 'profile_photo'];
        $fields  = array_intersect_key($data, array_flip($allowed));

        if (empty($fields)) {
            throw new InvalidArgumentException('No profile fields provided', 400);
        }

        $this->repository->update($userId, $fields);
    }

    public function saveOnboarding(int $userId, array $data): void
    {
        $this->db->beginTransaction();
        try {
            $this->repository->updateStats($userId, [
                'height'         => $data['height'],
                'weight'         => $data['weight'],
                'bmi'            => round($data['weight'] / (($data['height'] / 100) ** 2), 1),
                'daily_calories' => $data['dailyCalories'],
            ]);

            $this->repository->updateFitnessProfile($userId, [
                'gym_frequency'      => $data['gymFrequency'],
                'expertise_level'    => $data['expertiseLevel'],
                'diet_preference'    => $data['dietPreference'],
                'workout_plan'       => $data['workoutPlan'],
                'workout_time'       => $data['workoutTime'],
                'goals'              => $data['goals'] !== [] ? json_encode($data['goals']) : null,
                'allergies'          => $data['allergies'],
                'supplements'        => $data['supplements'],
                'medical_conditions' => $data['medicalConditions'],
            ]);

            $userFields = array_filter([
                'full_name'     => $data['fullName'] ?? null,
                'phone'         => $data['phone'] ?? null,
                'gender'        => $data['gender'] ?? null,
                'dob'           => $data['dob'] ?? null,
                'username'      => $data['username'] ?? null,
                'bio'           => $data['bio'] ?? null,
                'profile_photo' => $data['profilePhoto'] ?? null,
            ], static fn($v) => $v !== null && $v !== '');

            if (!empty($userFields)) {
                $this->repository->update($userId, $userFields);
            }

            $this->db->commit();
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function subscribe(int $userId, string $planName): void
    {
        $this->db->beginTransaction();
        try {
            $this->repository->deactivateMemberships($userId);
            $this->repository->createMembership(
                $userId,
                $planName,
                date('Y-m-d', strtotime('+1 year'))
            );
            $this->db->commit();
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }
}
