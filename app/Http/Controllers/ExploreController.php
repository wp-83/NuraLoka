<?php

namespace App\Http\Controllers;

class ExploreController extends Controller
{
    public function index()
    {
        return inertia('Explore/Index');
    }
}
