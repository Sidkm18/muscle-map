<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Middleware\CsrfMiddleware;
use App\Repositories\UserRepository;
use App\Services\UserService;

class UserController
{
    private UserService $service;

    public function __construct()
    {
        $db            = Database::getInstance();
        $this->service = new UserService(new UserRepository($db), $db);
    }

    // -------------------------------------------------------------------------
    // Auth
    // -------------------------------------------------------------------------

    /** POST /api/login */
    public function login(): void
    {
        mm_require_method('POST');

        $data = mm_filter_request([
            'email'    => ['type' => 'email', 'required' => true, 'allow_empty' => false],
            'password' => ['type' => 'password', 'required' => true, 'min_length' => 1, 'max_length' => 255],
        ]);

        try {
            $user = $this->service->authenticate($data['email'], $data['password']);
            mm_start_session_user($user);

            mm_json([
                'message' => 'Login successful',
                'user'    => [
                    'id'        => (int) $user['id'],
                    'email'     => $user['email'],
                    'full_name' => $user['full_name'],
                    'username'  => $user['username'],
                ],
            ]);
        } catch (\RuntimeException $e) {
            $code = $e->getCode();
            mm_json(['error' => $e->getMessage()], in_array($code, [400, 401, 409, 422], true) ? $code : 500);
        } catch (\PDOException $e) {
            error_log('Login failed: ' . $e->getMessage());
            mm_json(['error' => 'Login failed'], 500);
        }
    }

    /** POST /api/register */
    public function register(): void
    {
        mm_require_method('POST');

        $data = mm_filter_request([
            'full_name' => ['type' => 'string', 'max_length' => 120, 'min_length' => 2, 'empty_to_null' => true],
            'email'     => ['type' => 'email', 'required' => true, 'allow_empty' => false],
            'password'  => ['type' => 'password', 'required' => true, 'min_length' => 8, 'max_length' => 255],
        ]);

        try {
            $user = $this->service->register($data['email'], $data['password'], $data['full_name'] ?? null);
            mm_start_session_user(['id' => $user['id'], 'email' => $user['email']]);

            mm_json([
                'message' => 'User registered successfully',
                'user_id' => $user['id'],
                'user'    => $user,
            ], 201);
        } catch (\RuntimeException $e) {
            $code = $e->getCode();
            mm_json(['error' => $e->getMessage()], in_array($code, [400, 401, 409, 422], true) ? $code : 500);
        } catch (\PDOException $e) {
            error_log('Registration failed: ' . $e->getMessage());
            if (($e->getCode() ?? '') === '23000') {
                mm_json(['error' => 'Account already exists'], 409);
            }
            mm_json(['error' => 'Registration failed'], 500);
        }
    }

    /** POST /api/logout */
    public function logout(): void
    {
        mm_require_method('POST');
        mm_destroy_session();
        mm_json(['message' => 'Logged out successfully']);
    }

    // -------------------------------------------------------------------------
    // Current user
    // -------------------------------------------------------------------------

    /**
     * GET /api/me
     * Returns the authenticated user and a fresh CSRF token so the frontend
     * can send it back on mutating requests.
     */
    public function me(): void
    {
        mm_require_method('GET');

        $userId = mm_require_auth();

        try {
            $user = $this->service->getCurrentUser($userId);
            if ($user === null) {
                mm_json(['error' => 'Not authenticated'], 401);
            }

            mm_json([
                'user'       => $user,
                'csrf_token' => CsrfMiddleware::generate(),
            ]);
        } catch (\PDOException $e) {
            error_log('Me endpoint failed: ' . $e->getMessage());
            mm_json(['error' => 'Unable to load current user'], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Profile
    // -------------------------------------------------------------------------

    /** GET /api/profile  |  PUT /api/profile */
    public function profile(): void
    {
        mm_require_method(['GET', 'PUT']);

        $userId = mm_require_auth();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $this->getProfile($userId);
        } else {
            CsrfMiddleware::validate();
            $this->updateProfile($userId);
        }
    }

    private function getProfile(int $userId): void
    {
        try {
            mm_json($this->service->getProfile($userId));
        } catch (\PDOException $e) {
            error_log('Profile fetch failed: ' . $e->getMessage());
            mm_json(['error' => 'Unable to load profile'], 500);
        }
    }

    private function updateProfile(int $userId): void
    {
        $data = mm_filter_request([
            'full_name'     => ['type' => 'string', 'min_length' => 2, 'max_length' => 120, 'allow_empty' => false],
            'phone'         => ['type' => 'phone', 'empty_to_null' => true],
            'gender'        => ['type' => 'enum', 'empty_to_null' => true, 'values' => ['Male', 'Female', 'Other', 'Prefer Not to Say']],
            'dob'           => ['type' => 'date', 'empty_to_null' => true, 'not_in_future' => true],
            'bio'           => ['type' => 'string', 'empty_to_null' => true, 'max_length' => 500, 'preserve_newlines' => true],
            'username'      => ['type' => 'username'],
            'profile_photo' => ['type' => 'image_data_url', 'empty_to_null' => true, 'max_length' => 7340032],
        ]);

        try {
            $this->service->updateProfile($userId, $data);
            mm_json(['message' => 'Profile updated successfully']);
        } catch (\InvalidArgumentException $e) {
            mm_json(['error' => $e->getMessage()], 400);
        } catch (\PDOException $e) {
            error_log('Profile update failed: ' . $e->getMessage());
            if (($e->getCode() ?? '') === '23000') {
                mm_json(['error' => 'Profile update conflicts with an existing record'], 409);
            }
            mm_json(['error' => 'Unable to update profile'], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Onboarding
    // -------------------------------------------------------------------------

    /** POST /api/onboarding */
    public function onboarding(): void
    {
        mm_require_method('POST');

        $userId = mm_require_auth();
        CsrfMiddleware::validate();

        $data = mm_filter_request([
            'fullName'          => ['type' => 'string', 'required' => true, 'allow_empty' => false, 'min_length' => 2, 'max_length' => 120],
            'phone'             => ['type' => 'phone', 'empty_to_null' => true],
            'gender'            => ['type' => 'enum', 'required' => true, 'allow_empty' => false, 'values' => ['Male', 'Female', 'Other', 'Prefer Not to Say']],
            'dob'               => ['type' => 'date', 'required' => true, 'allow_empty' => false, 'not_in_future' => true],
            'gymFrequency'      => ['type' => 'enum', 'required' => true, 'allow_empty' => false, 'values' => ['1-2', '3-4', '5+']],
            'expertiseLevel'    => ['type' => 'enum', 'required' => true, 'allow_empty' => false, 'values' => ['beginner', 'intermediate', 'advanced']],
            'height'            => ['type' => 'float', 'required' => true, 'min' => 100, 'max' => 250, 'precision' => 2],
            'weight'            => ['type' => 'float', 'required' => true, 'min' => 30, 'max' => 200, 'precision' => 2],
            'dailyCalories'     => ['type' => 'int', 'empty_to_null' => true, 'min' => 1000, 'max' => 5000],
            'dietPreference'    => ['type' => 'enum', 'empty_to_null' => true, 'values' => ['omnivore', 'vegetarian', 'vegan', 'keto']],
            'workoutPlan'       => ['type' => 'enum', 'empty_to_null' => true, 'values' => ['full-body', 'push-pull-legs', 'upper-lower']],
            'workoutTime'       => ['type' => 'enum', 'empty_to_null' => true, 'values' => ['morning', 'afternoon', 'evening']],
            'goals'             => ['type' => 'string_array', 'default' => [], 'values' => ['fat-loss', 'muscle-gain', 'strength', 'endurance'], 'max_items' => 4],
            'allergies'         => ['type' => 'string', 'empty_to_null' => true, 'max_length' => 255],
            'supplements'       => ['type' => 'string', 'empty_to_null' => true, 'max_length' => 255],
            'medicalConditions' => ['type' => 'string', 'empty_to_null' => true, 'max_length' => 255],
            'referralCode'      => ['type' => 'string', 'empty_to_null' => true, 'max_length' => 10, 'transform' => 'upper', 'regex' => '/^[A-Z0-9]{6,10}$/'],
            'addFriends'        => ['type' => 'email', 'empty_to_null' => true],
            'username'          => ['type' => 'username', 'required' => true],
            'bio'               => ['type' => 'string', 'empty_to_null' => true, 'max_length' => 180, 'preserve_newlines' => true],
            'profilePhoto'      => ['type' => 'image_data_url', 'empty_to_null' => true, 'max_length' => 7340032],
        ]);

        try {
            $this->service->saveOnboarding($userId, $data);
            mm_json(['message' => 'Onboarding data saved successfully', 'user_id' => $userId]);
        } catch (\PDOException $e) {
            error_log('Onboarding save failed: ' . $e->getMessage());
            if (($e->getCode() ?? '') === '23000') {
                mm_json(['error' => 'Username already exists'], 409);
            }
            mm_json(['error' => 'Database error'], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Subscription
    // -------------------------------------------------------------------------

    /** POST /api/subscribe */
    public function subscribe(): void
    {
        mm_require_method('POST');

        $userId = mm_require_auth();
        CsrfMiddleware::validate();

        $data = mm_filter_request([
            'plan_name' => [
                'type'        => 'string',
                'required'    => true,
                'allow_empty' => false,
                'max_length'  => 50,
                'transform'   => 'lower',
                'regex'       => '/^(basic|pro|elite)$/',
            ],
        ]);

        try {
            $this->service->subscribe($userId, $data['plan_name']);
            mm_json(['message' => 'Subscribed to ' . $data['plan_name'] . ' successfully']);
        } catch (\Throwable $e) {
            error_log('Subscription failed: ' . $e->getMessage());
            mm_json(['error' => 'Subscription failed'], 500);
        }
    }
}
