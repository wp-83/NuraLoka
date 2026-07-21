<?php

// ─────────────────────────────────────────────────────────────────────────────
// 페이지 제목 (브라우저 <title> 태그).
//
// MainLayout / AdminLayout 의 pageTitle prop 으로 사용합니다:
//     Page.layout = (page) => <MainLayout pageTitle="title.album" content={page} />
//
// 레이아웃이 직접 t() 를 호출하므로 페이지는 KEY 만 전달합니다.
// 키는 id/en/ko 세 언어에서 반드시 동일해야 합니다.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── 사용자 페이지 ──
    'home' => '홈',
    'explore' => '둘러보기',
    'album' => '앨범',
    'album_all' => '전체 앨범',
    'album_create' => '새 앨범 만들기',
    'album_edit' => '앨범 수정',
    'album_show' => '앨범 상세',
    'wishlist' => '위시리스트',
    'news' => '여행 정보',
    'news_show' => '여행 정보 상세',
    'challenge' => '챌린지',
    'badges' => '배지',
    'levels' => '레벨',
    'leaderboard' => '리더보드',
    'profile' => '프로필',
    'profile_edit' => '프로필 수정',
    'profile_show' => '사용자 프로필',

    // ── 관리자 페이지 ──
    'admin_dashboard' => '대시보드',
    'admin_users' => '사용자 관리',
    'admin_user_create' => '사용자 추가',
    'admin_user_edit' => '사용자 수정',
    'admin_badges' => '배지 관리',
    'admin_badge_create' => '배지 추가',
    'admin_badge_edit' => '배지 수정',
    'admin_categories' => '카테고리 관리',
    'admin_category_create' => '카테고리 추가',
    'admin_category_edit' => '카테고리 수정',
    'admin_levels' => '레벨 관리',
    'admin_level_create' => '레벨 추가',
    'admin_level_edit' => '레벨 수정',
    'admin_missions' => '챌린지 관리',
    'admin_mission_create' => '챌린지 추가',
    'admin_mission_edit' => '챌린지 수정',
    'admin_news' => '여행 정보 관리',
    'admin_news_create' => '여행 정보 추가',
    'admin_news_edit' => '여행 정보 수정',
    'admin_places' => '여행지 관리',
    'admin_place_create' => '여행지 추가',
    'admin_place_edit' => '여행지 수정',
    'admin_osm_import' => 'OSM 지점 가져오기',
];
