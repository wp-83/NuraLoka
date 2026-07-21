<?php

// ─────────────────────────────────────────────────────────────────────────────
// PAGE TITLES (browser <title> tag).
//
// Used through the pageTitle prop on MainLayout / AdminLayout:
//     Page.layout = (page) => <MainLayout pageTitle="title.album" content={page} />
//
// The layout calls t() itself, so pages only pass the KEY. Keys must be
// IDENTICAL across id/en/ko.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── User pages ──
    'home' => 'Home',
    'explore' => 'Explore',
    'album' => 'Albums',
    'album_all' => 'All Albums',
    'album_create' => 'Create New Album',
    'album_edit' => 'Edit Album',
    'album_show' => 'Album Detail',
    'wishlist' => 'Wishlist',
    'news' => 'Travel Insights',
    'news_show' => 'Travel Insight Detail',
    'challenge' => 'Challenges',
    'badges' => 'Badges',
    'levels' => 'Levels',
    'leaderboard' => 'Leaderboard',
    'profile' => 'Profile',
    'profile_edit' => 'Update Profile',
    'profile_show' => 'User Profile',

    // ── Admin pages ──
    'admin_dashboard' => 'Dashboard',
    'admin_users' => 'Manage Users',
    'admin_user_create' => 'Add New User',
    'admin_user_edit' => 'Edit User',
    'admin_badges' => 'Manage Badges',
    'admin_badge_create' => 'Add Badge',
    'admin_badge_edit' => 'Edit Badge',
    'admin_categories' => 'Manage Categories',
    'admin_category_create' => 'Add Category',
    'admin_category_edit' => 'Edit Category',
    'admin_levels' => 'Manage Levels',
    'admin_level_create' => 'Add Level',
    'admin_level_edit' => 'Edit Level',
    'admin_missions' => 'Manage Challenges',
    'admin_mission_create' => 'Add Challenge',
    'admin_mission_edit' => 'Edit Challenge',
    'admin_news' => 'Manage Travel Insights',
    'admin_news_create' => 'Add Travel Insight',
    'admin_news_edit' => 'Edit Travel Insight',
    'admin_places' => 'Manage Destinations',
    'admin_place_create' => 'Add Destination',
    'admin_place_edit' => 'Edit Destination',
    'admin_osm_import' => 'Import OSM Points',
];
