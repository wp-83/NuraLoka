<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\Category;
use App\Models\Mission;
use App\Models\News;
use App\Models\OsmImportRun;
use App\Models\Place;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return inertia('Admin/Dashboard', [
            'stats' => [
                'totalNews' => News::count(),
                'totalUsers' => User::count(),
                'totalPlaces' => Place::count(),
                'totalCategories' => Category::count(),
                'totalBadges' => Badge::count(),
                'totalMissions' => Mission::count(),
                'totalBannedUsers' => User::where('is_banned', true)->count(),
                'activeImports' => OsmImportRun::whereIn('status', ['pending', 'running'])->count(),
            ],

            'recentUsers' => User::with('userDetail')
                ->where('is_admin', false)
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'fullname' => $user->userDetail?->fullname,
                    'public_profile_photo' => $user->public_profile_photo,
                    'created_at' => $user->created_at,
                ]),

            'recentNews' => News::latest('publish_date')
                ->take(3)
                ->get(['id', 'title', 'thumbnail', 'publish_date']),
        ]);
    }
}
