<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Seed database SEKALI untuk seluruh proses test.
     *
     * RefreshDatabase menjalankan `migrate:fresh --seed` hanya satu kali (lihat
     * RefreshDatabaseState::$migrated), lalu membungkus tiap test dalam
     * transaksi yang di-rollback. Jadi data seed tetap utuh untuk setiap test
     * tanpa perlu di-seed ulang.
     *
     * Sebelumnya 11 kelas memanggil $this->seed(DatabaseSeeder::class) di
     * setUp(), yang berarti SELURUH seeder dijalankan ulang untuk setiap metode
     * test — sekitar 57 kali dalam sekali jalan.
     *
     * Nilai ini WAJIB seragam untuk semua kelas: penanda "sudah migrasi"
     * bersifat global per proses, jadi kelas yang berjalan pertama menentukan
     * apakah seed dijalankan. Karena itu diletakkan di sini, bukan di
     * masing-masing kelas.
     */
    protected $seed = true;
}
