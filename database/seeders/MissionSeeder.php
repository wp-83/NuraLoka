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
            // Khusus
            ['title' => 'Sahabat Nuka', 'description' => 'Selesaikan perjalanan pertama dan buat 1 Trip Album.', 'points_reward' => 100, 'target' => 1, 'badge' => 'Sahabat Nuka'],
            ['title' => 'Jelajah Nusantara', 'description' => 'Membuktikan kecintaan pada keindahan Indonesia dari Sabang hingga Merauke.', 'points_reward' => 250, 'target' => 1, 'badge' => 'Jelajah Nusantara'],
            ['title' => 'Pelangi Konsisten', 'description' => 'Konsisten menjelajah tanpa henti dan terus menyelesaikan tantangan perjalanan.', 'points_reward' => 300, 'target' => 1, 'badge' => 'Pelangi Konsisten'],
            ['title' => 'Inspirator Nuravers', 'description' => 'Album perjalananmu menjadi sumber inspirasi bagi banyak pengguna.', 'points_reward' => 250, 'target' => 1, 'badge' => 'Inspirator Nuravers'],

            // Pantai
            ['title' => 'Si Paling Pantai (Perunggu)', 'description' => 'Kunjungi 1 destinasi pantai.', 'points_reward' => 50, 'target' => 1, 'badge' => 'Si Paling Pantai (Perunggu)'],
            ['title' => 'Si Paling Pantai (Perak)', 'description' => 'Kunjungi 10 destinasi pantai.', 'points_reward' => 100, 'target' => 10, 'badge' => 'Si Paling Pantai (Perak)'],
            ['title' => 'Si Paling Pantai (Emas)', 'description' => 'Kunjungi 20 destinasi pantai.', 'points_reward' => 150, 'target' => 20, 'badge' => 'Si Paling Pantai (Emas)'],
            ['title' => 'Si Paling Pantai (Berlian)', 'description' => 'Kunjungi 40 destinasi pantai.', 'points_reward' => 250, 'target' => 40, 'badge' => 'Si Paling Pantai (Berlian)'],

            // Puncak
            ['title' => 'Si Paling Puncak (Perunggu)', 'description' => 'Kunjungi 1 gunung/bukit.', 'points_reward' => 50, 'target' => 1, 'badge' => 'Si Paling Puncak (Perunggu)'],
            ['title' => 'Si Paling Puncak (Perak)', 'description' => 'Kunjungi 10 gunung/bukit.', 'points_reward' => 100, 'target' => 10, 'badge' => 'Si Paling Puncak (Perak)'],
            ['title' => 'Si Paling Puncak (Emas)', 'description' => 'Kunjungi 20 gunung/bukit.', 'points_reward' => 150, 'target' => 20, 'badge' => 'Si Paling Puncak (Emas)'],
            ['title' => 'Si Paling Puncak (Berlian)', 'description' => 'Kunjungi 40 gunung/bukit.', 'points_reward' => 250, 'target' => 40, 'badge' => 'Si Paling Puncak (Berlian)'],

            // Kuliner
            ['title' => 'Si Paling Kuliner (Perunggu)', 'description' => 'Kunjungi 3 lokasi kuliner lokal di Indonesia.', 'points_reward' => 50, 'target' => 3, 'badge' => 'Si Paling Kuliner (Perunggu)'],
            ['title' => 'Si Paling Kuliner (Perak)', 'description' => 'Nuravers harus berkunjung ke 10 lokasi kuliner lokal di Indonesia.', 'points_reward' => 100, 'target' => 10, 'badge' => 'Si Paling Kuliner (Perak)'],
            ['title' => 'Si Paling Kuliner (Emas)', 'description' => 'Kunjungi 25 lokasi kuliner lokal di Indonesia.', 'points_reward' => 150, 'target' => 25, 'badge' => 'Si Paling Kuliner (Emas)'],
            ['title' => 'Si Paling Kuliner (Berlian)', 'description' => 'Kunjungi 50 lokasi kuliner lokal di Indonesia.', 'points_reward' => 250, 'target' => 50, 'badge' => 'Si Paling Kuliner (Berlian)'],

            // Hidden Gem
            ['title' => 'Si Paling Hidden Gem (Perunggu)', 'description' => 'Kunjungi 1 hidden gem.', 'points_reward' => 50, 'target' => 1, 'badge' => 'Si Paling Hidden Gem (Perunggu)'],
            ['title' => 'Si Paling Hidden Gem (Perak)', 'description' => 'Kunjungi 10 hidden gem.', 'points_reward' => 100, 'target' => 10, 'badge' => 'Si Paling Hidden Gem (Perak)'],
            ['title' => 'Si Paling Hidden Gem (Emas)', 'description' => 'Kunjungi 20 hidden gem.', 'points_reward' => 150, 'target' => 20, 'badge' => 'Si Paling Hidden Gem (Emas)'],
            ['title' => 'Si Paling Hidden Gem (Berlian)', 'description' => 'Kunjungi 40 hidden gem.', 'points_reward' => 250, 'target' => 40, 'badge' => 'Si Paling Hidden Gem (Berlian)'],

            // Cerita
            ['title' => 'Si Paling Cerita (Perunggu)', 'description' => 'Nuravers harus mengupload 5 foto perjalanan pada trip album.', 'points_reward' => 50, 'target' => 5, 'badge' => 'Si Paling Cerita (Perunggu)'],
            ['title' => 'Si Paling Cerita (Perak)', 'description' => 'Unggah 15 foto perjalanan pada trip album.', 'points_reward' => 100, 'target' => 15, 'badge' => 'Si Paling Cerita (Perak)'],
            ['title' => 'Si Paling Cerita (Emas)', 'description' => 'Unggah 30 foto perjalanan pada trip album.', 'points_reward' => 150, 'target' => 30, 'badge' => 'Si Paling Cerita (Emas)'],
            ['title' => 'Si Paling Cerita (Berlian)', 'description' => 'Unggah 50 foto perjalanan pada trip album.', 'points_reward' => 250, 'target' => 50, 'badge' => 'Si Paling Cerita (Berlian)'],
        ];

        foreach ($missions as $m) {
            $badgeId = DB::table('badges')->where('name', $m['badge'])->value('id');

            if ($badgeId) {
                DB::table('missions')->updateOrInsert(
                    ['title' => $m['title']],
                    [
                        'badge_id' => $badgeId,
                        'slug' => Str::slug($m['title']),
                        'description' => $m['description'],
                        'points_reward' => $m['points_reward'],
                        'target' => $m['target'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
