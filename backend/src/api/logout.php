<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

if (mm_is_authenticated()) {
    mm_require_csrf();
}

mm_clear_remember_me_cookie();
mm_destroy_session();

mm_json([
    'message' => 'Logged out successfully',
    'authenticated' => false,
    'user' => null,
]);
