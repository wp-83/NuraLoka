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
// Bahasa: SASAK (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantepang Langkahde!',
    'home_hero_desc' => 'Lekan ikon wisata saq kesohor jangke hidden gem saq tesembunyi, boyaq destinasi saq sesuai kance gaya pelayarande bareng NuraLoka.',
    'home_search_greeting' => 'Mele ojok mbe jelo niki, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Pelayaran Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Side Nuravers',
    'challenge_badges' => 'Lencana Side Nuravers',
    'challenge_levels' => 'Pelayaran Level Side',
    'challenge_leaderboard' => 'Papan Peringkat Side Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian lekan Nuravers',

    // ── Album ──
    'album_index' => 'Album Side Nuravers',
];
