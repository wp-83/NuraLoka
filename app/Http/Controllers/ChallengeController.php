<?php

namespace App\Http\Controllers;

class ChallengeController extends Controller
{
    public function index()
    {
        return inertia('Challenge/Index');
    }

    public function badges()
    {
        return inertia('Challenge/Badges');
    }

    public function leaderboard()
    {
        return inertia('Challenge/LeaderboardFull');
    }

    public function levels()
    {
        return inertia('Challenge/Levels');
    }
}
