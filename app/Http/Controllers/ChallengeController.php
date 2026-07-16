<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\Level;
use App\Models\Mission;
use App\Models\UserDetail;
use App\Models\UserMission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChallengeController extends Controller
{
    private function getLevels()
    {
        return Level::orderBy('order')->get()->map(function ($level) {
            return ['name' => $level->name, 'min' => $level->min_points];
        })->toArray();
    }

    private function calculateLevel($totalPoints)
    {
        $levels = $this->getLevels();
        $currentLevel = $levels[0];
        $nextLevel = $levels[1];

        for ($i = count($levels) - 1; $i >= 0; $i--) {
            if ($totalPoints >= $levels[$i]['min']) {
                $currentLevel = $levels[$i];
                $nextLevel = $i < count($levels) - 1 ? $levels[$i + 1] : null;
                break;
            }
        }

        return [$currentLevel, $nextLevel];
    }

    public function index()
    {
        $user = auth()->user();
        $detail = tap(UserDetail::where('user_id', $user->id)->first(), function ($detail) {
            // For testing if user has no detail
            if (! $detail) {
                $detail = new UserDetail;
                $detail->total_points = 0;
            }
        });

        $totalPoints = $detail ? $detail->total_points : 0;

        [$currentLevel, $nextLevel] = $this->calculateLevel($totalPoints);

        $pointsForNextLevel = $nextLevel ? $nextLevel['min'] - $totalPoints : 0;

        // Fix for progress calculation
        $currentMin = $currentLevel['min'];
        $nextMin = $nextLevel ? $nextLevel['min'] : $currentMin;
        $progressPercent = 100;

        if ($nextLevel) {
            $progressPercent = (($totalPoints - $currentMin) / ($nextMin - $currentMin)) * 100;
        }

        $allBadges = Badge::all()->map(function ($badge) use ($user) {
            $badge->earned = clone tap($badge, function ($b) use ($user) {
                if ($user) {
                    return $user->badges->contains($b->id);
                }

                return false;
            });

            return $badge;
        });

        // Simpler approach for badge earned status
        $userBadgeIds = $user ? $user->badges()->pluck('badges.id')->toArray() : [];
        $allBadges = Badge::all()->map(function ($badge) use ($userBadgeIds) {
            $badge->earned = in_array($badge->id, $userBadgeIds);

            return $badge;
        });

        $ongoingMissions = [];
        if ($user) {
            $ongoingMissions = Mission::leftJoin('user_missions', function ($join) use ($user) {
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
                // Prioritaskan: 1) misi yang hampir selesai (>= 50%), 2) misi termudah berdasarkan tier badge
                ->orderByRaw('CASE WHEN COALESCE(user_missions.progress, 0) >= (missions.target * 0.5) AND COALESCE(user_missions.progress, 0) > 0 THEN 0 ELSE 1 END ASC')
                ->orderBy('badges.tier_level', 'asc')
                ->orderBy('missions.target', 'asc')
                ->take(1)
                ->get()
                ->map(function ($mission) {
                    $mission->percent = $mission->target > 0 ? min(100, round(($mission->progress / $mission->target) * 100)) : 0;

                    return $mission;
                });
        }

        $levels = $this->getLevels();
        $leaderboard = UserDetail::with('user')
            ->orderByDesc('total_points')
            ->take(6)
            ->get()
            ->map(function ($detail, $index) use ($levels, $user) {
                $levelName = $levels[0]['name'];
                for ($i = count($levels) - 1; $i >= 0; $i--) {
                    if ($detail->total_points >= $levels[$i]['min']) {
                        $levelName = $levels[$i]['name'];
                        break;
                    }
                }

                return [
                    'rank' => $index + 1,
                    'name' => $detail->fullname,
                    'username' => $detail->user->username ?? '',
                    'points' => $detail->total_points,
                    'profile_path' => $detail->user->public_profile_photo ?? null,
                    'level' => $levelName,
                    'is_current' => $user && $user->id === $detail->user_id,
                ];
            });

        return Inertia::render('Challenge/Index', [
            'user' => $user,
            'totalPoints' => $totalPoints,
            'currentLevel' => $currentLevel,
            'nextLevel' => $nextLevel,
            'pointsForNextLevel' => $pointsForNextLevel,
            'progressPercent' => $progressPercent,
            'allBadges' => $allBadges,
            'ongoingMissions' => $ongoingMissions,
            'leaderboard' => $leaderboard,
        ]);
    }

    public function badges()
    {
        $user = auth()->user();
        $userBadgeIds = $user ? $user->badges()->pluck('badges.id')->toArray() : [];

        $badges = Badge::orderBy('tier_level')->get();

        $specialBadges = $badges->where('type', 'special')->map(function ($badge) use ($userBadgeIds) {
            return [
                'name' => $badge->name,
                'description' => $badge->requirement_description,
                'how_to' => 'Selesaikan tantangan ini untuk mendapatkan lencana.',
                'icon_path' => $badge->icon_path,
                'points' => $badge->points,
                'earned' => in_array($badge->id, $userBadgeIds),
            ];
        })->values();

        // Group general badges by category
        $generalBadges = [];
        $categories = $badges->where('type', 'general')->groupBy('category');

        foreach ($categories as $categoryName => $categoryBadges) {
            $tiers = [];
            $maxProgress = 0;
            $maxTarget = 1;

            foreach ($categoryBadges as $badge) {
                $earned = in_array($badge->id, $userBadgeIds);
                if ($earned) {
                    $maxProgress = max($maxProgress, $badge->tier_target);
                }

                $maxTarget = max($maxTarget, $badge->tier_target);

                $tiers[] = [
                    'name' => ['Perunggu', 'Perak', 'Emas', 'Berlian'][$badge->tier_level - 1] ?? 'Tingkat',
                    'target' => $badge->tier_target,
                    'icon_path' => $badge->icon_path,
                    'points' => $badge->points,
                    'earned' => $earned,
                ];
            }

            // Estimate current progress based on earned badges (for demo purposes)
            // Ideally we should track this in another table, but let's derive it
            $currentProgress = $maxProgress;
            if ($currentProgress == 0 && $user) {
                // If they have no badges, maybe they have ongoing mission?
                $ongoing = UserMission::where('user_id', $user->id)
                    ->join('missions', 'user_missions.mission_id', '=', 'missions.id')
                    ->where('missions.badge_id', $categoryBadges->first()->id)
                    ->first();
                if ($ongoing) {
                    $currentProgress = $ongoing->progress;
                }
            }

            // Next tier logic
            $nextTierTarget = $categoryBadges->where('tier_target', '>', $currentProgress)->sortBy('tier_target')->first();
            $nextTierTargetVal = $nextTierTarget ? $nextTierTarget->tier_target : $maxTarget;
            $nextTierName = $nextTierTarget ? (['Perunggu', 'Perak', 'Emas', 'Berlian'][$nextTierTarget->tier_level - 1] ?? '') : 'Maksimal';

            $progressPercent = $nextTierTargetVal > 0 ? min(100, round(($currentProgress / $nextTierTargetVal) * 100)) : 100;

            $generalBadges[] = [
                'name' => $categoryName,
                'description' => $categoryBadges->first()->requirement_description,
                'progress' => $progressPercent,
                'progressCount' => $currentProgress,
                'progressTarget' => $nextTierTargetVal,
                'nextTier' => $nextTierName,
                'tiers' => $tiers,
            ];
        }

        return Inertia::render('Challenge/Badges', [
            'generalBadges' => array_values($generalBadges),
            'specialBadges' => $specialBadges,
        ]);
    }

    public function leaderboard(Request $request)
    {
        $user = auth()->user();
        $search = $request->input('search');

        $levels = $this->getLevels();

        $query = UserDetail::with('user');

        if ($search) {
            $query->where('fullname', 'like', "%{$search}%");
        }

        $totalResults = null;
        if ($search) {
            $totalResults = $query->count();
        }

        $leaderboardData = $query->orderByDesc('total_points')
            ->take(50)
            ->get();

        // Calculate global rank by fetching all users ordered by points (simplistic, could be heavy in prod)
        $rankings = UserDetail::orderByDesc('total_points')->pluck('id')->toArray();

        $leaderboard = $leaderboardData->map(function ($detail) use ($levels, $user, $rankings) {
            $levelName = $levels[0]['name'];
            for ($i = count($levels) - 1; $i >= 0; $i--) {
                if ($detail->total_points >= $levels[$i]['min']) {
                    $levelName = $levels[$i]['name'];
                    break;
                }
            }

            $rank = array_search($detail->id, $rankings) + 1;

            // Get user's badges
            $badges = DB::table('user_badges')
                ->where('user_id', $detail->user_id)
                ->join('badges', 'user_badges.badge_id', '=', 'badges.id')
                ->take(5)
                ->pluck('badges.icon_path')
                ->toArray();

            $badgeCount = DB::table('user_badges')->where('user_id', $detail->user_id)->count();

            return [
                'rank' => $rank,
                'name' => $detail->fullname,
                'username' => $detail->user->username ?? '',
                'user_id' => $detail->user_id,
                'points' => $detail->total_points,
                'profile_path' => $detail->user->public_profile_photo ?? null,
                'level' => $levelName,
                'is_current' => $user && $user->id === $detail->user_id,
                'badge_icons' => $badges,
                'badge_count' => $badgeCount,
            ];
        });

        return Inertia::render('Challenge/LeaderboardFull', [
            'leaderboard' => $leaderboard,
            'search' => $search,
            'totalResults' => $totalResults,
        ]);
    }

    public function levels()
    {
        $user = auth()->user();
        $detail = UserDetail::where('user_id', $user->id)->first();
        $totalPoints = $detail ? $detail->total_points : 0;

        $levels = $this->getLevels();
        [$currentLevel, $nextLevel] = $this->calculateLevel($totalPoints);

        return Inertia::render('Challenge/Levels', [
            'totalPoints' => $totalPoints,
            'currentLevel' => $currentLevel,
            'allLevels' => $levels,
        ]);
    }
}
