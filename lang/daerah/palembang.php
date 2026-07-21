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
// Bahasa: PALEMBANG (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapkan Langkah Kau!',
    'home_hero_desc' => 'Dari ikon wisata yang terkenal sampe hidden gem yang tesungkok, temui destinasi yang cocok nga gaya jalan-jalanmu samo NuraLoka.',
    'home_search_greeting' => 'Nak ka mano hari ini, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Wisato Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Wong Nuravers',
    'challenge_badges' => 'Lencano Wong Nuravers',
    'challenge_levels' => 'Perjalanan Level Kau',
    'challenge_leaderboard' => 'Papan Peringkat Wong Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Cito-cito Wong Nuravers',

    // ── Album ──
    'album_index' => 'Album Wong Nuravers',
];
