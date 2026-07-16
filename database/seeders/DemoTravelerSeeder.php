<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Mission;
use App\Models\Badge;

class DemoTravelerSeeder extends Seeder
{
    public function run(): void
    {
        $user = DB::table('users')->where('username', 'demo_traveler')->first();
        if (!$user) {
            $this->command->info("User demo_traveler not found. Please run UserSeeder first.");
            return;
        }

        $userId = $user->id;

        // Set points to a very high number to reach max level
        DB::table('user_details')->where('user_id', $userId)->update([
            'total_points' => 25000,
        ]);

        // Clear existing progress
        DB::table('user_missions')->where('user_id', $userId)->delete();
        DB::table('user_badges')->where('user_id', $userId)->delete();

        // 1. Give ALL Badges
        $badges = Badge::all();
        $userBadgesData = [];
        foreach ($badges as $badge) {
            $userBadgesData[] = [
                'user_id' => $userId,
                'badge_id' => $badge->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('user_badges')->insert($userBadgesData);

        // 2. Complete ALL Missions
        $missions = Mission::all();
        $userMissionsData = [];
        foreach ($missions as $mission) {
            $userMissionsData[] = [
                'user_id' => $userId,
                'mission_id' => $mission->id,
                'progress' => $mission->target,
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('user_missions')->insert($userMissionsData);

        $this->command->info("User demo_traveler has completed all missions and earned all badges!");
    }
}
