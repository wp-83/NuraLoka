<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Ambang poin tiap level, dikalibrasi terhadap TOTAL poin seluruh lencana
     * di BadgeSeeder (saat ini 34.500 = 4.500 khusus + 30.000 bertingkat).
     *
     * Ambang lama (0/1.000/3.000/6.000/10.000/15.000) dibuat untuk poin lencana
     * versi lama yang jauh lebih kecil. Setelah poin lencana dinaikkan, level
     * tertinggi hanya butuh 43% dari seluruh poin — gelar "Legenda" jadi terlalu
     * murah, dan lebih dari separuh poin yang bisa dikumpulkan tidak lagi
     * menaikkan level apa pun.
     *
     * Sekarang jaraknya melebar bertahap (2rb → 4rb → 6rb → 8rb → 10rb) sehingga
     * level awal cepat terasa, sementara level puncak menuntut hampir seluruh
     * koleksi lencana:
     *
     *   Perintis               0        0%   titik awal
     *   Penapak Jejak      2.000        6%   beberapa lencana perunggu
     *   Petualang Muda     6.000       17%   perunggu & perak merata
     *   Pengembara        12.000       35%   mulai menyentuh emas
     *   Penakluk          20.000       58%   sebagian besar kategori tuntas
     *   Legenda           30.000       87%   nyaris seluruh lencana
     *
     * Bila poin lencana di BadgeSeeder diubah lagi, sesuaikan angka di sini —
     * LevelSyncTest & BadgeSeederTest menjaga keduanya tetap masuk akal.
     */
    public function run(): void
    {
        $levels = [
            ['name' => 'Perintis', 'min_points' => 0, 'order' => 1],
            ['name' => 'Penapak Jejak', 'min_points' => 2000, 'order' => 2],
            ['name' => 'Petualang Muda', 'min_points' => 6000, 'order' => 3],
            ['name' => 'Pengembara Nusantara', 'min_points' => 12000, 'order' => 4],
            ['name' => 'Penakluk Nusantara', 'min_points' => 20000, 'order' => 5],
            ['name' => 'Legenda Nuravers', 'min_points' => 30000, 'order' => 6],
        ];

        foreach ($levels as $level) {
            Level::updateOrCreate(
                ['name' => $level['name']],
                $level
            );
        }
    }
}
