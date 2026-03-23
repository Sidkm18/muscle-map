<?php

require_once __DIR__ . '/../bootstrap.php';

mm_require_method('POST');

mm_destroy_session();

mm_json(['message' => 'Logged out successfully']);
