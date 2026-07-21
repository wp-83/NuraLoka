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
// Bahasa: MADURA (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Pakoko Langkana Ba\'na!',
    'home_hero_desc' => 'Dhari ikon wisata se kasohor sampe\' hidden gem se ta\'katon, sare destinasi se cocok bi\' gaya alalana ba\'na bareng NuraLoka.',
    'home_search_greeting' => 'Ka dhimma are teya, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Ajalan Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Ba\'na Nuravers',
    'challenge_badges' => 'Lencana Ba\'na Nuravers',
    'challenge_levels' => 'Alalana Level Ba\'na',
    'challenge_leaderboard' => 'Papan Peringkat Ba\'na Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian dhari Nuravers',

    // ── Album ──
    'album_index' => 'Album Ba\'na Nuravers',
];
