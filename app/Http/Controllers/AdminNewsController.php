<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;

class AdminNewsController extends Controller
{
    /**
     * Every image upload goes through this service so size, format and file
     * naming stay consistent across the application.
     */
    public function __construct(
        private readonly ImageCompressionService $images,
    ) {}

    /**
     * Display a listing of the news for admin dashboard.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = News::with('user.userDetails');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $news = $query->orderBy('publish_date', 'desc')
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/News/Index', [
            'news' => $news,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new news article.
     */
    public function create()
    {
        return inertia('Admin/News/Create');
    }

    /**
     * Store a newly created news article in database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'publish_date' => 'required|date',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $filename = $this->images->compressToPublic(
                $request->file('thumbnail'),
                public_path('images/news'),
                maxWidth: 1200,
            );

            $thumbnailPath = '/images/news/'.$filename;
        }

        News::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'content' => $request->content,
            'publish_date' => $request->publish_date,
            'thumbnail' => $thumbnailPath,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Wawasan wisata berhasil ditambahkan!');

        return redirect()->route('admin.news.index');
    }

    /**
     * Show the form for editing the specified news article.
     */
    public function edit(News $news)
    {
        return inertia('Admin/News/Edit', [
            'newsItem' => $news,
        ]);
    }

    /**
     * Update the specified news article in database.
     */
    public function update(Request $request, News $news)
    {
        $newsItem = $news;

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'publish_date' => 'required|date',
            'thumbnail' => 'nullable',
        ]);

        if ($request->hasFile('thumbnail')) {
            $request->validate([
                'thumbnail' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);
        }

        $thumbnailPath = $newsItem->thumbnail;

        // If explicitly requested to remove current thumbnail
        if ($request->boolean('remove_thumbnail')) {
            if ($newsItem->thumbnail && file_exists(public_path($newsItem->thumbnail))) {
                if (str_starts_with($newsItem->thumbnail, '/images/news/')) {
                    @unlink(public_path($newsItem->thumbnail));
                }
            }
            $thumbnailPath = null;
        }

        if ($request->hasFile('thumbnail')) {
            // Delete old file if it was custom uploaded (and not already deleted above)
            if (! $request->boolean('remove_thumbnail') && $newsItem->thumbnail && file_exists(public_path($newsItem->thumbnail))) {
                if (str_starts_with($newsItem->thumbnail, '/images/news/')) {
                    @unlink(public_path($newsItem->thumbnail));
                }
            }

            $filename = $this->images->compressToPublic(
                $request->file('thumbnail'),
                public_path('images/news'),
                maxWidth: 1200,
            );

            $thumbnailPath = '/images/news/'.$filename;
        }

        $newsItem->update([
            'title' => $request->title,
            'content' => $request->content,
            'publish_date' => $request->publish_date,
            'thumbnail' => $thumbnailPath,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Wawasan wisata berhasil diperbarui!');

        return redirect()->route('admin.news.index');
    }

    /**
     * Remove the specified news article from database.
     */
    public function destroy(News $news)
    {
        $newsItem = $news;

        // Delete thumbnail file if it exists
        if ($newsItem->thumbnail && file_exists(public_path($newsItem->thumbnail))) {
            if (str_starts_with($newsItem->thumbnail, '/images/news/')) {
                @unlink(public_path($newsItem->thumbnail));
            }
        }

        $newsItem->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Wawasan wisata berhasil dihapus!');

        return redirect()->route('admin.news.index');
    }
}
