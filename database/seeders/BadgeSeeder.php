<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            // ── Lencana Khusus ──────────────────────────────────────────────
            [
                'name' => 'Sahabat Nuka',
                'requirement_description' => 'Selesaikan perjalanan pertama dan buat 1 Trip Album.',
                'icon_path' => 'images/badges/sahabatNuka/1.png',
                'type' => 'special',
                'category' => null,
                'points' => 100,
                'tier_level' => 0,
                'tier_target' => 1,
            ],
            [
                'name' => 'Jelajah Nusantara',
                'requirement_description' => 'Membuktikan kecintaan pada keindahan Indonesia dari Sabang hingga Merauke.',
                'icon_path' => 'images/badges/special/2.png',
                'type' => 'special',
                'category' => null,
                'points' => 250,
                'tier_level' => 0,
                'tier_target' => 0,
            ],
            [
                'name' => 'Pelangi Konsisten',
                'requirement_description' => 'Konsisten menjelajah tanpa henti dan terus menyelesaikan tantangan perjalanan.',
                'icon_path' => 'images/badges/special/3.png',
                'type' => 'special',
                'category' => null,
                'points' => 300,
                'tier_level' => 0,
                'tier_target' => 0,
            ],
            [
                'name' => 'Inspirator Nuravers',
                'requirement_description' => 'Album perjalananmu menjadi sumber inspirasi bagi banyak pengguna.',
                'icon_path' => 'images/badges/special/1.png',
                'type' => 'special',
                'category' => null,
                'points' => 250,
                'tier_level' => 0,
                'tier_target' => 0,
            ],

            // ── Si Paling Pantai ────────────────────────────────────────────
            ['name' => 'Si Paling Pantai (Perunggu)', 'requirement_description' => 'Jelajahi berbagai destinasi pantai untuk meningkatkan lencana ini hingga tingkat tertinggi.', 'icon_path' => 'images/badges/siPalingPantai/1.png', 'type' => 'general', 'category' => 'Si Paling Pantai', 'points' => 50, 'tier_level' => 1, 'tier_target' => 1],
            ['name' => 'Si Paling Pantai (Perak)', 'requirement_description' => 'Jelajahi berbagai destinasi pantai untuk meningkatkan lencana ini hingga tingkat tertinggi.', 'icon_path' => 'images/badges/siPalingPantai/2.png', 'type' => 'general', 'category' => 'Si Paling Pantai', 'points' => 100, 'tier_level' => 2, 'tier_target' => 10],
            ['name' => 'Si Paling Pantai (Emas)', 'requirement_description' => 'Jelajahi berbagai destinasi pantai untuk meningkatkan lencana ini hingga tingkat tertinggi.', 'icon_path' => 'images/badges/siPalingPantai/3.png', 'type' => 'general', 'category' => 'Si Paling Pantai', 'points' => 150, 'tier_level' => 3, 'tier_target' => 20],
            ['name' => 'Si Paling Pantai (Berlian)', 'requirement_description' => 'Jelajahi berbagai destinasi pantai untuk meningkatkan lencana ini hingga tingkat tertinggi.', 'icon_path' => 'images/badges/siPalingPantai/4.png', 'type' => 'general', 'category' => 'Si Paling Pantai', 'points' => 250, 'tier_level' => 4, 'tier_target' => 40],

            // ── Si Paling Puncak ────────────────────────────────────────────
            ['name' => 'Si Paling Puncak (Perunggu)', 'requirement_description' => 'Kunjungi gunung, bukit, atau spot sunrise untuk membuktikan semangatmu menaklukkan ketinggian.', 'icon_path' => 'images/badges/siPalingPuncak/1.png', 'type' => 'general', 'category' => 'Si Paling Puncak', 'points' => 50, 'tier_level' => 1, 'tier_target' => 1],
            ['name' => 'Si Paling Puncak (Perak)', 'requirement_description' => 'Kunjungi gunung, bukit, atau spot sunrise untuk membuktikan semangatmu menaklukkan ketinggian.', 'icon_path' => 'images/badges/siPalingPuncak/2.png', 'type' => 'general', 'category' => 'Si Paling Puncak', 'points' => 100, 'tier_level' => 2, 'tier_target' => 10],
            ['name' => 'Si Paling Puncak (Emas)', 'requirement_description' => 'Kunjungi gunung, bukit, atau spot sunrise untuk membuktikan semangatmu menaklukkan ketinggian.', 'icon_path' => 'images/badges/siPalingPuncak/3.png', 'type' => 'general', 'category' => 'Si Paling Puncak', 'points' => 150, 'tier_level' => 3, 'tier_target' => 20],
            ['name' => 'Si Paling Puncak (Berlian)', 'requirement_description' => 'Kunjungi gunung, bukit, atau spot sunrise untuk membuktikan semangatmu menaklukkan ketinggian.', 'icon_path' => 'images/badges/siPalingPuncak/4.png', 'type' => 'general', 'category' => 'Si Paling Puncak', 'points' => 250, 'tier_level' => 4, 'tier_target' => 40],

            // ── Si Paling Kuliner ───────────────────────────────────────────
            ['name' => 'Si Paling Kuliner (Perunggu)', 'requirement_description' => 'Temukan dan jelajahi berbagai kuliner khas Nusantara selama perjalananmu.', 'icon_path' => 'images/badges/siPalingKuliner/1.png', 'type' => 'general', 'category' => 'Si Paling Kuliner', 'points' => 50, 'tier_level' => 1, 'tier_target' => 3],
            ['name' => 'Si Paling Kuliner (Perak)', 'requirement_description' => 'Temukan dan jelajahi berbagai kuliner khas Nusantara selama perjalananmu.', 'icon_path' => 'images/badges/siPalingKuliner/2.png', 'type' => 'general', 'category' => 'Si Paling Kuliner', 'points' => 100, 'tier_level' => 2, 'tier_target' => 10],
            ['name' => 'Si Paling Kuliner (Emas)', 'requirement_description' => 'Temukan dan jelajahi berbagai kuliner khas Nusantara selama perjalananmu.', 'icon_path' => 'images/badges/siPalingKuliner/3.png', 'type' => 'general', 'category' => 'Si Paling Kuliner', 'points' => 150, 'tier_level' => 3, 'tier_target' => 25],
            ['name' => 'Si Paling Kuliner (Berlian)', 'requirement_description' => 'Temukan dan jelajahi berbagai kuliner khas Nusantara selama perjalananmu.', 'icon_path' => 'images/badges/siPalingKuliner/4.png', 'type' => 'general', 'category' => 'Si Paling Kuliner', 'points' => 250, 'tier_level' => 4, 'tier_target' => 50],

            // ── Si Paling Hidden Gem ────────────────────────────────────────
            ['name' => 'Si Paling Hidden Gem (Perunggu)', 'requirement_description' => 'Temukan dan kunjungi berbagai destinasi Hidden Gem untuk membuktikan pengalamanmu menjelajahmu.', 'icon_path' => 'images/badges/siPalingHiddenGem/1.png', 'type' => 'general', 'category' => 'Si Paling Hidden Gem', 'points' => 50, 'tier_level' => 1, 'tier_target' => 1],
            ['name' => 'Si Paling Hidden Gem (Perak)', 'requirement_description' => 'Temukan dan kunjungi berbagai destinasi Hidden Gem untuk membuktikan pengalamanmu menjelajahmu.', 'icon_path' => 'images/badges/siPalingHiddenGem/2.png', 'type' => 'general', 'category' => 'Si Paling Hidden Gem', 'points' => 100, 'tier_level' => 2, 'tier_target' => 10],
            ['name' => 'Si Paling Hidden Gem (Emas)', 'requirement_description' => 'Temukan dan kunjungi berbagai destinasi Hidden Gem untuk membuktikan pengalamanmu menjelajahmu.', 'icon_path' => 'images/badges/siPalingHiddenGem/3.png', 'type' => 'general', 'category' => 'Si Paling Hidden Gem', 'points' => 150, 'tier_level' => 3, 'tier_target' => 20],
            ['name' => 'Si Paling Hidden Gem (Berlian)', 'requirement_description' => 'Temukan dan kunjungi berbagai destinasi Hidden Gem untuk membuktikan pengalamanmu menjelajahmu.', 'icon_path' => 'images/badges/siPalingHiddenGem/4.png', 'type' => 'general', 'category' => 'Si Paling Hidden Gem', 'points' => 250, 'tier_level' => 4, 'tier_target' => 40],

            // ── Si Paling Cerita ────────────────────────────────────────────
            ['name' => 'Si Paling Cerita (Perunggu)', 'requirement_description' => 'Bagikan momen terbaik perjalananmu melalui Trip Album untuk mengembangkan lencana ini.', 'icon_path' => 'images/badges/siPalingCerita/1.png', 'type' => 'general', 'category' => 'Si Paling Cerita', 'points' => 50, 'tier_level' => 1, 'tier_target' => 5],
            ['name' => 'Si Paling Cerita (Perak)', 'requirement_description' => 'Bagikan momen terbaik perjalananmu melalui Trip Album untuk mengembangkan lencana ini.', 'icon_path' => 'images/badges/siPalingCerita/2.png', 'type' => 'general', 'category' => 'Si Paling Cerita', 'points' => 100, 'tier_level' => 2, 'tier_target' => 15],
            ['name' => 'Si Paling Cerita (Emas)', 'requirement_description' => 'Bagikan momen terbaik perjalananmu melalui Trip Album untuk mengembangkan lencana ini.', 'icon_path' => 'images/badges/siPalingCerita/3.png', 'type' => 'general', 'category' => 'Si Paling Cerita', 'points' => 150, 'tier_level' => 3, 'tier_target' => 30],
            ['name' => 'Si Paling Cerita (Berlian)', 'requirement_description' => 'Bagikan momen terbaik perjalananmu melalui Trip Album untuk mengembangkan lencana ini.', 'icon_path' => 'images/badges/siPalingCerita/4.png', 'type' => 'general', 'category' => 'Si Paling Cerita', 'points' => 250, 'tier_level' => 4, 'tier_target' => 50],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(
                ['name' => $badge['name']],
                [
                    'icon_path' => $badge['icon_path'],
                    'requirement_description' => $badge['requirement_description'],
                    'type' => $badge['type'],
                    'category' => $badge['category'] ?? null,
                    'points' => $badge['points'],
                    'tier_level' => $badge['tier_level'],
                    'tier_target' => $badge['tier_target'],
                ]
            );
        }
    }
}
