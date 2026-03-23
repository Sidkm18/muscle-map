<?php

require_once __DIR__ . '/../bootstrap.php';

mm_destroy_session();

mm_json(['message' => 'Logged out successfully']);
