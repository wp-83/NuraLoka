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

        // This week's popular albums: public, from any user, ordered by view_count.
        $popularAlbums = Album::with(['trip.user.userDetails', 'tripPhotos'])
            ->whereHas('trip', function ($q) {
                $q->where('is_public', true)
                    ->where('trip_date', '>=', now()->subWeek())
                    ->whereHas('user', function ($uq) {
                        $uq->where('is_banned', false);
                    });
            })
            ->orderByDesc('view_count')
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
                ];
            });

        return inertia('Home/Index', [
            'latestNews' => $latestNews,
            'ongoingMission' => $ongoingMission,
            'popularAlbums' => $popularAlbums,
        ]);
    }
}
