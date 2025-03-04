<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use App\Services\EmailValidationService;

class AuthController extends Controller
{
    protected $cloudinaryService;

    public function __construct(CloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

/**
 * Register a new user.
 *
 * @param Request $request
 * @return \Illuminate\Http\JsonResponse
 */
public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => [
            'required',
            'confirmed',
            Password::min(8)
                ->letters()
                ->mixedCase()
                ->numbers()
                ->symbols()
        ],
        'image' => 'nullable|image|max:2048',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    // Validate email with Abstract API
    $emailValidationService = app(EmailValidationService::class);
    $emailValidation = $emailValidationService->validate($request->email);

    if (!$emailValidation['is_valid']) {
        return response()->json([
            'errors' => [
                'email' => [$emailValidation['message']]
            ]
        ], 422);
    }

    $imageUrl = null;
    if ($request->hasFile('image')) {
        $imageUrl = $this->cloudinaryService->uploadImage($request->file('image'));
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'image' => $imageUrl,
        'role' => 'user', // Default role is user
    ]);

    // Don't generate token or log in the user
    // Instead, just return a success message
    return response()->json([
        'message' => 'Registration successful. Please login with your credentials.',
        'user' => [
            'email' => $user->email,
        ]
    ], 201); // 201 Created status code
}

    /**
     * Log the user in and return a JWT.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = Auth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        return $this->respondWithToken($token);
    }

   /**
 * Get the authenticated user.
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function me()
{
    try {
        // Try to get user from Auth facade
        $user = Auth::user();

        // If no user, try to get from bearer token directly
        if (!$user && $token = request()->bearerToken()) {
            try {
                // Manually verify and decode the token
                $user = auth('api')->setToken($token)->authenticate();
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Invalid token',
                    'message' => $e->getMessage()
                ], 401);
            }
        }

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        return response()->json($user);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Error retrieving user',
            'message' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Log the user out (invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        Auth::logout();

        // Also clear the cookie
        $cookie = cookie('jwt', '', -1, '/', null, false, true, false, 'strict');

        return response()->json(['message' => 'Successfully logged out'])->withCookie($cookie);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(Auth::refresh());
    }

   /**
 * Get the token array structure.
 *
 * @param string $token
 * @param User|null $user
 * @param string $message Custom message for the response
 * @return \Illuminate\Http\JsonResponse
 */
protected function respondWithToken($token, $user = null, $message = 'Login successful')
{
    if (!$user) {
        $user = Auth::user();
    }

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
        'user' => [
            'id' => $user->getEncryptedId(),
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'image' => $user->image,
        ],
        'message' => $message,
    ])->withCookie($cookie);
}
}
