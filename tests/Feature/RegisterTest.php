<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Pendaftaran akun (dua langkah: akun → detail profil).
 *
 * Berkas ini sebelumnya gagal seluruhnya karena ditulis untuk kontrak lama —
 * URL '/register' & '/register/info' dan redirect ke '/dashboard' — dan
 * sebagian besarnya masih bertanda "// sesuaikan", jadi memang belum pernah
 * disesuaikan dengan rute yang benar-benar ada.
 */
class RegisterTest extends TestCase
{
    use RefreshDatabase;

    /** Kata sandi yang lolos aturan: >=10 karakter, 1 kapital, 1 simbol !@#$%. */
    private const PASSWORD = 'Password12!';

    private function daftar(array $override = [])
    {
        return $this->post(route('auth.register.store'), array_merge([
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => self::PASSWORD,
            'confirmPassword' => self::PASSWORD,
        ], $override));
    }

    public function test_halaman_daftar_bisa_diakses(): void
    {
        $this->get(route('auth.register.index'))->assertOk();
    }

    public function test_pendaftaran_berhasil_lanjut_ke_pengisian_detail(): void
    {
        $this->daftar()->assertRedirect(route('auth.register.detail'));

        $this->assertDatabaseHas('users', [
            'username' => 'johndoe',
            'email' => 'john@example.com',
        ]);
    }

    public function test_kata_sandi_disimpan_dalam_bentuk_hash(): void
    {
        $this->daftar();

        $user = User::where('username', 'johndoe')->first();

        $this->assertNotSame(self::PASSWORD, $user->password);
        $this->assertTrue(Hash::check(self::PASSWORD, $user->password));
    }

    public function test_semua_kolom_wajib_diisi(): void
    {
        $this->post(route('auth.register.store'), [])
            ->assertSessionHasErrors(['username', 'email', 'password']);
    }

    public function test_username_harus_unik(): void
    {
        User::factory()->create(['username' => 'johndoe']);

        $this->daftar()->assertSessionHasErrors('username');
    }

    public function test_email_harus_unik(): void
    {
        User::factory()->create(['email' => 'john@example.com']);

        $this->daftar()->assertSessionHasErrors('email');
    }

    public function test_email_harus_berformat_benar(): void
    {
        $this->daftar(['email' => 'bukan-email'])->assertSessionHasErrors('email');
    }

    public function test_username_harus_huruf_kecil(): void
    {
        $this->daftar(['username' => 'JohnDoe'])->assertSessionHasErrors('username');
    }

    /**
     * Aturan kata sandi: minimal 10 karakter, ada huruf kapital, ada simbol
     * !@#$%, dan hanya memakai karakter yang diizinkan.
     *
     * Tiap kasus jadi test terpisah supaya sesi (dan pesan errornya) bersih —
     * dalam satu metode, error dari percobaan sebelumnya ikut terbawa.
     *
     * @return array<string, array{string}>
     */
    public static function kataSandiLemahProvider(): array
    {
        return [
            'terlalu pendek' => ['Pass12!'],
            'tanpa huruf kapital' => ['password12!'],
            'tanpa simbol' => ['Password123'],
            'memakai karakter terlarang' => ['Password12^'],
        ];
    }

    #[DataProvider('kataSandiLemahProvider')]
    public function test_kata_sandi_lemah_ditolak(string $password): void
    {
        $this->daftar([
            'password' => $password,
            'confirmPassword' => $password,
        ])->assertSessionHasErrors('password');

        // Database sudah berisi data seed, jadi yang diperiksa: user BARU ini
        // tidak ikut tersimpan — bukan jumlah total baris.
        $this->assertDatabaseMissing('users', ['username' => 'johndoe']);
    }

    public function test_konfirmasi_kata_sandi_harus_sama(): void
    {
        $this->daftar(['confirmPassword' => 'Berbeda12!'])
            ->assertSessionHasErrors('password');
    }

    public function test_halaman_detail_menolak_pengunjung_tanpa_sesi_daftar(): void
    {
        // Langkah kedua hanya boleh diakses setelah langkah pertama selesai.
        $this->get(route('auth.register.detail'))
            ->assertRedirect(route('auth.register.index'));
    }
}
