<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class AdminAuthController extends Controller
{
public function login(Request $request)
{
    $request->validate(['email' => 'required', 'password' => 'required']);
    $admin = User::where('email', $request->email)->first();

    if (! $admin || ! Hash::check($request->password, $admin->password)) {
        throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
    }

    $token = $admin->createToken('admin_token')->plainTextToken;

    return response()->json([
        'message' => '✅ Admin connecté avec succès',
        'admin'   => $admin,
        'role'    => 'admin',
        'token'   => $token,
    ]);
}


    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Admin logged out ✅']);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}
