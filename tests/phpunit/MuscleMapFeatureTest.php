<?php

declare(strict_types=1);

use App\Support\ProfilePhotoStorage;
use PHPUnit\Framework\TestCase;

final class MuscleMapFeatureTest extends TestCase
{
    protected function setUp(): void
    {
        $_SESSION = [];
        $_COOKIE = [];
        $_ENV['REMEMBER_ME_SECRET'] = 'phpunit-secret-key';
        $_ENV['REMEMBER_ME_TTL'] = '604800';
    }

    public function testMuscleMapRegistrationGeneratesCleanUsernameFromEmail(): void
    {
        $username = mm_username_from_email('Sid.Kamath+Gym@Example.com');

        $this->assertSame('sid_kamath_gym', $username);
    }

    public function testMuscleMapLoginStartsAuthenticatedSessionForUser(): void
    {
        $_SESSION['csrf_token'] = 'old-token';

        mm_start_session_user([
            'id' => 126,
            'email' => 'sid@example.com',
        ]);

        $this->assertSame(126, $_SESSION['user_id']);
        $this->assertSame('sid@example.com', $_SESSION['email']);
        $this->assertArrayNotHasKey('csrf_token', $_SESSION);
    }

    public function testMuscleMapRememberMeCreatesPersistentCookiePayload(): void
    {
        mm_issue_remember_me_cookie([
            'id' => 126,
            'email' => 'sid@example.com',
            'password_hash' => 'hashed-password-value',
        ]);

        $this->assertArrayHasKey('mm_remember_me', $_COOKIE);

        $decoded = base64_decode((string) $_COOKIE['mm_remember_me'], true);
        $payload = is_string($decoded) ? json_decode($decoded, true) : null;

        $this->assertIsArray($payload);
        $this->assertSame(126, $payload['user_id']);
        $this->assertSame('sid@example.com', $payload['email']);
        $this->assertIsInt($payload['expires']);
        $this->assertNotSame('', $payload['signature']);
    }

    public function testMuscleMapLogoutClearsRememberMeCookieState(): void
    {
        $_COOKIE['mm_remember_me'] = 'temporary-cookie';

        mm_clear_remember_me_cookie();

        $this->assertArrayNotHasKey('mm_remember_me', $_COOKIE);
    }

    public function testMuscleMapProfileRejectsInvalidPhotoUploadInput(): void
    {
        $storage = new ProfilePhotoStorage(dirname(__DIR__, 2), '/muscle-map');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Profile photo must be uploaded as a PNG, JPG, GIF, or WEBP image.');

        $storage->prepare(126, 'https://example.com/avatar.png', null);
    }
}
