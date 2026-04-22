<?php

declare(strict_types=1);

require __DIR__ . '/../experiment6/includes/registration_helpers.php';

function assert_true(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "Assertion failed: {$message}\n");
        exit(1);
    }
}

$validInput = [
    'full_name' => 'Sid Kamath',
    'email' => 'sid@example.com',
    'gender' => 'Male',
    'password' => 'StrongPass123!',
    'fitness_goal' => 'Build Muscle',
    'experience_level' => 'Intermediate',
    'training_days' => '5',
];

$result = mm_assignment_validate_registration($validInput);

assert_true($result['is_valid'] === true, 'valid payload should pass validation');
assert_true($result['sanitized']['email'] === 'sid@example.com', 'email should remain normalized');
assert_true($result['sanitized']['training_days'] === '5', 'training days should be preserved');

$invalidInput = [
    'full_name' => '',
    'email' => 'not-an-email',
    'gender' => '',
    'password' => '123',
    'fitness_goal' => '',
    'experience_level' => '',
    'training_days' => '8',
];

$invalid = mm_assignment_validate_registration($invalidInput);

assert_true($invalid['is_valid'] === false, 'invalid payload should fail validation');
assert_true(isset($invalid['errors']['full_name']), 'missing name should be reported');
assert_true(isset($invalid['errors']['email']), 'invalid email should be reported');
assert_true(isset($invalid['errors']['training_days']), 'out of range training days should be reported');

assert_true(mm_assignment_mask_password('StrongPass123!') === '**************', 'password mask should match password length');

fwrite(STDOUT, "Experiment 6 helper tests passed.\n");
