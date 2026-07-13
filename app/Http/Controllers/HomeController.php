<?php

namespace App\Http\Controllers;

use App\Models\News;

class HomeController extends Controller
{
    public function index()
    {
        $latestNews = News::with('user.userDetails')
            ->orderBy('publish_date', 'desc')
            ->take(3)
            ->get();

        return inertia('Home/Index', [
            'latestNews' => $latestNews,
        ]);
    }
}
