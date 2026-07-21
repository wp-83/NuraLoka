<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\GamificationService;
use Illuminate\Console\Command;

class SyncUserBadges extends Command
{
    protected $signature = 'badges:sync {user? : Username to sync; omit to sync every user}';

    protected $description = 'Recompute general (tiered) badges from each user\'s album photos, awarding any newly-qualified tier, then resync total_points to the badges owned.';

    public function handle(GamificationService $gamification): int
    {
        $users = $this->argument('user')
            ? User::where('username', $this->argument('user'))->get()
            : User::query()->get();

        if ($users->isEmpty()) {
            $this->warn('No matching user found.');

            return self::FAILURE;
        }

        $totalAwarded = 0;
        foreach ($users as $user) {
            $awarded = $gamification->syncAlbumBadges($user);
            $points = $gamification->recalculatePoints($user);
            if (! empty($awarded)) {
                $this->info($user->username.': +'.count($awarded).' badge(s) — '.collect($awarded)->pluck('name')->implode(', ').' → '.$points.' pts');
            }
            $totalAwarded += count($awarded);
        }

        $this->info("Done. {$totalAwarded} badge(s) newly awarded across {$users->count()} user(s).");

        return self::SUCCESS;
    }
}
