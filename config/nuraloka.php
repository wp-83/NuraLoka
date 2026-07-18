<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mode Demo Perjalanan (Rute Dua Titik)
    |--------------------------------------------------------------------------
    |
    | true  → "Mulai Perjalanan" cukup animasi mobil menyusuri rute lalu otomatis
    |         selesai (untuk demo/presentasi; tanpa validasi lokasi).
    | false → penyelesaian perjalanan DIVALIDASI kedekatan lokasi user ke titik
    |         tujuan (sama seperti check-in) sebelum trip & album dibuat.
    |
    */
    'journey_demo_mode' => (bool) env('JOURNEY_DEMO_MODE', true),

];
