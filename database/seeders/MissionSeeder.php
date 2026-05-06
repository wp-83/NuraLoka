<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MissionSeeder extends Seeder
{
    public function run(): void
    {
        $missions = [
            ['title' => 'Langkah Pertama', 'description' => 'Buat akun dan lengkapi profil.', 'points_reward' => 50, 'badge' => 'Penjelajah Pemula'],
            ['title' => 'Mulai Jalan-Jalan', 'description' => 'Selesaikan perjalanan pertamamu.', 'points_reward' => 100, 'badge' => 'Penjelajah Pemula'],
            ['title' => 'Jelajahi 5 Kota', 'description' => 'Kunjungi 5 kota berbeda.', 'points_reward' => 300, 'badge' => 'Petualang Nusantara'],
            ['title' => 'Abadikan Momen', 'description' => 'Upload 10 foto perjalanan.', 'points_reward' => 150, 'badge' => 'Fotografer Jalan'],
            ['title' => 'Dukung Lokal', 'description' => 'Kunjungi 3 UMKM lokal di rute perjalananmu.', 'points_reward' => 200, 'badge' => 'Pahlawan UMKM'],
            ['title' => 'Road Trip Perdana', 'description' => 'Selesaikan road trip >100 km.', 'points_reward' => 500, 'badge' => 'Road Tripper'],
            ['title' => 'Temukan Tersembunyi', 'description' => 'Kunjungi 3 destinasi hidden gem.', 'points_reward' => 400, 'badge' => 'Hidden Gem Hunter'],
            ['title' => 'Ribuan Poin', 'description' => 'Kumpulkan total 2000 poin.', 'points_reward' => 0, 'badge' => 'Wisatawan Elite'],
        ];

        foreach ($missions as $m) {
            $badgeId = DB::table('badges')->where('name', $m['badge'])->value('id');

            DB::table('missions')->insertOrIgnore([
                'badge_id' => $badgeId,
                'title' => $m['title'],
                'slug' => Str::slug($m['title']),
                'description' => $m['description'],
                'points_reward' => $m['points_reward'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
