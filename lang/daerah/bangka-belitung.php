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
// Bahasa: BANGKA BELITUNG (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapkan Langkah Kau!',
    'home_hero_desc' => 'Dari ikon wisata yang terkenal sampe hidden gem yang tesuruk, temui destinasi yang cocok ngen gaya jalan-jalanmu same NuraLoka.',
    'home_search_greeting' => 'Nak ke mane hari ni, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Jalan-jalan Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Urang Nuravers',
    'challenge_badges' => 'Lencane Urang Nuravers',
    'challenge_levels' => 'Perjalanan Level Kau',
    'challenge_leaderboard' => 'Papan Peringkat Urang Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian Urang Nuravers',

    // ── Album ──
    'album_index' => 'Album Urang Nuravers',
];
