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
// Bahasa: MINANG (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapkan Langkah Ang!',
    'home_hero_desc' => 'Dari ikon wisata nan tanamo sampai hidden gem nan tasuruak, cari lah destinasi nan sasuai jo gaya jalan ang basamo NuraLoka.',
    'home_search_greeting' => 'Nak ka ma hari ko, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Pangatahuan Jalan-jalan Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Urang Nuravers',
    'challenge_badges' => 'Lencana Urang Nuravers',
    'challenge_levels' => 'Perjalanan Level Ang',
    'challenge_leaderboard' => 'Papan Peringkat Urang Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Cita-cito Urang Nuravers',

    // ── Album ──
    'album_index' => 'Album Urang Nuravers',
];
