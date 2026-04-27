<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    // ==========================================
    // STEP 1 — Daftar Akun
    // (username, email, password, konfirmasi)
    // ==========================================

    // ✅ Halaman register bisa diakses
    public function test_register_page_is_accessible(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    // ✅ Step 1 berhasil dengan data valid
    public function test_user_can_submit_register_step1_with_valid_data(): void
    {
        $response = $this->post('/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        // Sesuaikan route redirect ke step 2
        $response->assertRedirect('/register/info'); // sesuaikan
    }

    // ❌ Step 1 gagal jika username kosong
    public function test_register_step1_requires_username(): void
    {
        $response = $this->post('/register', [
            'username' => '',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['username']);
    }

    // ❌ Step 1 gagal jika username sudah dipakai
    public function test_register_step1_fails_if_username_taken(): void
    {
        User::factory()->create(['username' => 'johndoe']);

        $response = $this->post('/register', [
            'username' => 'johndoe',
            'email' => 'baru@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['username']);
    }

    // ❌ Step 1 gagal jika email kosong
    public function test_register_step1_requires_email(): void
    {
        $response = $this->post('/register', [
            'username' => 'johndoe',
            'email' => '',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    // ❌ Step 1 gagal jika email format tidak valid
    public function test_register_step1_requires_valid_email(): void
    {
        $response = $this->post('/register', [
            'username' => 'johndoe',
            'email' => 'bukan-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    // ❌ Step 1 gagal jika email sudah dipakai
    public function test_register_step1_fails_if_email_taken(): void
    {
        User::factory()->create(['email' => 'john@example.com']);

        $response = $this->post('/register', [
            'username' => 'johndoe2',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    // ❌ Step 1 gagal jika password kosong
    public function test_register_step1_requires_password(): void
    {
        $response = $this->post('/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => '',
            'password_confirmation' => '',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    // ❌ Step 1 gagal jika password kurang dari 8 karakter
    public function test_register_step1_fails_if_password_too_short(): void
    {
        $response = $this->post('/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    // ❌ Step 1 gagal jika konfirmasi password tidak cocok
    public function test_register_step1_fails_if_password_confirmation_mismatch(): void
    {
        $response = $this->post('/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'passwordbeda',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    // ==========================================
    // STEP 2 — Informasi Akun
    // (nama_lengkap, tanggal_lahir, jenis_kelamin, provinsi, agreement)
    // ==========================================

    // ✅ Step 2 berhasil dengan data valid → user tersimpan dan login otomatis
    public function test_user_can_submit_register_step2_with_valid_data(): void
    {
        $response = $this->post('/register/info', [ // sesuaikan route
            'nama_lengkap' => 'John Doe',
            'tanggal_lahir' => '2000-01-15',
            'jenis_kelamin' => 'Laki-laki',
            'provinsi' => 'Jawa Barat',
            'agreement' => true,
        ]);

        $response->assertRedirect('/dashboard'); // sesuaikan
        $this->assertAuthenticated();
    }

    // ❌ Step 2 gagal jika nama lengkap kosong
    public function test_register_step2_requires_nama_lengkap(): void
    {
        $response = $this->post('/register/info', [
            'nama_lengkap' => '',
            'tanggal_lahir' => '2000-01-15',
            'jenis_kelamin' => 'Laki-laki',
            'provinsi' => 'Jawa Barat',
            'agreement' => true,
        ]);

        $response->assertSessionHasErrors(['nama_lengkap']);
    }

    // ❌ Step 2 gagal jika tanggal lahir kosong
    public function test_register_step2_requires_tanggal_lahir(): void
    {
        $response = $this->post('/register/info', [
            'nama_lengkap' => 'John Doe',
            'tanggal_lahir' => '',
            'jenis_kelamin' => 'Laki-laki',
            'provinsi' => 'Jawa Barat',
            'agreement' => true,
        ]);

        $response->assertSessionHasErrors(['tanggal_lahir']);
    }

    // ❌ Step 2 gagal jika tanggal lahir format tidak valid
    public function test_register_step2_requires_valid_tanggal_lahir(): void
    {
        $response = $this->post('/register/info', [
            'nama_lengkap' => 'John Doe',
            'tanggal_lahir' => 'bukan-tanggal',
            'jenis_kelamin' => 'Laki-laki',
            'provinsi' => 'Jawa Barat',
            'agreement' => true,
        ]);

        $response->assertSessionHasErrors(['tanggal_lahir']);
    }

    // ❌ Step 2 gagal jika jenis kelamin kosong
    public function test_register_step2_requires_jenis_kelamin(): void
    {
        $response = $this->post('/register/info', [
            'nama_lengkap' => 'John Doe',
            'tanggal_lahir' => '2000-01-15',
            'jenis_kelamin' => '',
            'provinsi' => 'Jawa Barat',
            'agreement' => true,
        ]);

        $response->assertSessionHasErrors(['jenis_kelamin']);
    }

    // ❌ Step 2 gagal jika provinsi kosong
    public function test_register_step2_requires_provinsi(): void
    {
        $response = $this->post('/register/info', [
            'nama_lengkap' => 'John Doe',
            'tanggal_lahir' => '2000-01-15',
            'jenis_kelamin' => 'Laki-laki',
            'provinsi' => '',
            'agreement' => true,
        ]);

        $response->assertSessionHasErrors(['provinsi']);
    }

    // ❌ Step 2 gagal jika agreement tidak dicentang
    public function test_register_step2_requires_agreement(): void
    {
        $response = $this->post('/register/info', [
            'nama_lengkap' => 'John Doe',
            'tanggal_lahir' => '2000-01-15',
            'jenis_kelamin' => 'Laki-laki',
            'provinsi' => 'Jawa Barat',
            'agreement' => false,
        ]);

        $response->assertSessionHasErrors(['agreement']);
    }

    // ==========================================
    // KEAMANAN
    // ==========================================

    // ✅ Password tidak disimpan dalam bentuk plain text
    public function test_password_is_hashed_after_register(): void
    {
        $this->post('/register', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $user = User::where('email', 'john@example.com')->first();

        if ($user) {
            $this->assertNotEquals('password123', $user->password);
            $this->assertTrue(Hash::check('password123', $user->password));
        } else {
            // User baru tersimpan setelah step 2 selesai — skip jika flow 2 step
            $this->markTestSkipped('User disimpan setelah step 2 selesai.');
        }
    }

    // ✅ User yang sudah login diarahkan keluar dari halaman register
    public function test_authenticated_user_is_redirected_from_register_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/register');

        $response->assertRedirect('/dashboard'); // sesuaikan
    }
}
