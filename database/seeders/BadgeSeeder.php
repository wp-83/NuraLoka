<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    /**
     * Poin per tingkat lencana bertingkat.
     *
     * Dinaikkan dari 50/100/150/250. Dengan nilai lama, seluruh lencana yang
     * mungkin diraih hanya berjumlah ±5.300 poin — di bawah ambang level
     * tertinggi (15.000), sehingga level 5 & 6 mustahil dicapai dan hampir semua
     * user tertahan di "Perintis". Lihat LevelSeeder untuk ambang tiap level.
     */
    private const TIER_POINTS = [
        1 => 250,   // Perunggu
        2 => 500,   // Perak
        3 => 1000,  // Emas
        4 => 2000,  // Berlian
    ];

    private const TIER_NAMES = [
        1 => 'Perunggu',
        2 => 'Perak',
        3 => 'Emas',
        4 => 'Berlian',
    ];

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
                'points' => 500,
                'tier_level' => 0,
                'tier_target' => 1,
            ],
            [
                'name' => 'Jelajah Nusantara',
                'requirement_description' => 'Membuktikan kecintaan pada keindahan Indonesia dari Sabang hingga Merauke.',
                'icon_path' => 'images/badges/special/2.png',
                'type' => 'special',
                'category' => null,
                'points' => 1500,
                'tier_level' => 0,
                'tier_target' => 0,
            ],
            [
                'name' => 'Pelangi Konsisten',
                'requirement_description' => 'Konsisten menjelajah tanpa henti dan terus menyelesaikan tantangan perjalanan.',
                'icon_path' => 'images/badges/special/3.png',
                'type' => 'special',
                'category' => null,
                'points' => 1500,
                'tier_level' => 0,
                'tier_target' => 0,
            ],
            [
                'name' => 'Inspirator Nuravers',
                'requirement_description' => 'Album perjalananmu menjadi sumber inspirasi bagi banyak pengguna.',
                'icon_path' => 'images/badges/special/1.png',
                'type' => 'special',
                'category' => null,
                'points' => 1000,
                'tier_level' => 0,
                'tier_target' => 0,
            ],
        ];

        // ── Lencana bertingkat ──────────────────────────────────────────────
        // Satu entri per folder gambar di public/images/badges. Setiap folder
        // berisi 1.png–4.png untuk Perunggu → Berlian.
        //
        // 'targets' DISESUAIKAN dengan jumlah tempat yang benar-benar ada di
        // katalog (lihat PlaceSeeder). Sebelumnya beberapa tingkat menuntut 40–100
        // tempat berbeda padahal katalognya hanya 38 tempat — mis. Hidden Gem cuma
        // punya 7 tempat, jadi tingkat Perak ke atas mustahil diraih siapa pun.
        // Kalau katalog tempat bertambah banyak, angka di sini boleh dinaikkan.
        $tiered = [
            [
                // Wisata Alam: 15 tempat.
                'category' => 'Si Paling Pantai',
                'folder' => 'siPalingPantai',
                'description' => 'Jelajahi berbagai destinasi pantai untuk meningkatkan lencana ini hingga tingkat tertinggi.',
                'targets' => [1, 4, 8, 12],
            ],
            [
                // Wisata Alam: 15 tempat.
                'category' => 'Si Paling Puncak',
                'folder' => 'siPalingPuncak',
                'description' => 'Kunjungi gunung, bukit, atau spot sunrise untuk membuktikan semangatmu menaklukkan ketinggian.',
                'targets' => [1, 4, 8, 12],
            ],
            [
                // Kuliner: 10 tempat.
                'category' => 'Si Paling Kuliner',
                'folder' => 'siPalingKuliner',
                'description' => 'Temukan dan jelajahi berbagai kuliner khas Nusantara selama perjalananmu.',
                'targets' => [1, 3, 6, 9],
            ],
            [
                // Hidden Gem: 7 tempat.
                'category' => 'Si Paling Hidden Gem',
                'folder' => 'siPalingHiddenGem',
                'description' => 'Temukan dan kunjungi berbagai destinasi Hidden Gem untuk membuktikan pengalaman menjelajahmu.',
                'targets' => [1, 2, 4, 6],
            ],
            [
                // Jumlah foto — tidak dibatasi katalog tempat.
                'category' => 'Si Paling Cerita',
                'folder' => 'siPalingCerita',
                'description' => 'Bagikan momen terbaik perjalananmu melalui Trip Album untuk mengembangkan lencana ini.',
                'targets' => [5, 15, 30, 50],
            ],

            // ── Kategori baru: gambarnya sudah ada di repo tapi belum pernah
            // dimasukkan ke seeder, sehingga tiga folder ini tidak terpakai.
            [
                // Wisata Budaya: 7 tempat.
                'category' => 'Si Paling Budaya',
                'folder' => 'siPalingBudaya',
                'description' => 'Kunjungi candi, keraton, museum, dan pusat budaya untuk mendalami warisan Nusantara.',
                'targets' => [1, 2, 4, 6],
            ],
            [
                // Seluruh katalog: 38 tempat.
                'category' => 'Si Paling Penjelajah',
                'folder' => 'siPalingPenjelajah',
                'description' => 'Kunjungi sebanyak mungkin destinasi berbeda, apa pun kategorinya.',
                'targets' => [3, 10, 20, 30],
            ],
            [
                // Jumlah album — tidak dibatasi katalog tempat.
                'category' => 'Si Paling Trip',
                'folder' => 'siPalingTrip',
                'description' => 'Buat semakin banyak Trip Album untuk mencatat setiap perjalananmu.',
                'targets' => [1, 5, 15, 30],
            ],
        ];

        foreach ($tiered as $group) {
            foreach (self::TIER_NAMES as $level => $tierName) {
                $badges[] = [
                    'name' => "{$group['category']} ({$tierName})",
                    'requirement_description' => $group['description'],
                    'icon_path' => "images/badges/{$group['folder']}/{$level}.png",
                    'type' => 'general',
                    'category' => $group['category'],
                    'points' => self::TIER_POINTS[$level],
                    'tier_level' => $level,
                    'tier_target' => $group['targets'][$level - 1],
                ];
            }
        }

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
