<?php

declare(strict_types=1);

$repoRoot = dirname(__DIR__, 2);

chdir($repoRoot);

$_SERVER['REQUEST_METHOD'] = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$_SERVER['REQUEST_URI'] = $_SERVER['REQUEST_URI'] ?? '/api/me';
$_SERVER['HTTP_HOST'] = $_SERVER['HTTP_HOST'] ?? 'localhost';
$_SERVER['HTTPS'] = $_SERVER['HTTPS'] ?? 'off';

require_once $repoRoot . '/backend/src/bootstrap.php';
