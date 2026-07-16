<?php

namespace Tests\Feature\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'username' => 'admin_nuraloka',
            'email' => 'admin@nuraloka.com',
        ]);
        $this->admin->assignRole('admin');
    }

    // =========================================================================
    // CREATE
    // =========================================================================

    /**
     * TC-UM-01: Admin dapat membuat user baru dengan data valid
     */
    public function test_admin_can_create_new_user(): void
    {
        $payload = [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'password' => 'Secret@123',
            'role' => 'user',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/users', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'username', 'email', 'created_at'],
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'newuser',
            'email' => 'newuser@example.com',
        ]);
    }

    /**
     * TC-UM-02: Admin gagal membuat user jika email sudah terdaftar
     */
    public function test_admin_create_user_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/users', [
                'username' => 'anotheruser',
                'email' => 'existing@example.com',
                'password' => 'Secret@123',
                'role' => 'user',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-UM-03: Admin gagal membuat user jika username sudah dipakai
     */
    public function test_admin_create_user_fails_with_duplicate_username(): void
    {
        User::factory()->create(['username' => 'existinguser']);

        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/users', [
                'username' => 'existinguser',
                'email' => 'unique@example.com',
                'password' => 'Secret@123',
                'role' => 'user',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    /**
     * TC-UM-04: User biasa tidak dapat mengakses endpoint create user
     */
    public function test_regular_user_cannot_create_new_user(): void
    {
        $regularUser = User::factory()->create();

        $response = $this->actingAs($regularUser)
            ->postJson('/api/admin/users', [
                'username' => 'unauthorizedcreate',
                'email' => 'unauthorized@example.com',
                'password' => 'Secret@123',
                'role' => 'user',
            ]);

        $response->assertStatus(403);
    }

    // =========================================================================
    // READ
    // =========================================================================

    /**
     * TC-UM-05: Admin dapat melihat daftar semua user
     */
    public function test_admin_can_view_all_users(): void
    {
        User::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'username', 'email', 'created_at'],
                ],
                'meta' => ['total', 'per_page', 'current_page'],
            ]);
    }

    /**
     * TC-UM-06: Admin dapat melihat detail satu user
     */
    public function test_admin_can_view_single_user(): void
    {
        $targetUser = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/users/{$targetUser->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $targetUser->id,
                'username' => $targetUser->username,
                'email' => $targetUser->email,
            ]);
    }

    /**
     * TC-UM-07: User biasa tidak dapat mengakses daftar user
     */
    public function test_regular_user_cannot_view_all_users(): void
    {
        $regularUser = User::factory()->create();

        $response = $this->actingAs($regularUser)
            ->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    /**
     * TC-UM-08: Mengembalikan 404 jika user tidak ditemukan
     */
    public function test_returns_404_for_nonexistent_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/users/999999');

        $response->assertStatus(404);
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    /**
     * TC-UM-09: Admin dapat memperbarui data user
     */
    public function test_admin_can_update_user(): void
    {
        $targetUser = User::factory()->create();

        $payload = [
            'username' => 'updated_by_admin',
            'email' => 'updated@example.com',
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$targetUser->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonFragment(['username' => 'updated_by_admin']);

        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'username' => 'updated_by_admin',
            'email' => 'updated@example.com',
        ]);
    }

    /**
     * TC-UM-10: Update gagal jika username sudah dipakai user lain
     */
    public function test_admin_update_fails_with_duplicate_username(): void
    {
        User::factory()->create(['username' => 'taken_username']);
        $targetUser = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$targetUser->id}", [
                'username' => 'taken_username',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    /**
     * TC-UM-11: Update gagal jika email sudah dipakai user lain
     */
    public function test_admin_update_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $targetUser = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$targetUser->id}", [
                'email' => 'taken@example.com',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * TC-UM-12: Update mengembalikan 404 jika user tidak ditemukan
     */
    public function test_admin_update_returns_404_for_nonexistent_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson('/api/admin/users/999999', [
                'username' => 'ghostuser',
            ]);

        $response->assertStatus(404);
    }

    // =========================================================================
    // DELETE
    // =========================================================================

    /**
     * TC-UM-13: Admin dapat menghapus user
     */
    public function test_admin_can_delete_user(): void
    {
        $targetUser = User::factory()->create();

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$targetUser->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['message' => 'User berhasil dihapus.']);

        $this->assertSoftDeleted('users', ['id' => $targetUser->id]);
    }

    /**
     * TC-UM-14: Admin tidak dapat menghapus akun milik sendiri
     */
    public function test_admin_cannot_delete_own_account(): void
    {
        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->admin->id}");

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'Tidak dapat menghapus akun sendiri.']);
    }

    /**
     * TC-UM-15: Menghapus user yang tidak ada mengembalikan 404
     */
    public function test_admin_delete_returns_404_for_nonexistent_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->deleteJson('/api/admin/users/999999');

        $response->assertStatus(404);
    }

    // =========================================================================
    // SEARCH & FILTER
    // =========================================================================

    /**
     * TC-UM-16: Admin dapat mencari user berdasarkan keyword
     */
    public function test_admin_can_search_users_by_keyword(): void
    {
        User::factory()->create([
            'username' => 'findme_user',
            'email' => 'findme@example.com',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/users?search=findme_user');

        $response->assertStatus(200)
            ->assertJsonFragment(['username' => 'findme_user']);
    }

    /**
     * TC-UM-17: Admin dapat memfilter user berdasarkan provinsi
     */
    public function test_admin_can_filter_users_by_province(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson('/api/admin/users?province_id=1');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }
}
