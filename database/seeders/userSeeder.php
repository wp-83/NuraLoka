<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Mission;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\UserDetails;
use App\Models\UserMission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. ADMIN ──────────────────────────────────────────────────────────
        $admin = User::factory()->create([
            'username' => 'admin_nuraloka',
            'email' => 'admin@nuraloka.id',
            'password' => bcrypt('Admin@1234'),
        ]);
        UserDetails::factory()->create([
            'user_id' => $admin->id,
            'name' => 'Admin NuraLoka',
            'gender' => 'male',
            'total_points' => 9999,
            'province_id' => DB::table('provinces')->where('name', 'DKI Jakarta')->value('id') ?? 1,
        ]);

        // ── 2. DEMO USER (user tetap untuk login demo) ────────────────────────
        $demo = User::factory()->create([
            'username' => 'demo_traveler',
            'email' => 'demo@nuraloka.id',
            'password' => bcrypt('Demo@1234'),
        ]);
        $this->attachDetails($demo, 'Demo Traveler', 'female', 1200);
        $this->attachBadgesAndMissions($demo, ['Penjelajah Pemula', 'Fotografer Jalan'], 3);

        // ── 3. PENGGUNA AKTIF (10 users dengan data lengkap) ──────────────────
        User::factory(10)->create()->each(function (User $user) {
            $this->attachDetails($user);
            $this->attachBadgesAndMissions($user, $this->randomBadgeNames(rand(1, 3)), rand(1, 4));
        });

        // ── 4. PENGGUNA BARU (5 users belum verifikasi) ───────────────────────
        User::factory(5)->unverified()->create()->each(function (User $user) {
            $this->attachDetails($user, points: 0);
        });

        // ── 5. PENGGUNA GOOGLE AUTH (5 users via Google) ─────────────────────
        User::factory(5)->googleAuth()->create()->each(function (User $user) {
            $this->attachDetails($user);
        });

        // ── 6. TOP LEADERBOARD USERS (3 users poin tinggi) ────────────────────
        collect(['Budi Santoso', 'Siti Rahayu', 'Ahmad Fauzi'])->each(function ($name, $i) {
            $user = User::factory()->create([
                'username' => Str::slug($name).'_'.($i + 1),
                'email' => Str::slug($name).'@nuraloka.id',
            ]);
            $this->attachDetails($user, $name, ['male', 'female', 'male'][$i], 3000 + ($i * 500));
            $this->attachBadgesAndMissions($user, $this->randomBadgeNames(5), 6);
        });
    }

    // ── Helper: buat UserDetails ──────────────────────────────────────────────
    private function attachDetails(
        User $user,
        ?string $name = null,
        ?string $gender = null,
        int $points = -1
    ): void {
        UserDetails::factory()->create([
            'user_id' => $user->id,
            'name' => $name,
            'gender' => $gender,
            'total_points' => $points >= 0 ? $points : null,
        ]);
    }

    // ── Helper: pasang badge & misi ───────────────────────────────────────────
    private function attachBadgesAndMissions(User $user, array $badgeNames, int $missionCount): void
    {
        foreach ($badgeNames as $badgeName) {
            $badge = Badge::where('name', $badgeName)->first();
            if ($badge) {
                UserBadge::firstOrCreate([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                ]);
            }
        }

        Mission::inRandomOrder()->take($missionCount)->get()->each(function ($mission) use ($user) {
            UserMission::firstOrCreate(
                ['user_id' => $user->id, 'mission_id' => $mission->id],
                ['status' => fake()->randomElement(['ongoing', 'completed'])]
            );
        });
    }

    // ── Helper: ambil nama badge acak ─────────────────────────────────────────
    private function randomBadgeNames(int $count): array
    {
        return Badge::inRandomOrder()
            ->take($count)
            ->pluck('name')
            ->toArray();
    }
}
