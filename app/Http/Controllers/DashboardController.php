<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\News;
use App\Models\Place;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $totalNews = News::count();
        $totalUsers = User::count();
        $totalPlaces = Place::count();
        $totalCategories = Category::count();

        return inertia('Admin/Dashboard', [
            'stats' => [
                'totalNews' => $totalNews,
                'totalUsers' => $totalUsers,
                'totalPlaces' => $totalPlaces,
                'totalCategories' => $totalCategories,
            ],
        ]);
    }
}
