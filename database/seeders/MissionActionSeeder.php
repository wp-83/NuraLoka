<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Mission;
use Illuminate\Database\Seeder;

/**
 * Menautkan misi ke AKSI user (gamifikasi dinamis) berdasarkan kategori badge /
 * judul misi, sehingga progres berjalan otomatis dari aktivitas nyata.
 *
 * Idempotent: aman dijalankan berkali-kali & saat migrate:fresh --seed.
 * Kategori dipetakan ke kategori tempat yang BENAR-BENAR dipakai data place
 * (mis. Pantai/Puncak → "Wisata Alam") agar check-in benar-benar cocok.
 */
class MissionActionSeeder extends Seeder
{
    public function run(): void
    {
        // Pemetaan berdasarkan kategori badge → [action_type, nama kategori tempat|null]
        $byBadgeCategory = [
            'Si Paling Pantai' => ['checkin', 'Wisata Alam'],
            'Si Paling Puncak' => ['checkin', 'Wisata Alam'],
            'Si Paling Kuliner' => ['checkin', 'Kuliner'],
            'Si Paling Hidden Gem' => ['checkin', 'Hidden Gem'],
            'Si Paling Cerita' => ['create_album', null],
        ];

        // Pemetaan misi umum/khusus berdasarkan judul.
        $byTitle = [
            'Sahabat Nuka' => ['checkin', null],
            'Jelajah Nusantara' => ['checkin', null],
            'Pelangi Konsisten' => ['save_place', null],
            'Inspirator Nuravers' => ['create_album', null],
        ];

        $categoryId = fn (?string $name) => $name ? Category::where('name', $name)->value('id') : null;

        foreach (Mission::with('badge')->get() as $mission) {
            $map = $byTitle[$mission->title]
                ?? ($mission->badge?->category ? ($byBadgeCategory[$mission->badge->category] ?? null) : null);

            if (! $map) {
                continue;
            }

            [$action, $catName] = $map;

            $mission->update([
                'action_type' => $action,
                'category_id' => $categoryId($catName),
            ]);
        }
    }
}
