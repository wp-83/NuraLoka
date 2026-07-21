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
// Bahasa: MELAYU RIAU (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapkan Langkah Kau!',
    'home_hero_desc' => 'Dari ikon wisata yang terkenal sampai hidden gem yang tersembunyi, jumpolah destinasi yang sesuai dengan gaya perjalananmu bersamo NuraLoka.',
    'home_search_greeting' => 'Nak ke mano hari ni, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Wisato Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Cabaran Nuravers',
    'challenge_badges' => 'Lencano Nuravers',
    'challenge_levels' => 'Perjalanan Level Kau',
    'challenge_leaderboard' => 'Papan Kedudukan Para Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian Urang Nuravers',

    // ── Album ──
    'album_index' => 'Album Para Nuravers',
];
