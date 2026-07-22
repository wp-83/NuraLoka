<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\News;
use App\Services\AlbumPresenter;
use App\Services\GamificationService;

/**
 * The signed-in landing page: latest news, the mission in progress, and the
 * albums people are looking at this week.
 */
class HomeController extends Controller
{
    /** News items shown in the "latest" strip. */
    private const NEWS_LIMIT = 3;

    /** Albums shown in the "popular this week" strip. */
    private const POPULAR_ALBUM_LIMIT = 4;

    public function __construct(
        private readonly AlbumPresenter $albums,
        private readonly GamificationService $gamification,
    ) {}

    public function index()
    {
        $user = auth()->user();

        $latestNews = News::with('user.userDetail')
            ->orderByDesc('publish_date')
            ->take(self::NEWS_LIMIT)
            ->get();

        // The mission closest to completion. The logic lives in
        // GamificationService so the home page and the Challenge page can never
        // show a different mission or a different percentage.
        $ongoingMission = $user
            ? $this->gamification->ongoingMissions($user)->first()
            : null;

        // Popular albums come from the same scope as the Album page
        // (Album::scopePopularThisWeek), so the two rankings cannot disagree.
        $popularAlbums = Album::withCardData()
            ->popularThisWeek()
            ->take(self::POPULAR_ALBUM_LIMIT)
            ->get();

        return inertia('Home/Index', [
            'latestNews' => $latestNews,
            'ongoingMission' => $ongoingMission,
            'popularAlbums' => $this->albums->cards($popularAlbums),
        ]);
    }
}
