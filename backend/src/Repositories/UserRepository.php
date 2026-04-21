<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;

class UserRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, email, password_hash, full_name, username FROM users WHERE email = :email LIMIT 1'
        );
        $stmt->execute([':email' => $email]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, username, email, full_name, bio, profile_photo, created_at FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }

    public function findProfileById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT id, username, email, full_name, phone, gender, dob, bio, profile_photo, created_at
             FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }

    public function findByUsername(string $username): ?array
    {
        $stmt = $this->db->prepare('SELECT id FROM users WHERE username = :username LIMIT 1');
        $stmt->execute([':username' => $username]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }

    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);

        return $stmt->fetch() !== false;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (username, email, password_hash, full_name)
             VALUES (:username, :email, :password_hash, :full_name)'
        );
        $stmt->execute([
            ':username'      => $data['username'],
            ':email'         => $data['email'],
            ':password_hash' => $data['password_hash'],
            ':full_name'     => $data['full_name'],
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $fields): void
    {
        if (empty($fields)) {
            return;
        }

        $setClauses = [];
        $params     = [':id' => $id];

        foreach ($fields as $column => $value) {
            $setClauses[]          = $column . ' = :' . $column;
            $params[':' . $column] = $value;
        }

        $stmt = $this->db->prepare(
            'UPDATE users SET ' . implode(', ', $setClauses) . ' WHERE id = :id'
        );
        $stmt->execute($params);
    }

    public function getStats(int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM user_stats WHERE user_id = :user_id');
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }

    public function getFitnessProfile(int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM user_fitness_profiles WHERE user_id = :user_id');
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }

    public function getActiveMembership(int $userId): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT * FROM memberships WHERE user_id = :user_id AND status = 'Active' ORDER BY id DESC LIMIT 1"
        );
        $stmt->execute([':user_id' => $userId]);
        $result = $stmt->fetch();

        return $result !== false ? $result : null;
    }

    public function initUserStats(int $userId): void
    {
        $stmt = $this->db->prepare('INSERT INTO user_stats (user_id) VALUES (:user_id)');
        $stmt->execute([':user_id' => $userId]);
    }

    public function initFitnessProfile(int $userId): void
    {
        $stmt = $this->db->prepare('INSERT INTO user_fitness_profiles (user_id) VALUES (:user_id)');
        $stmt->execute([':user_id' => $userId]);
    }

    public function updateStats(int $userId, array $fields): void
    {
        if (empty($fields)) {
            return;
        }

        $setClauses = [];
        $params     = [':user_id' => $userId];

        foreach ($fields as $column => $value) {
            $setClauses[]          = $column . ' = :' . $column;
            $params[':' . $column] = $value;
        }

        $stmt = $this->db->prepare(
            'UPDATE user_stats SET ' . implode(', ', $setClauses) . ' WHERE user_id = :user_id'
        );
        $stmt->execute($params);
    }

    public function updateFitnessProfile(int $userId, array $fields): void
    {
        if (empty($fields)) {
            return;
        }

        $setClauses = [];
        $params     = [':user_id' => $userId];

        foreach ($fields as $column => $value) {
            $setClauses[]          = $column . ' = :' . $column;
            $params[':' . $column] = $value;
        }

        $stmt = $this->db->prepare(
            'UPDATE user_fitness_profiles SET ' . implode(', ', $setClauses) . ' WHERE user_id = :user_id'
        );
        $stmt->execute($params);
    }

    public function deactivateMemberships(int $userId): void
    {
        $stmt = $this->db->prepare(
            "UPDATE memberships SET status = 'Inactive' WHERE user_id = :user_id AND status = 'Active'"
        );
        $stmt->execute([':user_id' => $userId]);
    }

    public function createMembership(int $userId, string $planName, string $renewalDate): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO memberships (user_id, plan_name, renewal_date) VALUES (:user_id, :plan_name, :renewal_date)'
        );
        $stmt->execute([
            ':user_id'      => $userId,
            ':plan_name'    => $planName,
            ':renewal_date' => $renewalDate,
        ]);
    }
}
