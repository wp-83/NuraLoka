<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Autentikasi login.
 *
 * Berkas ini sebelumnya gagal seluruhnya karena ditulis untuk kontrak lama:
 * URL '/login' (sekarang '/auth/login'), field 'login' & 'remember'
 * (sekarang 'identity' & 'rememberMe'), dan redirect ke '/dashboard'
 * (sekarang route home.index).
 */
class LoginTest extends TestCase
{
    use RefreshDatabase;

    private function buatUser(array $override = []): User
    {
        return User::factory()->create(array_merge([
            'username' => 'johndoe',
            'email' => 'user@example.com',
            'password' => bcrypt('password123'),
        ], $override));
    }

    private function login(array $payload)
    {
        return $this->post(route('auth.login.authenticate'), $payload);
    }

    public function test_halaman_login_bisa_diakses(): void
    {
        $this->get(route('auth.login.index'))->assertOk();
    }

    public function test_bisa_login_dengan_email(): void
    {
        $user = $this->buatUser();

        $this->login(['identity' => 'user@example.com', 'password' => 'password123'])
            ->assertRedirect(route('home.index'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_bisa_login_dengan_username(): void
    {
        $user = $this->buatUser();

        $this->login(['identity' => 'johndoe', 'password' => 'password123'])
            ->assertRedirect(route('home.index'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_bisa_login_dengan_ingat_saya(): void
    {
        $user = $this->buatUser();

        $this->login([
            'identity' => 'user@example.com',
            'password' => 'password123',
            'rememberMe' => true,
        ])->assertRedirect(route('home.index'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_password_salah_ditolak(): void
    {
        $this->buatUser();

        $this->login(['identity' => 'user@example.com', 'password' => 'salah'])
            ->assertRedirect(route('auth.login.index'));

        $this->assertGuest();
    }

    public function test_user_tidak_terdaftar_ditolak(): void
    {
        $this->login(['identity' => 'entah@example.com', 'password' => 'password123'])
            ->assertRedirect(route('auth.login.index'));

        $this->assertGuest();
    }

    public function test_identity_dan_password_wajib_diisi(): void
    {
        $this->login([])->assertSessionHasErrors(['identity', 'password']);

        $this->assertGuest();
    }

    public function test_user_bisa_logout(): void
    {
        $user = $this->buatUser();

        $this->actingAs($user)
            ->post(route('auth.logout'))
            ->assertRedirect();

        $this->assertGuest();
    }
}
