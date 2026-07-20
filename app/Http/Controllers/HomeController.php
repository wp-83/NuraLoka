<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Mission;
use App\Models\News;

class HomeController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $latestNews = News::with('user.userDetail')
            ->orderBy('publish_date', 'desc')
            ->take(3)
            ->get();

        // Misi yang sedang berjalan — logika identik dengan ChallengeController,
        // hanya ambil 1 misi paling diprioritaskan (hampir selesai / termudah).
        $ongoingMission = null;
        if ($user) {
            $result = Mission::leftJoin('user_missions', function ($join) use ($user) {
                $join->on('missions.id', '=', 'user_missions.mission_id')
                    ->where('user_missions.user_id', '=', $user->id);
            })
                ->join('badges', 'missions.badge_id', '=', 'badges.id')
                ->where(function ($query) {
                    $query->where('user_missions.status', '!=', 'completed')
                        ->orWhereNull('user_missions.status');
                })
                ->select(
                    'missions.id',
                    'missions.title',
                    'missions.description',
                    'missions.points_reward as points',
                    'badges.icon_path as badge_icon',
                    'badges.name as badge',
                    'badges.tier_level',
                    \DB::raw('COALESCE(user_missions.progress, 0) as progress'),
                    'missions.target'
                )
                ->orderByRaw('CASE WHEN COALESCE(user_missions.progress, 0) >= (missions.target * 0.5) AND COALESCE(user_missions.progress, 0) > 0 THEN 0 ELSE 1 END ASC')
                ->orderBy('badges.tier_level', 'asc')
                ->orderBy('missions.target', 'asc')
                ->take(1)
                ->get()
                ->map(function ($mission) {
                    $mission->percent = $mission->target > 0
                        ? min(100, round(($mission->progress / $mission->target) * 100))
                        : 0;

                    return $mission;
                })
                ->first();

            $ongoingMission = $result;
        }

        // Album populer minggu ini (publik, dari semua user, sorted by view_count, constraint seminggu)
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
                ];
            });

        return inertia('Home/Index', [
            'latestNews' => $latestNews,
            'ongoingMission' => $ongoingMission,
            'popularAlbums' => $popularAlbums,
        ]);
    }
}
