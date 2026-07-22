<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * The profile data hanging off a user account: display name, province, and the
 * gamification totals (points and the level they buy).
 */
class UserDetail extends Model
{
    use HasFactory;

    protected $guarded = [
        'id',
    ];

    /**
     * THE leaderboard ordering: most points first, and the row id settles ties.
     *
     * Every place that ranks users must sort by this, otherwise two queries can
     * order tied users differently and someone shown third in a list is told
     * they are #4.
     */
    public function scopeByRank(Builder $query): Builder
    {
        return $query->orderByDesc('total_points')->orderBy('id');
    }

    /**
     * The 1-based position of one profile on the global leaderboard.
     *
     * Counts the rows that outrank it rather than loading the whole table, and
     * applies the same tiebreaker as scopeByRank(). The profile page used to
     * break ties on fullname instead, so the rank printed there could contradict
     * the leaderboard for users on equal points.
     */
    public static function rankOf(self $detail): int
    {
        return static::query()
            ->where(function (Builder $query) use ($detail) {
                $query->where('total_points', '>', $detail->total_points)
                    ->orWhere(function (Builder $tie) use ($detail) {
                        $tie->where('total_points', $detail->total_points)
                            ->where('id', '<', $detail->id);
                    });
            })
            ->count() + 1;
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function level()
    {
        return $this->belongsTo(Level::class);
    }
}
