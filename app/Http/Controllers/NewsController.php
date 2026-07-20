<?php

namespace App\Http\Controllers;

use App\Models\News;
use Inertia\Inertia;

class NewsController extends Controller
{
    /**
     * Display a listing of the news.
     */
    public function index()
    {
        $news = News::with('user.userDetail')
            ->orderBy('publish_date', 'desc')
            ->paginate(6);

        return Inertia::render('News/Index', [
            'news' => $news,
        ]);
    }

    /**
     * Display the specified news article.
     */
    public function show(News $news)
    {
        return Inertia::render('News/Show', [
            'newsItem' => $news,
        ]);
    }
}
