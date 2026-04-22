<?php

declare(strict_types=1);
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Create Account | MuscleMap</title>
    <link rel="stylesheet" href="../frontend/css/styles.css?v=20260416a" />
    <style>
      .assignment-shell { position: relative; z-index: 2; }
      .assignment-form { display: grid; gap: 1rem; }
      .assignment-grid { display: grid; gap: 1rem; }
      @media (min-width: 700px) { .assignment-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      .assignment-field { display: grid; gap: 0.45rem; }
      .assignment-field input, .assignment-field select, .assignment-field textarea {
        width: 100%; padding: 0.95rem 1rem; border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px; background: rgba(255, 255, 255, 0.04); color: var(--text); font: inherit;
      }
      .assignment-field textarea { min-height: 116px; resize: vertical; }
      .assignment-field input:focus, .assignment-field select:focus, .assignment-field textarea:focus {
        outline: 2px solid rgba(var(--primary-rgb), 0.35); border-color: rgba(var(--primary-rgb), 0.5);
      }
      .assignment-radio-group { display: flex; flex-wrap: wrap; gap: 0.75rem; }
      .assignment-radio {
        display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.8rem 1rem; border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12); background: rgba(255, 255, 255, 0.03);
      }
      .assignment-radio input { margin: 0; }
      .assignment-hint { color: var(--muted); font-size: 0.94rem; }
      .assignment-error { min-height: 1rem; color: #ff9b9b; font-size: 0.86rem; }
    </style>
  </head>
  <body>
    <div class="page-shell">
      <div class="bg-grid"></div>
      <main class="assignment-shell">
        <section class="container" style="max-width:1020px;">
          <div class="grid-2 glass-card" style="overflow:hidden; align-items:stretch;">
            <div style="min-height:450px; background:url('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1600') center/cover no-repeat;"></div>
            <div class="card" style="padding:2rem;">
              <h1 class="page-title" style="font-size:2rem; margin:.2rem 0;">Create Account</h1>
              <p class="muted">Set up your account and start building a consistent training log.</p>
              <form id="experiment6-form" class="assignment-form" action="request_registration.php" method="post" novalidate style="margin-top:1rem;">
                <div class="assignment-grid">
                  <div class="assignment-field"><label class="mini-label" for="full_name">Full Name</label><input id="full_name" name="full_name" type="text" placeholder="John Doe" /><div class="assignment-error" data-error-for="full_name"></div></div>
                  <div class="assignment-field"><label class="mini-label" for="email">Email Address</label><input id="email" name="email" type="email" placeholder="name@example.com" /><div class="assignment-error" data-error-for="email"></div></div>
                </div>
                <div class="assignment-field">
                  <span class="mini-label">Gender</span>
                  <div class="assignment-radio-group">
                    <label class="assignment-radio"><input type="radio" name="gender" value="Male" /> Male</label>
                    <label class="assignment-radio"><input type="radio" name="gender" value="Female" /> Female</label>
                    <label class="assignment-radio"><input type="radio" name="gender" value="Other" /> Other</label>
                  </div>
                  <div class="assignment-error" data-error-for="gender"></div>
                </div>
                <div class="assignment-grid">
                  <div class="assignment-field"><label class="mini-label" for="password">Password</label><input id="password" name="password" type="password" placeholder="Create a password" /><div class="assignment-error" data-error-for="password"></div></div>
                  <div class="assignment-field"><label class="mini-label" for="training_days">Training Days Per Week</label><input id="training_days" name="training_days" type="number" min="1" max="7" placeholder="4" /><div class="assignment-error" data-error-for="training_days"></div></div>
                </div>
                <div class="assignment-grid">
                  <div class="assignment-field"><label class="mini-label" for="fitness_goal">Fitness Goal</label><select id="fitness_goal" name="fitness_goal"><option value="">Select a goal</option><option value="Build Muscle">Build Muscle</option><option value="Lose Fat">Lose Fat</option><option value="Increase Strength">Increase Strength</option><option value="Improve Endurance">Improve Endurance</option></select><div class="assignment-error" data-error-for="fitness_goal"></div></div>
                  <div class="assignment-field"><label class="mini-label" for="experience_level">Experience Level</label><select id="experience_level" name="experience_level"><option value="">Select experience level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select><div class="assignment-error" data-error-for="experience_level"></div></div>
                </div>
                <div class="assignment-field"><label class="mini-label" for="notes">Workout Notes</label><textarea id="notes" name="notes" placeholder="Optional: mention your training focus or routine."></textarea><div class="assignment-hint">Optional notes for your training focus.</div><div class="assignment-error" data-error-for="notes"></div></div>
                <div class="assignment-field"><div id="form-status" class="assignment-error" aria-live="polite"></div></div>
                <button class="button button-primary" type="submit">Create Account</button>
              </form>
              <p class="muted">Already registered? <a class="primary-text" href="../frontend/pages/login.html">Sign in</a></p>
            </div>
          </div>
        </section>
      </main>
    </div>
    <script src="registration-validation.js"></script>
  </body>
</html>
