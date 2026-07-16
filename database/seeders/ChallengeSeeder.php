<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * ChallengeSeeder
 *
 * Seeds leaderboard demo users matching the prototype design:
 * 10 users with specific names, points, and badge assignments.
 * Also seeds user_missions progress data for the logged-in demo user.
 */
class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        // ── Leaderboard Users (matching prototype gambar 4) ─────────────
        $leaderboardUsers = [
            ['fullname' => 'Ade Herlambang Sasongko', 'username' => 'ade_herlambang', 'email' => 'ade.herlambang@nuraloka.id', 'points' => 12250, 'gender' => 'male', 'province_id' => 11],
            ['fullname' => 'Widianto Aliyonugroho', 'username' => 'widianto_aliyo', 'email' => 'widianto.aliyo@nuraloka.id', 'points' => 10500, 'gender' => 'male', 'province_id' => 12],
            ['fullname' => 'Rani Assalam', 'username' => 'rani_assalam', 'email' => 'rani.assalam@nuraloka.id', 'points' => 7000, 'gender' => 'female', 'province_id' => 11],
            ['fullname' => 'Muhammad Rizonous Hadi', 'username' => 'rizonous_hadi', 'email' => 'rizonous.hadi@nuraloka.id', 'points' => 6950, 'gender' => 'male', 'province_id' => 12],
            ['fullname' => 'Ersono Setiawan', 'username' => 'ersono_setiawan', 'email' => 'ersono.setiawan@nuraloka.id', 'points' => 6250, 'gender' => 'male', 'province_id' => 13],
            ['fullname' => 'Martha Pertiwi Widyoningsih', 'username' => 'martha_pertiwi', 'email' => 'martha.pertiwi@nuraloka.id', 'points' => 5000, 'gender' => 'female', 'province_id' => 11],
            ['fullname' => 'Anderies Susanto', 'username' => 'anderies_susanto', 'email' => 'anderies.susanto@nuraloka.id', 'points' => 4950, 'gender' => 'male', 'province_id' => 12],
            ['fullname' => 'Bella Azurian', 'username' => 'bella_azurian', 'email' => 'bella.azurian@nuraloka.id', 'points' => 4900, 'gender' => 'female', 'province_id' => 11],
            ['fullname' => 'Bambang Gandaria', 'username' => 'bambang_gandaria', 'email' => 'bambang.gandaria@nuraloka.id', 'points' => 2900, 'gender' => 'male', 'province_id' => 13],
            ['fullname' => 'Mulyani Sri Handayani', 'username' => 'mulyani_sri', 'email' => 'mulyani.sri@nuraloka.id', 'points' => 2850, 'gender' => 'female', 'province_id' => 12],
        ];

        // Also add a second "Jayadi" user for the search demo (gambar 5)
        $searchDemoUser = [
            'fullname' => 'Jayadi Christoper Wicaksono',
            'username' => 'jayadi_wicaksono',
            'email' => 'jayadi.wicaksono@nuraloka.id',
            'points' => 1500,
            'gender' => 'male',
            'province_id' => 11,
        ];

        $allUsers = array_merge($leaderboardUsers, [$searchDemoUser]);

        // Get all badge IDs for assignment
        $allBadgeIds = DB::table('badges')->pluck('id')->toArray();

        foreach ($allUsers as $userData) {
            // Check if user already exists
            $existingUser = DB::table('users')->where('email', $userData['email'])->first();
            if ($existingUser) {
                continue;
            }

            $userId = DB::table('users')->insertGetId([
                'username' => $userData['username'],
                'email' => $userData['email'],
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_details')->insert([
                'user_id' => $userId,
                'province_id' => $userData['province_id'],
                'fullname' => $userData['fullname'],
                'dob' => fake()->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
                'gender' => $userData['gender'],
                'profile_path' => null,
                'total_points' => $userData['points'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Assign random badges based on points (more points = more badges)
            $badgeCount = min(count($allBadgeIds), max(1, intdiv($userData['points'], 1000)));
            $selectedBadges = collect($allBadgeIds)->shuffle()->take($badgeCount);

            foreach ($selectedBadges as $badgeId) {
                DB::table('user_badges')->insert([
                    'user_id' => $userId,
                    'badge_id' => $badgeId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ── Seed user_missions progress for Jayadi Christopher Alam (main demo user) ──
        $jayadi = DB::table('users')
            ->where('username', 'jayadi_christopher')
            ->first();

        if ($jayadi) {
            // Update points to 150 (as per prototype)
            DB::table('user_details')
                ->where('user_id', $jayadi->id)
                ->update(['total_points' => 150]);

            // Assign ongoing missions with progress data
            $kulinerPerakMission = DB::table('missions')
                ->where('title', 'Si Paling Kuliner (Perak)')
                ->first();
            $ceritaPerungguMission = DB::table('missions')
                ->where('title', 'Si Paling Cerita (Perunggu)')
                ->first();

            if ($kulinerPerakMission) {
                DB::table('user_missions')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'mission_id' => $kulinerPerakMission->id],
                    ['progress' => 7, 'status' => 'on_going', 'created_at' => now(), 'updated_at' => now()]
                );
            }

            if ($ceritaPerungguMission) {
                DB::table('user_missions')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'mission_id' => $ceritaPerungguMission->id],
                    ['progress' => 3, 'status' => 'on_going', 'created_at' => now(), 'updated_at' => now()]
                );
            }

            // Give Jayadi the Sahabat Nuka badge
            $sahabatNuka = DB::table('badges')->where('name', 'Sahabat Nuka')->first();
            if ($sahabatNuka) {
                DB::table('user_badges')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'badge_id' => $sahabatNuka->id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }

            // Give Jayadi the Kuliner Perunggu badge (already earned)
            $kulinerPerunggu = DB::table('badges')->where('name', 'Si Paling Kuliner (Perunggu)')->first();
            if ($kulinerPerunggu) {
                DB::table('user_badges')->updateOrInsert(
                    ['user_id' => $jayadi->id, 'badge_id' => $kulinerPerunggu->id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
}
