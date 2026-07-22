<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

/**
 * Resize and re-encode uploaded images to WebP before they are persisted,
 * the same way AlbumController already compresses trip photos. Centralizing
 * it here keeps every upload spot (badges, categories, news, places, profile
 * photos, albums) consistent instead of re-implementing the same GD pipeline.
 */
class ImageCompressionService
{
    /**
     * Compress an uploaded image and store it on a Storage disk (e.g. 'public').
     * Returns the relative disk path (e.g. "album-photos/xxx.webp").
     */
    public function compressToDisk(
        UploadedFile $file,
        string $directory,
        string $disk = 'public',
        int $maxWidth = 1200,
        ?int $maxHeight = null,
        int $quality = 80,
    ): string {
        $dir = trim($directory, '/');

        // SVG uploads are vector graphics that GD cannot rasterize, so the raw
        // bytes are stored untouched rather than run through the WebP pipeline.
        if (strtolower($file->getClientOriginalExtension()) === 'svg') {
            $path = $dir.'/'.uniqid('img_', true).'.svg';
            Storage::disk($disk)->put($path, (string) file_get_contents($file->getPathname()));

            return $path;
        }

        $encoded = $this->encode($file, $maxWidth, $maxHeight, $quality);

        $path = $dir.'/'.uniqid('img_', true).'.webp';

        Storage::disk($disk)->put($path, $encoded);

        return $path;
    }

    /**
     * Delete a previously stored upload from a Storage disk. Legacy/seeded public
     * assets (absolute URLs, "/…" web paths, or bundled "images/…" files) are left
     * untouched — only files written to the disk by compressToDisk() are removed.
     */
    public function deleteFromDisk(?string $path, string $disk = 'public'): void
    {
        if (! $path
            || str_starts_with($path, 'http')
            || str_starts_with($path, '/')
            || str_starts_with($path, 'images/')) {
            return;
        }

        Storage::disk($disk)->delete($path);
    }

    /**
     * Compress an uploaded image and store it directly under the public/ folder
     * (used by admin sections that historically serve icons as plain public assets
     * instead of the storage symlink). Returns just the generated filename.
     *
     * SVG uploads are vector graphics that GD cannot rasterize, so they are moved
     * through untouched rather than run through the compression pipeline.
     */
    public function compressToPublic(
        UploadedFile $file,
        string $destinationDir,
        int $maxWidth = 800,
        ?int $maxHeight = null,
        int $quality = 80,
    ): string {
        if (! is_dir($destinationDir)) {
            mkdir($destinationDir, 0755, true);
        }

        if (strtolower($file->getClientOriginalExtension()) === 'svg') {
            $filename = uniqid('img_', true).'.svg';
            $file->move($destinationDir, $filename);

            return $filename;
        }

        $encoded = $this->encode($file, $maxWidth, $maxHeight, $quality);
        $filename = uniqid('img_', true).'.webp';

        file_put_contents($destinationDir.'/'.$filename, $encoded);

        return $filename;
    }

    /** Decode, scale down (optionally bounded on both axes), and encode the file to WebP bytes. */
    private function encode(UploadedFile $file, int $maxWidth, ?int $maxHeight, int $quality): string
    {
        $manager = new ImageManager(new Driver);
        $image = $manager->decodePath($file->getPathname());
        $image->scaleDown(width: $maxWidth, height: $maxHeight);

        return $image->encodeUsingFileExtension('webp', quality: $quality)->toString();
    }
}
