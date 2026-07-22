<?php

namespace App\Services;

use App\Models\Album;
use App\Models\Badge;
use App\Models\Level;
use App\Models\Mission;
use App\Models\Place;
use App\Models\TripPhoto;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\UserMission;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * The one gamification engine.
 *
 * When a user does something real (a check-in, say), record() finds the missions
 * whose action_type matches, advances their progress and — once the target is
 * reached — marks the mission complete, adds points to total_points (which
 * raises the level automatically) and awards the badge behind it.
 *
 * Deliberately failure-tolerant: a gamification error must NEVER make the user's
 * actual action (check-in, save, album) fail with it.
 */
class GamificationService
{
    /** Supported trigger actions → the label shown in the admin dropdown. */
    public const ACTIONS = [
        'checkin' => 'Check-in di tempat',
        'save_place' => 'Simpan tempat ke Daftar Impian',
        'create_album' => 'Membuat album perjalanan',
    ];

    /** The actions that can be narrowed to a place category. */
    public const CATEGORY_ACTIONS = ['checkin', 'save_place'];

    /**
     * Record one user action and advance every mission it matches.
     *
     * @param  Place|null  $place  the place involved, for place-based actions and the category filter
     * @return Mission[] the missions this call has just COMPLETED
     */
    public function record(User $user, string $action, ?Place $place = null): array
    {
        try {
            $categoryIds = $place ? $place->categories()->pluck('categories.id')->all() : [];

            $query = Mission::where('action_type', $action);

            if (in_array($action, self::CATEGORY_ACTIONS, true)) {
                // Missions with no category (they apply everywhere) OR whose
                // category matches this particular place.
                $query->where(function ($q) use ($categoryIds) {
                    $q->whereNull('category_id');
                    if (! empty($categoryIds)) {
                        $q->orWhereIn('category_id', $categoryIds);
                    }
                });
            } else {
                // An action with no place can only match an uncategorised mission.
                $query->whereNull('category_id');
            }

            $completed = [];
            foreach ($query->get() as $mission) {
                $done = $this->advanceMission($user, $mission);
                if ($done) {
                    $completed[] = $done;
                }
            }

            return $completed;
        } catch (\Throwable $e) {
            // Never let this take the user's actual action down with it.
            Log::warning('Gamification record failed: '.$e->getMessage(), [
                'user_id' => $user->id ?? null,
                'action' => $action,
            ]);

            return [];
        }
    }

    /** Advance progress by one step; returns the Mission if this completed it, else null. */
    private function advanceMission(User $user, Mission $mission): ?Mission
    {
        return DB::transaction(function () use ($user, $mission) {
            $um = UserMission::where('user_id', $user->id)
                ->where('mission_id', $mission->id)
                ->lockForUpdate()
                ->first();

            if (! $um) {
                $um = new UserMission([
                    'user_id' => $user->id,
                    'mission_id' => $mission->id,
                    'progress' => 0,
                    'status' => 'on_going',
                ]);
            }

            if ($um->status === 'completed') {
                return null; // already done → do not count it twice
            }

            // The user_missions.status column is enum('on_going','completed').
            $target = max(1, (int) $mission->target);
            $um->progress = min((int) $um->progress + 1, $target);
            $um->status = $um->progress >= $target ? 'completed' : 'on_going';
            $um->save();

            if ($um->status === 'completed') {
                $this->awardCompletion($user, $mission);

                return $mission;
            }

            return null;
        });
    }

    /** Hand out the reward for a completed mission: its badge, then points (idempotent). */
    private function awardCompletion(User $user, Mission $mission): void
    {
        if ($mission->badge_id) {
            $alreadyHas = DB::table('user_badges')
                ->where('user_id', $user->id)
                ->where('badge_id', $mission->badge_id)
                ->exists();

            if (! $alreadyHas) {
                $user->badges()->attach($mission->badge_id);
            }
        }

        // Points are ALWAYS re-derived from the badges owned, never incremented
        // here.
        //
        // This code used to add missions.points_reward and THEN attach the badge
        // without counting that badge's own points, which got it wrong twice
        // over: points grew by a number that came from somewhere other than a
        // badge, while the newly attached badge's points were never counted at
        // all — so a user's total stopped matching the sum of their badges.
        //
        // points_reward is now display information only ("this mission is worth
        // N points"); MissionSeeder copies it from the badge so the two agree.
        $this->recalculatePoints($user);
    }

    /** Badge.category → required Place category name, mirrors MissionActionSeeder's mapping. */
    private const ALBUM_BADGE_CATEGORIES = [
        'Si Paling Pantai' => 'Wisata Alam',
        'Si Paling Puncak' => 'Wisata Alam',
        'Si Paling Kuliner' => 'Kuliner',
        'Si Paling Hidden Gem' => 'Hidden Gem',
        'Si Paling Budaya' => 'Wisata Budaya',
    ];

    /**
     * Real achieved count per general-badge category, computed straight from the
     * user's own albums. Three categories are not tied to one Place category and
     * are therefore counted separately:
     *
     *   Si Paling Cerita     — total photos uploaded
     *   Si Paling Penjelajah — distinct places captured, whatever the category
     *   Si Paling Trip       — albums created
     *
     * EVERY badge category must have a count here; without one its badge can
     * never be earned no matter what the seeder put in the database.
     *
     * Used both to award tiers (syncAlbumBadges) and to display accurate progress.
     */
    public function albumCategoryCounts(User $user): array
    {
        $photos = TripPhoto::whereHas('album.trip', fn ($q) => $q->where('user_id', $user->id))
            ->with('place.categories')
            ->get();

        $counts = [];
        foreach (self::ALBUM_BADGE_CATEGORIES as $badgeCategory => $placeCategory) {
            $counts[$badgeCategory] = $photos
                ->filter(fn ($photo) => $photo->place && $photo->place->categories->contains('name', $placeCategory))
                ->pluck('place_id')
                ->unique()
                ->count();
        }

        $counts['Si Paling Cerita'] = $photos->count();

        $counts['Si Paling Penjelajah'] = $photos
            ->pluck('place_id')
            ->filter()
            ->unique()
            ->count();

        $counts['Si Paling Trip'] = Album::whereHas('trip', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        return $counts;
    }

    /**
     * Auto-detect & award general (tiered) badges from the user's own albums.
     * Idempotent & safe to call after every album/photo change — only ever
     * attaches badges the achieved count already qualifies for, never revokes.
     *
     * @return Badge[] badges newly awarded by this call
     */
    public function syncAlbumBadges(User $user): array
    {
        $userDetail = UserDetail::where('user_id', $user->id)->first();
        if (! $userDetail) {
            return [];
        }

        $newlyAwarded = [];
        foreach ($this->albumCategoryCounts($user) as $category => $achievedCount) {
            $newlyAwarded = array_merge(
                $newlyAwarded,
                $this->awardEligibleTiers($user, $userDetail, $category, $achievedCount)
            );
        }

        return $newlyAwarded;
    }

    /**
     * Reset the user's total_points to the sum of ALL the badges they own, then
     * bring level_id in line.
     *
     * Badges are the single source of truth for points: every mission rewards
     * exactly what its badge is worth, so adding the badges up never
     * double-counts.
     *
     * Idempotent — safe to call repeatedly (the seeder and `badges:sync` do).
     *
     * @return int the recomputed point total
     */
    public function recalculatePoints(User $user): int
    {
        $userDetail = UserDetail::where('user_id', $user->id)->first();
        if (! $userDetail) {
            return 0;
        }

        $total = (int) DB::table('user_badges')
            ->join('badges', 'badges.id', '=', 'user_badges.badge_id')
            ->where('user_badges.user_id', $user->id)
            ->sum('badges.points');

        $userDetail->total_points = $total;
        $userDetail->level_id = Level::idForPoints($total);
        $userDetail->save();

        return $total;
    }

    /** Attach every not-yet-owned tier of $category whose tier_target the achieved count meets. */
    private function awardEligibleTiers(User $user, UserDetail $userDetail, string $category, int $achievedCount): array
    {
        $ownedBadgeIds = DB::table('user_badges')->where('user_id', $user->id)->pluck('badge_id')->all();

        $eligible = Badge::where('category', $category)
            ->where('tier_target', '<=', $achievedCount)
            ->whereNotIn('id', $ownedBadgeIds)
            ->get();

        foreach ($eligible as $badge) {
            $user->badges()->attach($badge->id);
            $userDetail->total_points += $badge->points;
        }

        if ($eligible->isNotEmpty()) {
            $userDetail->level_id = Level::idForPoints($userDetail->total_points);
            $userDetail->save();
        }

        return $eligible->all();
    }

    /**
     * The missions in progress, CLOSEST to completion first.
     *
     * Shared by the home page and the Challenge page. This query used to be
     * copied into both controllers, so the two could quietly drift apart.
     *
     * The ordering is:
     *   1. missions already started (progress > 0) first — one that has not been
     *      touched at all is not "nearly there";
     *   2. fewest steps remaining (target - progress);
     *   3. smallest target as the tiebreaker.
     *
     * The old ordering only grouped by "at least 50% done" and then sorted on
     * badge tier, which let a mission at 50% outrank one at 95%.
     *
     * @return Collection<int, object>
     */
    public function ongoingMissions(User $user, int $limit = 1)
    {
        // The SAME numbers the Badges page shows.
        //
        // Each mission mirrors one badge, but the two used to count different
        // things: a mission counted ACTIONS (user_missions.progress) while a
        // badge counted REAL DATA (photos, places, albums). For one and the same
        // "Si Paling Cerita" the home page could say 80% while the Badges page
        // said 0% — each correct by its own measure.
        //
        // Badges are computed from real data and correct themselves, so they are
        // the reference. The action counter is used only for missions that have
        // no data equivalent (the special badges).
        $counts = $this->albumCategoryCounts($user);

        $candidates = Mission::leftJoin('user_missions', function ($join) use ($user) {
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
                'badges.category as badge_category',
                'badges.tier_level',
                DB::raw('COALESCE(user_missions.progress, 0) as action_progress'),
                'missions.target'
            )
            ->get()
            ->map(function ($mission) use ($counts) {
                // A tiered badge uses the data count. A special badge (category
                // null) has no data equivalent, so it keeps the action counter.
                $mission->progress = $mission->badge_category !== null
                    && array_key_exists($mission->badge_category, $counts)
                        ? (int) $counts[$mission->badge_category]
                        : (int) $mission->action_progress;

                $mission->target = (int) $mission->target;

                $mission->percent = $mission->target > 0
                    ? min(100, (int) round(($mission->progress / $mission->target) * 100))
                    : 0;

                $mission->remaining = max(0, $mission->target - $mission->progress);

                return $mission;
            })
            // Progress already at target → not an ongoing mission. Filtered here
            // rather than in SQL because that progress is only computed above.
            ->filter(fn ($mission) => $mission->progress < $mission->target);

        return $candidates
            ->sortBy([
                // Started ones first — a mission nobody has touched is not
                // "nearly there".
                fn ($a, $b) => ($a->progress > 0 ? 0 : 1) <=> ($b->progress > 0 ? 0 : 1),
                fn ($a, $b) => $a->remaining <=> $b->remaining,
                fn ($a, $b) => $a->target <=> $b->target,
            ])
            ->take($limit)
            ->values();
    }
}
