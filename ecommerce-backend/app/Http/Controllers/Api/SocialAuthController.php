<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     *
     * @param string $provider
     * @return \Illuminate\Http\JsonResponse
     */
    public function redirectToProvider($provider)
    {
        try {
            $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
            return response()->json(['url' => $url]);
        } catch (Exception $e) {
            Log::error('Social login redirect error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to connect with ' . $provider], 500);
        }
    }

/**
 * Handle provider callback and authenticate the user.
 *
 * @param Request $request
 * @param string $provider
 * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
 */
public function handleProviderCallback(Request $request, $provider)
{
    try {
        // Get user data from provider
        $socialUser = Socialite::driver($provider)->stateless()->user();

        // Find or create user
        $user = $this->findOrCreateUser($socialUser, $provider);

        // Generate JWT token
        $token = Auth::login($user);

        // Set the JWT in an HTTP-only cookie - THIS IS THE KEY PART
        $cookie = cookie(
            'jwt',
            $token,
            config('jwt.ttl', 60), // in minutes
            '/',
            null,
            false, // secure only in production, false for local
            true,  // httpOnly
            false,
            'lax'  // SameSite policy
        );

        // Ensure frontend URL is set in .env
        $frontendUrl = config('app.frontend_url', 'http://localhost:4200');

        // Prepare success redirect with token
        $redirectUrl = $frontendUrl . '/auth/social-callback?token=' . $token;

        // Redirect to frontend with token AND cookie
        return redirect()->away($redirectUrl)->withCookie($cookie);

    } catch (Exception $e) {
        Log::error('Social login callback error: ' . $e->getMessage());

        // Ensure frontend URL is set
        $frontendUrl = config('app.frontend_url', 'http://localhost:4200');

        // Redirect to frontend with error
        $errorUrl = $frontendUrl . '/auth/social-callback?error=' . urlencode('Authentication failed: ' . $e->getMessage());
        return redirect()->away($errorUrl);
    }
}

    /**
     * Process social token from frontend and authenticate the user.
     *
     * @param Request $request
     * @param string $provider
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleSocialToken(Request $request, $provider)
    {
        try {
            $validator = validator($request->all(), [
                'access_token' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Get user from access token
            $socialUser = Socialite::driver($provider)->userFromToken($request->access_token);

            // Find or create user
            $user = $this->findOrCreateUser($socialUser, $provider);

            // Login and generate JWT
            $token = Auth::login($user);

            // Return user and token
            return $this->respondWithToken($token, $user, 'Social login successful');

        } catch (Exception $e) {
            Log::error('Social token handling error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to authenticate with ' . $provider], 401);
        }
    }

    /**
     * Find or create a user based on social provider information.
     *
     * @param \Laravel\Socialite\Contracts\User $socialUser
     * @param string $provider
     * @return User
     */
    protected function findOrCreateUser($socialUser, $provider)
    {
        // Check if user already exists with this social account
        $user = User::where('provider', $provider)
                    ->where('provider_id', $socialUser->getId())
                    ->first();

        if ($user) {
            return $user;
        }

        // Check if user exists with the same email
        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // Update existing user with provider info
            $user->update([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar()
            ]);

            return $user;
        }

        // Create new user
        return User::create([
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'avatar' => $socialUser->getAvatar(),
            'email_verified_at' => now(), // Social login users are pre-verified
            'password' => null, // No password for social users
        ]);
    }

    /**
     * Get the token array structure.
     *
     * @param string $token
     * @param User $user
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token, $user, $message)
    {
        // Set the JWT in an HTTP-only cookie
        $cookie = cookie(
            'jwt',
            $token,
            config('jwt.ttl', 60), // in minutes
            '/',
            null,
            config('app.env') === 'production', // secure only in production
            true, // httpOnly
            false,
            'strict'
        );

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl', 60) * 60,
            'user' => [
                'id' => $user->getEncryptedId(),
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'image' => $user->avatar ?? $user->image,
                'provider' => $user->provider
            ],
            'message' => $message,
        ])->withCookie($cookie);
    }
}
