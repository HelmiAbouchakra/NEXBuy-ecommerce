<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Test route
Route::get('/test-cors', function() {
    return response()->json([
        'message' => 'CORS is working!',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Social authentication routes - MOVED OUTSIDE auth middleware!
Route::prefix('auth')->group(function() {
    // Routes for redirect flow (browser-based)
    Route::get('{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
    Route::get('{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

    // Route for token-based flow (mobile/SPA)
    Route::post('{provider}/token', [SocialAuthController::class, 'handleSocialToken']);
});

// Protected routes - middleware is applied at the route level in Laravel 11
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Admin-only routes will go here
        Route::get('/dashboard', function() {
            return response()->json(['message' => 'Admin dashboard']);
        });
    });
});
