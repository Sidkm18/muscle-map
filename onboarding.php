<?php

declare(strict_types=1);

require_once __DIR__ . '/frontend/php/page-helpers.php';

mm_render_frontend_page(__DIR__ . '/frontend/pages/onboarding.html', [
    'requires_auth' => true,
]);
