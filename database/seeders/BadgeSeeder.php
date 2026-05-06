<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'name'                    => 'Penjelajah Pemula',
                'requirement_description' => 'Selesaikan 1 perjalanan pertama.',
                'icon_path'               => 'badges/explorer_beginner.svg',
            ],
            [
                'name'                    => 'Petualang Nusantara',
                'requirement_description' => 'Kunjungi 5 destinasi berbeda.',
                'icon_path'               => 'badges/adventurer.svg',
            ],
            [
                'name'                    => 'Fotografer Jalan',
                'requirement_description' => 'Upload 10 foto perjalanan.',
                'icon_path'               => 'badges/photographer.svg',
            ],
            [
                'name'                    => 'Pahlawan UMKM',
                'requirement_description' => 'Kunjungi 3 UMKM lokal.',
                'icon_path'               => 'badges/umkm_hero.svg',
            ],
            [
                'name'                    => 'Road Tripper',
                'requirement_description' => 'Selesaikan 1 road trip dengan jarak >100 km.',
                'icon_path'               => 'badges/road_tripper.svg',
            ],
            [
                'name'                    => 'Hidden Gem Hunter',
                'requirement_description' => 'Temukan dan kunjungi 3 hidden gem.',
                'icon_path'               => 'badges/hidden_gem.svg',
            ],
            [
                'name'                    => 'Wisatawan Elite',
                'requirement_description' => 'Kumpulkan 2000 poin.',
                'icon_path'               => 'badges/elite.svg',
            ],
        ];

        foreach ($badges as $badge) {
            DB::table('badges')->insertOrIgnore([
                'name'                    => $badge['name'],
                'slug'                    => Str::slug($badge['name']),
                'icon_path'               => $badge['icon_path'],
                'requirement_description' => $badge['requirement_description'],
                'created_at'              => now(),
                'updated_at'              => now(),
            ]);
        }
    }
}