<?php

declare(strict_types=1);

require_once __DIR__ . '/../../backend/src/bootstrap.php';

if (!function_exists('mm_page_base_path')) {
    function mm_page_base_path(): string
    {
        $scriptName = (string) ($_SERVER['SCRIPT_NAME'] ?? '');
        $directory = str_replace('\\', '/', dirname($scriptName));

        if ($directory === '/' || $directory === '\\' || $directory === '.') {
            return '';
        }

        return rtrim($directory, '/');
    }
}

if (!function_exists('mm_page_url')) {
    function mm_page_url(string $path = ''): string
    {
        $basePath = mm_page_base_path();
        $normalizedPath = ltrim($path, '/');

        if ($normalizedPath === '') {
            return $basePath === '' ? '/' : $basePath . '/';
        }

        return ($basePath === '' ? '' : $basePath) . '/' . $normalizedPath;
    }
}

if (!function_exists('mm_is_authenticated')) {
    function mm_is_authenticated(): bool
    {
        $userId = $_SESSION['user_id'] ?? null;

        return is_numeric($userId) && (int) $userId > 0;
    }
}

if (!function_exists('mm_redirect')) {
    function mm_redirect(string $path): never
    {
        header('Location: ' . mm_page_url($path));
        exit();
    }
}

if (!function_exists('mm_render_frontend_page')) {
    function mm_render_frontend_page(string $sourceFile, array $options = []): never
    {
        $requiresAuth = (bool) ($options['requires_auth'] ?? false);
        $guestOnly = (bool) ($options['guest_only'] ?? false);
        $redirectTo = (string) ($options['redirect_to'] ?? 'profile.php');
        $authenticated = mm_is_authenticated();

        if ($requiresAuth && !$authenticated) {
            mm_redirect('login.php');
        }

        if ($guestOnly && $authenticated) {
            mm_redirect($redirectTo);
        }

        $markup = file_get_contents($sourceFile);
        if ($markup === false) {
            http_response_code(500);
            header('Content-Type: text/plain; charset=UTF-8');
            echo 'Unable to load page.';
            exit();
        }

        $pageBase = mm_page_url('');
        $replacements = [
            './css/styles.css' => mm_page_url('frontend/css/styles.css'),
            '../css/styles.css' => mm_page_url('frontend/css/styles.css'),
            './js/site-runtime.js' => mm_page_url('frontend/js/site-runtime.js'),
            './js/site.js' => mm_page_url('frontend/js/site.js'),
            './js/login.js' => mm_page_url('frontend/js/login.js'),
            './js/register.js' => mm_page_url('frontend/js/register.js'),
            './js/profile.js' => mm_page_url('frontend/js/profile.js'),
            './js/onboarding.js' => mm_page_url('frontend/js/onboarding.js'),
            './js/calculator.js' => mm_page_url('frontend/js/calculator.js'),
            './js/pricing.js' => mm_page_url('frontend/js/pricing.js'),
            './js/exercises.js' => mm_page_url('frontend/js/exercises.js'),
            './js/contact.js' => mm_page_url('frontend/js/contact.js'),
            './js/catalogue.js' => mm_page_url('frontend/js/catalogue.js'),
            './js/social.js' => mm_page_url('frontend/js/social.js'),
            './js/posts.js' => mm_page_url('frontend/js/posts.js'),
            './js/social-profile.js' => mm_page_url('frontend/js/social-profile.js'),
            '../js/site-runtime.js' => mm_page_url('frontend/js/site-runtime.js'),
            '../js/site.js' => mm_page_url('frontend/js/site.js'),
            '../js/login.js' => mm_page_url('frontend/js/login.js'),
            '../js/register.js' => mm_page_url('frontend/js/register.js'),
            '../js/profile.js' => mm_page_url('frontend/js/profile.js'),
            '../js/onboarding.js' => mm_page_url('frontend/js/onboarding.js'),
            '../js/calculator.js' => mm_page_url('frontend/js/calculator.js'),
            '../js/pricing.js' => mm_page_url('frontend/js/pricing.js'),
            '../js/exercises.js' => mm_page_url('frontend/js/exercises.js'),
            '../js/contact.js' => mm_page_url('frontend/js/contact.js'),
            '../js/catalogue.js' => mm_page_url('frontend/js/catalogue.js'),
            '../js/social.js' => mm_page_url('frontend/js/social.js'),
            '../js/posts.js' => mm_page_url('frontend/js/posts.js'),
            '../js/social-profile.js' => mm_page_url('frontend/js/social-profile.js'),
            './index.html' => $pageBase,
            './pages/posts.html' => mm_page_url('posts.php'),
            './pages/exercises.html' => mm_page_url('exercises.php'),
            './pages/catalogue.html' => mm_page_url('catalogue.php'),
            './pages/calculator.html' => mm_page_url('calculator.php'),
            './pages/pricing.html' => mm_page_url('pricing.php'),
            './pages/login.html' => mm_page_url('login.php'),
            './pages/register.html' => mm_page_url('register.php'),
            './pages/profile.html' => mm_page_url('profile.php'),
            './pages/social-profile.html' => mm_page_url('social-profile.php'),
            './pages/onboarding.html' => mm_page_url('onboarding.php'),
            './pages/about.html' => mm_page_url('about.php'),
            './pages/contact.html' => mm_page_url('contact.php'),
            './pages/privacy.html' => mm_page_url('privacy.php'),
            './pages/terms.html' => mm_page_url('terms.php'),
            './register.html' => mm_page_url('register.php'),
            './login.html' => mm_page_url('login.php'),
            './profile.html' => mm_page_url('profile.php'),
            './onboarding.html' => mm_page_url('onboarding.php'),
            './about.html' => mm_page_url('about.php'),
            './contact.html' => mm_page_url('contact.php'),
            './privacy.html' => mm_page_url('privacy.php'),
            './terms.html' => mm_page_url('terms.php'),
            './posts.html' => mm_page_url('posts.php'),
            './calculator.html' => mm_page_url('calculator.php'),
            './pricing.html' => mm_page_url('pricing.php'),
            './exercises.html' => mm_page_url('exercises.php'),
            './catalogue.html' => mm_page_url('catalogue.php'),
            './social-profile.html' => mm_page_url('social-profile.php'),
        ];

        $markup = strtr($markup, $replacements);

        $bodyAttributes = ' data-api-base="' . htmlspecialchars(mm_page_url('api'), ENT_QUOTES, 'UTF-8') . '"'
            . ' data-page-base="' . htmlspecialchars($pageBase, ENT_QUOTES, 'UTF-8') . '"'
            . ' data-authenticated="' . ($authenticated ? 'true' : 'false') . '"';
        $markup = preg_replace('/<body([^>]*)>/', '<body$1' . $bodyAttributes . '>', $markup, 1) ?? $markup;

        header('Content-Type: text/html; charset=UTF-8');
        echo $markup;
        exit();
    }
}
