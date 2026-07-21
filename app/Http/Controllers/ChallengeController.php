<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\Level;
use App\Models\UserDetail;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        // Guard: if the levels table is empty or unseeded, do not crash on
        // $levels[0]/[1]. Return a safe default instead.
        if (empty($levels)) {
            return [['name' => '-', 'min' => 0], null];
        }

        $currentLevel = $levels[0];
        $nextLevel = $levels[1] ?? null;

        for ($i = count($levels) - 1; $i >= 0; $i--) {
            if ($totalPoints >= $levels[$i]['min']) {
                $currentLevel = $levels[$i];
                $nextLevel = $i < count($levels) - 1 ? $levels[$i + 1] : null;
                break;
            }
        }

        return [$currentLevel, $nextLevel];
    }

    /** Highest level whose threshold $points still meets. Shared by the leaderboard and index. */
    private function levelNameForPoints(array $levels, int $points): string
    {
        $name = $levels[0]['name'] ?? '-';
        for ($i = count($levels) - 1; $i >= 0; $i--) {
            if ($points >= $levels[$i]['min']) {
                $name = $levels[$i]['name'];
                break;
            }
        }

        return $name;
    }

    public function index()
    {
        $user = auth()->user();
        $detail = UserDetail::where('user_id', $user->id)->first();
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

        $userBadgeIds = $user ? $user->badges()->pluck('badges.id')->toArray() : [];
        $allBadges = Badge::all()->map(function ($badge) use ($userBadgeIds) {
            $badge->earned = in_array($badge->id, $userBadgeIds);

            return $badge;
        });

        // The SAME source as the home page; see GamificationService::ongoingMissions.
        $ongoingMissions = $user
            ? app(GamificationService::class)->ongoingMissions($user)
            : [];

        $levels = $this->getLevels();
        // The level name comes from the user's stored level relation
        // (user_details.level_id), NOT recomputed from points, so the leaderboard,
        // the navbar and the profile page always name the same level for a user.
        // levelNameForPoints() is only a fallback when level_id is not set.
        $leaderboard = UserDetail::with(['user', 'level'])
            ->orderByDesc('total_points')
            ->orderBy('id')
            ->take(6)
            ->get()
            ->map(function ($detail, $index) use ($levels, $user) {
                return [
                    'rank' => $index + 1,
                    'name' => $detail->fullname,
                    'username' => $detail->user->username ?? '',
                    'points' => $detail->total_points,
                    'profile_path' => $detail->user->public_profile_photo ?? null,
                    'level' => $detail->level?->name
                        ?? $this->levelNameForPoints($levels, $detail->total_points),
                    'is_current' => $user && $user->id === $detail->user_id,
                ];
            });

        return inertia('Challenge/Index', [
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

    public function badges(GamificationService $gamification)
    {
        $user = auth()->user();
        $userBadgeIds = $user ? $user->badges()->pluck('badges.id')->toArray() : [];
        $categoryCounts = $user ? $gamification->albumCategoryCounts($user) : [];

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

        $tierNames = ['Perunggu', 'Perak', 'Emas', 'Berlian'];

        foreach ($categories as $categoryName => $categoryBadges) {
            $tiers = [];
            $maxTarget = 1;
            $earnedTarget = 0;

            foreach ($categoryBadges as $badge) {
                $earned = in_array($badge->id, $userBadgeIds);
                $maxTarget = max($maxTarget, $badge->tier_target);

                if ($earned) {
                    $earnedTarget = max($earnedTarget, (int) $badge->tier_target);
                }

                $tiers[] = [
                    'name' => $tierNames[$badge->tier_level - 1] ?? 'Tingkat',
                    'target' => $badge->tier_target,
                    'icon_path' => $badge->icon_path,
                    'points' => $badge->points,
                    'earned' => $earned,
                ];
            }

            // Progress from the user's own albums and photos, the same criteria
            // GamificationService::syncAlbumBadges uses to award these badges.
            $dataProgress = (int) ($categoryCounts[$categoryName] ?? 0);

            // ... BUT badges can also come from completing MISSIONS, which count
            // actions rather than album data. A user can therefore own a tier
            // while their album data still reads zero: the icon lights up as
            // earned while the progress ring shows 0%, contradicting each other
            // on the same screen.
            //
            // The progress shown must therefore never be lower than the highest
            // tier already owned.
            $currentProgress = max($dataProgress, $earnedTarget);

            // Next tier: the first target not yet passed.
            $nextTier = $categoryBadges
                ->where('tier_target', '>', $currentProgress)
                ->sortBy('tier_target')
                ->first();

            $nextTierTargetVal = $nextTier ? (int) $nextTier->tier_target : $maxTarget;
            $nextTierName = $nextTier ? ($tierNames[$nextTier->tier_level - 1] ?? '') : 'Maksimal';

            $progressPercent = $nextTierTargetVal > 0
                ? min(100, (int) round(($currentProgress / $nextTierTargetVal) * 100))
                : 100;

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

        return inertia('Challenge/Badges', [
            'generalBadges' => array_values($generalBadges),
            'specialBadges' => $specialBadges,
        ]);
    }

    public function leaderboard(Request $request)
    {
        $user = auth()->user();
        $search = $request->input('search');

        $levels = $this->getLevels();

        $query = UserDetail::with(['user', 'level']);

        if ($search) {
            $query->where('fullname', 'like', "%{$search}%");
        }

        $totalResults = null;
        if ($search) {
            $totalResults = $query->count();
        }

        // The tiebreaker on id is what keeps the displayed order and the "#rank"
        // agreeing. total_points alone is not unique — several users share a score
        // — and two separate queries may order tied rows differently, so a user
        // could sit third in the list while showing #4.
        $leaderboardData = $query->orderByDesc('total_points')
            ->orderBy('id')
            ->take(50)
            ->get();

        // Global rank, so a searched user still shows their true position rather
        // than their index in the filtered result. Must use the SAME ordering as
        // the query above.
        $rankings = array_flip(
            UserDetail::orderByDesc('total_points')->orderBy('id')->pluck('id')->toArray()
        );

        $leaderboard = $leaderboardData->map(function ($detail) use ($levels, $user, $rankings) {
            $rank = ($rankings[$detail->id] ?? 0) + 1;

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
                // As in index(): follow the user's stored level.
                'level' => $detail->level?->name
                    ?? $this->levelNameForPoints($levels, $detail->total_points),
                'is_current' => $user && $user->id === $detail->user_id,
                'badge_icons' => $badges,
                'badge_count' => $badgeCount,
            ];
        });

        return inertia('Challenge/LeaderboardFull', [
            'leaderboard' => $leaderboard,
            'search' => $search,
            'totalResults' => $totalResults,
        ]);
    }

    public function levels()
    {
        $user = auth()->user();
        $detail = UserDetail::with('level')->where('user_id', $user->id)->first();
        $totalPoints = $detail ? $detail->total_points : 0;

        $levels = $this->getLevels();

        // Follow the user's stored level (user_details.level_id), the same as
        // the navbar, the profile page and the leaderboard, rather than
        // recomputing from points. That way the level named here can never differ
        // from the other pages. calculateLevel() is only a fallback when level_id
        // is not set.
        $currentLevel = $detail?->level
            ? ['name' => $detail->level->name, 'min' => $detail->level->min_points]
            : $this->calculateLevel($totalPoints)[0];

        return inertia('Challenge/Levels', [
            'totalPoints' => $totalPoints,
            'currentLevel' => $currentLevel,
            'allLevels' => $levels,
        ]);
    }
}
