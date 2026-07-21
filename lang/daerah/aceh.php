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
// Bahasa: ACEH (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Peuteugoh Langkah Droeneuh!',
    'home_hero_desc' => 'Nibak ikon wisata nyang meushuhu sampoe hidden gem nyang teusom, mita destinasi nyang cocok ngon gaya jak droeneuh meusajan NuraLoka.',
    'home_search_greeting' => 'Keuneuk jak ho uroe nyoe, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Jak-Jak Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Geutanyoe Nuravers',
    'challenge_badges' => 'Lencana Geutanyoe Nuravers',
    'challenge_levels' => 'Perjalanan Level Droeneuh',
    'challenge_leaderboard' => 'Papan Peringkat Geutanyoe Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian nibak Nuravers',

    // ── Album ──
    'album_index' => 'Album Geutanyoe Nuravers',
];
