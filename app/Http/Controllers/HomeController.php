<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\News;
use App\Services\GamificationService;

class HomeController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $latestNews = News::with('user.userDetail')
            ->orderBy('publish_date', 'desc')
            ->take(3)
            ->get();

        // The mission closest to completion. The logic lives in GamificationService
        // so the home page and the Challenge page can never show a different
        // mission or a different percentage.
        $ongoingMission = $user
            ? app(GamificationService::class)->ongoingMissions($user)->first()
            : null;

        // This week's popular albums. Sama persis dengan halaman Album — kedua
        // halaman memakai satu scope (Album::scopePopularThisWeek) supaya
        // peringkatnya tidak pernah berbeda.
        $popularAlbums = Album::with(['trip.user.userDetails', 'tripPhotos'])
            ->popularThisWeek()
            ->take(4)
            ->get()
            ->map(function ($album) {
                $trip = $album->trip;
                $firstPhoto = $album->tripPhotos->first();

                return [
                    'id' => $album->id,
                    'slug' => $album->slug,
                    'title' => $trip->title,
                    'thumbnail' => $firstPhoto?->photo_path,
                    'view_count' => $album->view_count,
                    'weekly_views' => (int) $album->weekly_views,
                ];
            });

        return inertia('Home/Index', [
            'latestNews' => $latestNews,
            'ongoingMission' => $ongoingMission,
            'popularAlbums' => $popularAlbums,
        ]);
    }
}
