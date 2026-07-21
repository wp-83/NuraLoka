<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * 10 user fiktif namun realistis dari Jabodetabek.
     * Semua user sudah terverifikasi email.
     * province_id mengacu pada urutan ProvinceSeeder:
     *   11 = DKI Jakarta, 12 = Jawa Barat, 13 = Banten
     * total_points sengaja tidak di-hardcode — lihat catatan di dalam run().
     * Data final untuk presentasi NuraLoka.
     */
    public function run(): void
    {
        $users = [
            // ─── Admin ─────────────────────────────────────────────────────
            [
                'username' => 'admin_nuraloka',
                'email' => 'admin@nuraloka.id',
                'password' => Hash::make('nuraloka2026'),
                'is_admin' => true,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 11, // DKI Jakarta
                    'fullname' => 'Admin NuraLoka',
                    'dob' => '1995-03-15',
                    'gender' => 'male',
                ],
            ],

            // ─── Regular Users ──────────────────────────────────────────────
            [
                'username' => 'jayadi_christopher',
                'email' => 'jayadi.christopher@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 11, // DKI Jakarta
                    'fullname' => 'Jayadi Christopher Alam',
                    'dob' => '2001-08-17',
                    'gender' => 'male',
                ],
            ],
            [
                'username' => 'sari_rahayu',
                'email' => 'sari.rahayu@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 12, // Jawa Barat
                    'fullname' => 'Sari Rahayu Putri',
                    'dob' => '1999-05-22',
                    'gender' => 'female',
                ],
            ],
            [
                'username' => 'budi_santoso_jkt',
                'email' => 'budi.santoso@yahoo.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 11, // DKI Jakarta
                    'fullname' => 'Budi Santoso',
                    'dob' => '1997-11-30',
                    'gender' => 'male',
                ],
            ],
            [
                'username' => 'dewi_anggraini',
                'email' => 'dewi.anggraini23@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 13, // Banten
                    'fullname' => 'Dewi Anggraini',
                    'dob' => '2000-02-14',
                    'gender' => 'female',
                ],
            ],
            [
                'username' => 'rizky_fauzan',
                'email' => 'rizky.fauzan@outlook.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 12, // Jawa Barat
                    'fullname' => 'Rizky Fauzan Ramadhan',
                    'dob' => '2002-07-10',
                    'gender' => 'male',
                ],
            ],
            [
                'username' => 'anita_kusuma',
                'email' => 'anita.kusuma@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 11, // DKI Jakarta
                    'fullname' => 'Anita Kusuma Wardani',
                    'dob' => '1998-09-03',
                    'gender' => 'female',
                ],
            ],
            [
                'username' => 'hendra_wijaya',
                'email' => 'hendra.wijaya88@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 12, // Jawa Barat
                    'fullname' => 'Hendra Wijaya',
                    'dob' => '1988-12-25',
                    'gender' => 'male',
                ],
            ],
            [
                'username' => 'novia_permata',
                'email' => 'novia.permata@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 13, // Banten
                    'fullname' => 'Novia Permata Sari',
                    'dob' => '2003-04-18',
                    'gender' => 'female',
                ],
            ],
            [
                'username' => 'fajar_pratama',
                'email' => 'fajar.pratama@gmail.com',
                'password' => Hash::make('password123'),
                'is_admin' => false,
                'email_verified_at' => now(),
                'detail' => [
                    'province_id' => 11, // DKI Jakarta
                    'fullname' => 'Fajar Pratama Putra',
                    'dob' => '1996-06-06',
                    'gender' => 'male',
                ],
            ],
        ];

        foreach ($users as $userData) {
            $detail = $userData['detail'];
            unset($userData['detail']);

            $userData['created_at'] = now();
            $userData['updated_at'] = now();

            $userId = DB::table('users')->insertGetId($userData);

            DB::table('user_details')->insert([
                'user_id' => $userId,
                'province_id' => $detail['province_id'],
                'fullname' => $detail['fullname'],
                'dob' => $detail['dob'],
                'gender' => $detail['gender'],
                'profile_path' => null,
                // Mulai dari 0: poin BUKAN angka karangan, melainkan dihitung dari
                // lencana yang benar-benar diraih user. DatabaseSeeder memanggil
                // GamificationService::recalculatePoints() di akhir seeding, setelah
                // trip & album (sumber lencana) terbentuk.
                'total_points' => 0,
                'level_id' => Level::idForPoints(0),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
