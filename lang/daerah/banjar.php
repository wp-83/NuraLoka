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
// Bahasa: BANJAR (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapakan Langkah Ikam!',
    'home_hero_desc' => 'Matan ikon wisata nang tarkanal sampai hidden gem nang tasuruk, temui akan destinasi nang pas lawan gaya bajalananmu wan NuraLoka.',
    'home_search_greeting' => 'Handak ka mana hari nih, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Wisata Urang Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Urang Nuravers',
    'challenge_badges' => 'Lencana Urang Nuravers',
    'challenge_levels' => 'Perjalanan Level Ikam',
    'challenge_leaderboard' => 'Papan Peringkat Urang Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Kahandak Urang Nuravers',

    // ── Album ──
    'album_index' => 'Album Urang Nuravers',
];
