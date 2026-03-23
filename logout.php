<?php

declare(strict_types=1);

require_once __DIR__ . '/frontend/php/page-helpers.php';

mm_destroy_session();

header('Content-Type: text/html; charset=UTF-8');
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url=<?= htmlspecialchars(mm_page_url('login.php'), ENT_QUOTES, 'UTF-8') ?>" />
    <title>Logging Out | MuscleMap</title>
  </head>
  <body>
    <script>
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('userOnboardingData');
      localStorage.removeItem('onboardingProgress');
      localStorage.removeItem('userAvatarPreview');
      window.location.replace(<?= json_encode(mm_page_url('login.php')) ?>);
    </script>
  </body>
</html>
