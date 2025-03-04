<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    protected $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ]);
    }

    /**
     * Upload an image to Cloudinary
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return string
     */
    public function uploadImage(UploadedFile $file, string $folder = 'users'): string
    {
        $response = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder' => $folder,
                'resource_type' => 'image',
            ]
        );

        return $response['secure_url'] ?? '';
    }

    /**
     * Delete an image from Cloudinary
     *
     * @param string $publicId
     * @return void
     */
    public function deleteImage(string $publicId): void
    {
        $this->cloudinary->uploadApi()->destroy($publicId);
    }
}