<?php

declare(strict_types=1);

function escape_post(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function sanitize_post(mixed $value): string
{
    return trim((string) $value);
}

$data = [
    'full_name' => sanitize_post($_POST['full_name'] ?? ''),
    'email' => strtolower(sanitize_post($_POST['email'] ?? '')),
    'gender' => sanitize_post($_POST['gender'] ?? ''),
    'password' => (string) ($_POST['password'] ?? ''),
    'fitness_goal' => sanitize_post($_POST['fitness_goal'] ?? ''),
    'experience_level' => sanitize_post($_POST['experience_level'] ?? ''),
    'training_days' => sanitize_post($_POST['training_days'] ?? ''),
    'notes' => sanitize_post($_POST['notes'] ?? ''),
];

$errors = [];

if ($data['full_name'] === '') {
    $errors[] = 'Full name is required.';
}

if ($data['email'] === '') {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Enter a valid email address.';
}

if ($data['gender'] === '') {
    $errors[] = 'Gender is required.';
}

if ($data['password'] === '') {
    $errors[] = 'Password is required.';
} elseif (strlen($data['password']) < 8) {
    $errors[] = 'Password must be at least 8 characters long.';
}

if ($data['fitness_goal'] === '') {
    $errors[] = 'Fitness goal is required.';
}

if ($data['experience_level'] === '') {
    $errors[] = 'Experience level is required.';
}

if ($data['training_days'] === '') {
    $errors[] = 'Training days per week is required.';
} elseif (!ctype_digit($data['training_days'])) {
    $errors[] = 'Training days must be a whole number.';
} else {
    $days = (int) $data['training_days'];
    if ($days < 1 || $days > 7) {
        $errors[] = 'Training days must be between 1 and 7.';
    }
}

if ($data['notes'] !== '' && mb_strlen($data['notes']) > 200) {
    $errors[] = 'Notes must be 200 characters or fewer.';
}

$passwordMask = $data['password'] === '' ? 'Not provided' : str_repeat('*', strlen($data['password']));
$isValid = $errors === [];
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Registration Result | MuscleMap</title>
    <link rel="stylesheet" href="../frontend/css/styles.css?v=20260416a" />
    <style>
      .result-shell { position: relative; z-index: 2; }
      .result-panel {
        display: grid;
        gap: 1.5rem;
        padding: 1.6rem;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: rgba(11, 13, 8, 0.92);
        box-shadow: var(--shadow);
      }
      .result-grid { display: grid; gap: 1rem; }
      @media (min-width: 900px) {
        .result-grid { grid-template-columns: 1.1fr 0.9fr; }
      }
      .result-card {
        padding: 1.2rem;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.03);
      }
      .result-meta { display: grid; gap: 0.85rem; }
      .result-meta-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 0.7rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .result-meta-row:last-child {
        border-bottom: 0;
        padding-bottom: 0;
      }
      .result-errors {
        margin: 0;
        padding-left: 1.1rem;
        color: #ff9b9b;
      }
      .result-code {
        margin: 0;
        padding: 1rem;
        overflow: auto;
        border-radius: 16px;
        background: rgba(0, 0, 0, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #dce9c8;
        font-size: 0.92rem;
      }
      .result-status-valid { color: var(--success); }
      .result-status-invalid { color: #ff9b9b; }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <div class="bg-grid"></div>
      <main class="result-shell">
        <section class="container" style="max-width: 1100px;">
          <div class="result-panel">
            <div>
              <h1 class="page-title" style="font-size: clamp(2.2rem, 5vw, 4rem); margin: 0.5rem 0 0.6rem;">Registration Summary</h1>
              <p class="muted" style="max-width: 56rem; margin: 0;">Your registration details were processed using the $_POST method.</p>
            </div>

            <div class="result-grid">
              <section class="result-card">
                <h2 class="section-title" style="font-size: 1.5rem; margin-top: 0;">Validation Summary</h2>
                <p class="<?php echo $isValid ? 'result-status-valid' : 'result-status-invalid'; ?>" style="font-weight: 700;">
                  <?php echo $isValid ? 'Registration details are valid and ready to display.' : 'Some fields need correction before the submission is considered valid.'; ?>
                </p>
                <?php if (!$isValid): ?>
                  <ul class="result-errors">
                    <?php foreach ($errors as $error): ?>
                      <li><?php echo escape_post($error); ?></li>
                    <?php endforeach; ?>
                  </ul>
                <?php endif; ?>

                <div class="result-meta" style="margin-top: 1.2rem;">
                  <div class="result-meta-row"><span class="muted">PHP Access Method</span><strong>$_POST</strong></div>
                  <div class="result-meta-row"><span class="muted">Full Name</span><strong><?php echo escape_post($data['full_name'] !== '' ? $data['full_name'] : 'Not provided'); ?></strong></div>
                  <div class="result-meta-row"><span class="muted">Email</span><strong><?php echo escape_post($data['email'] !== '' ? $data['email'] : 'Not provided'); ?></strong></div>
                  <div class="result-meta-row"><span class="muted">Gender</span><strong><?php echo escape_post($data['gender'] !== '' ? $data['gender'] : 'Not provided'); ?></strong></div>
                  <div class="result-meta-row"><span class="muted">Fitness Goal</span><strong><?php echo escape_post($data['fitness_goal'] !== '' ? $data['fitness_goal'] : 'Not provided'); ?></strong></div>
                  <div class="result-meta-row"><span class="muted">Experience Level</span><strong><?php echo escape_post($data['experience_level'] !== '' ? $data['experience_level'] : 'Not provided'); ?></strong></div>
                  <div class="result-meta-row"><span class="muted">Training Days / Week</span><strong><?php echo escape_post($data['training_days'] !== '' ? $data['training_days'] : 'Not provided'); ?></strong></div>
                  <div class="result-meta-row"><span class="muted">Password</span><strong><?php echo escape_post($passwordMask); ?></strong></div>
                  <div class="result-meta-row"><span class="muted">Notes</span><strong><?php echo escape_post($data['notes'] !== '' ? $data['notes'] : 'No notes submitted'); ?></strong></div>
                </div>
              </section>

              <section class="result-card">
                <h2 class="section-title" style="font-size: 1.5rem; margin-top: 0;">Raw Submission Snapshot</h2>
                <p class="muted">This page is independently handled by <code>post_registration.php</code>.</p>
                <pre class="result-code"><?php echo escape_post((string) json_encode($_POST, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)); ?></pre>
              </section>
            </div>

            <div>
              <a class="button button-primary" href="index.php">Try Another Submission</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>
