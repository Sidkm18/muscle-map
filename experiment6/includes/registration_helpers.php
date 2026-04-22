<?php

declare(strict_types=1);

function mm_assignment_method_label(string $method): string
{
    return match (strtoupper($method)) {
        'POST' => '$_POST',
        'GET' => '$_GET',
        default => '$_REQUEST',
    };
}

function mm_assignment_sanitize_string(mixed $value): string
{
    return trim((string) $value);
}

function mm_assignment_escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function mm_assignment_mask_password(string $password): string
{
    $length = strlen($password);

    if ($length === 0) {
        return '';
    }

    return str_repeat('*', $length);
}

function mm_assignment_validate_registration(array $input): array
{
    $sanitized = [
        'full_name' => mm_assignment_sanitize_string($input['full_name'] ?? ''),
        'email' => strtolower(mm_assignment_sanitize_string($input['email'] ?? '')),
        'gender' => mm_assignment_sanitize_string($input['gender'] ?? ''),
        'password' => (string) ($input['password'] ?? ''),
        'fitness_goal' => mm_assignment_sanitize_string($input['fitness_goal'] ?? ''),
        'experience_level' => mm_assignment_sanitize_string($input['experience_level'] ?? ''),
        'training_days' => mm_assignment_sanitize_string($input['training_days'] ?? ''),
        'notes' => mm_assignment_sanitize_string($input['notes'] ?? ''),
    ];

    $errors = [];

    if ($sanitized['full_name'] === '') {
        $errors['full_name'] = 'Full name is required.';
    } elseif (mb_strlen($sanitized['full_name']) > 80) {
        $errors['full_name'] = 'Full name must be 80 characters or fewer.';
    }

    if ($sanitized['email'] === '') {
        $errors['email'] = 'Email address is required.';
    } elseif (!filter_var($sanitized['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Enter a valid email address.';
    }

    if ($sanitized['gender'] === '') {
        $errors['gender'] = 'Gender is required.';
    }

    if ($sanitized['password'] === '') {
        $errors['password'] = 'Password is required.';
    } elseif (strlen($sanitized['password']) < 8) {
        $errors['password'] = 'Password must be at least 8 characters long.';
    }

    if ($sanitized['fitness_goal'] === '') {
        $errors['fitness_goal'] = 'Select a fitness goal.';
    }

    if ($sanitized['experience_level'] === '') {
        $errors['experience_level'] = 'Select an experience level.';
    }

    if ($sanitized['training_days'] === '') {
        $errors['training_days'] = 'Training days per week is required.';
    } elseif (!ctype_digit($sanitized['training_days'])) {
        $errors['training_days'] = 'Training days must be a whole number.';
    } else {
        $days = (int) $sanitized['training_days'];
        if ($days < 1 || $days > 7) {
            $errors['training_days'] = 'Training days must be between 1 and 7.';
        }
    }

    if ($sanitized['notes'] !== '' && mb_strlen($sanitized['notes']) > 200) {
        $errors['notes'] = 'Notes must be 200 characters or fewer.';
    }

    return [
        'is_valid' => $errors === [],
        'errors' => $errors,
        'sanitized' => $sanitized,
    ];
}

function mm_assignment_render_output(array $context): void
{
    $title = $context['title'];
    $description = $context['description'];
    $methodLabel = $context['method_label'];
    $formAction = $context['form_action'];
    $submittedData = $context['submitted_data'];
    $validation = $context['validation'];
    $isValid = $validation['is_valid'];
    $errors = $validation['errors'];
    $sanitized = $validation['sanitized'];

    ?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo mm_assignment_escape($title); ?> | MuscleMap</title>
    <link rel="stylesheet" href="../frontend/css/styles.css?v=20260416a" />
    <style>
      .assignment-shell {
        position: relative;
        z-index: 2;
      }

      .assignment-panel {
        display: grid;
        gap: 1.5rem;
        padding: 1.6rem;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: rgba(11, 13, 8, 0.92);
        box-shadow: var(--shadow);
      }

      .assignment-grid {
        display: grid;
        gap: 1rem;
      }

      @media (min-width: 900px) {
        .assignment-grid {
          grid-template-columns: 1.1fr 0.9fr;
        }
      }

      .assignment-card {
        padding: 1.2rem;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.03);
      }

      .assignment-meta {
        display: grid;
        gap: 0.85rem;
      }

      .assignment-meta-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 0.7rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .assignment-meta-row:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }

      .assignment-errors {
        margin: 0;
        padding-left: 1.1rem;
        color: #ff9b9b;
      }

      .assignment-code {
        margin: 0;
        padding: 1rem;
        overflow: auto;
        border-radius: 16px;
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #dce9c8;
        font-size: 0.92rem;
      }

      .assignment-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
      }

      .assignment-status-valid {
        color: var(--success);
      }

      .assignment-status-invalid {
        color: #ff9b9b;
      }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <div class="bg-grid"></div>
      <main class="assignment-shell">
        <section class="container" style="max-width: 1100px;">
          <div class="assignment-panel">
            <div>
              <h1 class="page-title" style="font-size: clamp(2.2rem, 5vw, 4rem); margin: 0.5rem 0 0.6rem;">Registration Summary</h1>
              <p class="muted" style="max-width: 56rem; margin: 0;"><?php echo mm_assignment_escape($description); ?></p>
            </div>

            <div class="assignment-grid">
              <section class="assignment-card">
                <h2 class="section-title" style="font-size: 1.5rem; margin-top: 0;">Validation Summary</h2>
                <p class="<?php echo $isValid ? 'assignment-status-valid' : 'assignment-status-invalid'; ?>" style="font-weight: 700;">
                  <?php echo $isValid ? 'Registration details are valid and ready to display.' : 'Some fields need correction before the submission is considered valid.'; ?>
                </p>
                <?php if (!$isValid): ?>
                  <ul class="assignment-errors">
                    <?php foreach ($errors as $error): ?>
                      <li><?php echo mm_assignment_escape($error); ?></li>
                    <?php endforeach; ?>
                  </ul>
                <?php endif; ?>

                <div class="assignment-meta" style="margin-top: 1.2rem;">
                  <div class="assignment-meta-row">
                    <span class="muted">PHP Access Method</span>
                    <strong><?php echo mm_assignment_escape($methodLabel); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Full Name</span>
                    <strong><?php echo mm_assignment_escape($sanitized['full_name'] !== '' ? $sanitized['full_name'] : 'Not provided'); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Email</span>
                    <strong><?php echo mm_assignment_escape($sanitized['email'] !== '' ? $sanitized['email'] : 'Not provided'); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Gender</span>
                    <strong><?php echo mm_assignment_escape($sanitized['gender'] !== '' ? $sanitized['gender'] : 'Not provided'); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Fitness Goal</span>
                    <strong><?php echo mm_assignment_escape($sanitized['fitness_goal'] !== '' ? $sanitized['fitness_goal'] : 'Not provided'); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Experience Level</span>
                    <strong><?php echo mm_assignment_escape($sanitized['experience_level'] !== '' ? $sanitized['experience_level'] : 'Not provided'); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Training Days / Week</span>
                    <strong><?php echo mm_assignment_escape($sanitized['training_days'] !== '' ? $sanitized['training_days'] : 'Not provided'); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Password</span>
                    <strong><?php echo mm_assignment_escape(mm_assignment_mask_password($sanitized['password'])); ?></strong>
                  </div>
                  <div class="assignment-meta-row">
                    <span class="muted">Notes</span>
                    <strong><?php echo mm_assignment_escape($sanitized['notes'] !== '' ? $sanitized['notes'] : 'No notes submitted'); ?></strong>
                  </div>
                </div>
              </section>

              <section class="assignment-card">
                <h2 class="section-title" style="font-size: 1.5rem; margin-top: 0;">Raw Submission Snapshot</h2>
                <p class="muted">This view helps demonstrate how the server receives user input before rendering structured output.</p>
                <pre class="assignment-code"><?php echo mm_assignment_escape((string) json_encode($submittedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)); ?></pre>
              </section>
            </div>

            <div class="assignment-actions">
              <a class="button button-primary" href="<?php echo mm_assignment_escape($formAction); ?>">Try Another Submission</a>
              <a class="button" href="../frontend/index.html" style="display: inline-flex; align-items: center; justify-content: center; min-width: 12rem; padding: 0.85rem 1.1rem; border-radius: 999px; border: 1px solid var(--line);">Back to MuscleMap</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>
<?php
}
