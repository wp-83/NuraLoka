<?php

namespace App\Http\Controllers;

class ChallengeController extends Controller
{
    public function index()
    {
        return inertia('Challenge/Index');
    }
}
