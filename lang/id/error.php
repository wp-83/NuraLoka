<?php

// Halaman Error (Error/Index), per kode status HTTP.
return [
    'titles' => [
        400 => 'Permintaan Tidak Valid',
        401 => 'Belum Terautentikasi',
        403 => 'Akses Ditolak',
        404 => 'Halaman Tidak Ditemukan',
        405 => 'Metode Tidak Diizinkan',
        408 => 'Waktu Permintaan Habis',
        419 => 'Sesi Berakhir',
        500 => 'Kesalahan Server',
        502 => 'Gateway Bermasalah',
        503 => 'Layanan Tidak Tersedia',
    ],
    'descriptions' => [
        400 => 'Permintaan tidak dapat dipahami oleh server.',
        401 => 'Anda perlu masuk untuk mengakses halaman ini.',
        403 => 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        404 => 'Halaman yang Anda cari tidak dapat ditemukan.',
        405 => 'Metode permintaan yang digunakan tidak diizinkan untuk halaman ini.',
        408 => 'Server kehabisan waktu menunggu permintaan Anda.',
        419 => 'Sesi Anda telah berakhir. Silakan muat ulang halaman dan coba lagi.',
        500 => 'Ups, terjadi kesalahan pada server kami.',
        502 => 'Server menerima respons yang tidak valid.',
        503 => 'Maaf, layanan sedang tidak tersedia untuk sementara.',
    ],
];
