<?php

// ─────────────────────────────────────────────────────────────────────────────
// Localization BAHASA DAERAH — terpisah dari localization utama (id/en/ko).
// Mengganti bahasa aplikasi TIDAK memengaruhi file ini.
// Berisi subtitle bahasa daerah yang tampil di bawah judul halaman & hero Home.
// Struktur: lang/daerah/{bahasa}.php ; satu file per bahasa daerah.
// Kunci di SEMUA file bahasa daerah harus SAMA (lihat jawa.php sebagai acuan).
// Nilai '' berarti BELUM diterjemahkan — resolver otomatis mundur ke bahasa
// pulau, lalu ke Bahasa Indonesia. Jadi aman dibiarkan kosong.
//
// Bahasa: SUNDA (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantepkeun Lengkah Anjeun!',
    'home_hero_desc' => 'Ti ikon wisata nu kasohor nepi ka hidden gem nu nyumput, teangan destinasi nu luyu jeung gaya lalampahan anjeun bareng NuraLoka.',
    'home_search_greeting' => 'Rék ka mana poé ieu, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Pangaweruh Wisata Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tangtangan Nuravers',
    'challenge_badges' => 'Tanda Pangajén Nuravers',
    'challenge_levels' => 'Lalampahan Level Anjeun',
    'challenge_leaderboard' => 'Papan Tingkatan Para Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian ti Nuravers',

    // ── Album ──
    'album_index' => 'Albumna Nuravers',
];
