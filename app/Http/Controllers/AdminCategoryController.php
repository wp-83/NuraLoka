<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    /**
     * Every image upload goes through this service so size, format and file
     * naming stay consistent across the application.
     */
    public function __construct(
        private readonly ImageCompressionService $images,
    ) {}

    /**
     * Display a listing of categories for admin dashboard.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Category::withCount('places');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Category/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        return inertia('Admin/Category/Create');
    }

    /**
     * Store a newly created category in database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'icon_path' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
        ]);

        $iconPath = null;
        if ($request->hasFile('icon_path')) {
            $iconPath = $this->images->compressToDisk(
                $request->file('icon_path'),
                'category-icons',
                maxWidth: 800,
            );
        }

        Category::create([
            'name' => $request->name,
            'icon_path' => $iconPath,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Kategori berhasil ditambahkan!');

        return redirect()->route('admin.categories.index');
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category)
    {
        return inertia('Admin/Category/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified category in database.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$category->id,
            'icon_path' => 'nullable',
            'remove_icon' => 'nullable|boolean',
        ]);

        if ($request->hasFile('icon_path')) {
            $request->validate([
                'icon_path' => 'image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
            ]);
        }

        $iconPath = $category->icon_path;

        // Remove current icon if explicitly requested
        if ($request->boolean('remove_icon')) {
            $this->images->deleteFromDisk($category->icon_path);
            $iconPath = null;
        }

        // Upload new icon
        if ($request->hasFile('icon_path')) {
            // Delete old icon if not already deleted
            if (! $request->boolean('remove_icon')) {
                $this->images->deleteFromDisk($category->icon_path);
            }

            $iconPath = $this->images->compressToDisk(
                $request->file('icon_path'),
                'category-icons',
                maxWidth: 800,
            );
        }

        $category->update([
            'name' => $request->name,
            'icon_path' => $iconPath,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Kategori berhasil diperbarui!');

        return redirect()->route('admin.categories.index');
    }

    /**
     * Remove the specified category from database.
     */
    public function destroy(Category $category)
    {
        $category->loadCount('places');

        if ($category->places_count > 0) {
            session()->flash('flash.type', 'error');
            session()->flash('flash.message', 'Kategori tidak dapat dihapus karena masih digunakan oleh '.$category->places_count.' destinasi.');

            return redirect()->route('admin.categories.index');
        }

        // Delete icon file if exists
        $this->images->deleteFromDisk($category->icon_path);

        $category->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Kategori berhasil dihapus!');

        return redirect()->route('admin.categories.index');
    }
}
