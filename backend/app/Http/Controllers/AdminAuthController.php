<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class AdminAuthController extends Controller
{
    // 🔐 Login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $admin = User::where('email', $request->email)->first();

        if (! $admin || ! Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.']
            ]);
        }

        $token = $admin->createToken('admin_token')->plainTextToken;

        return response()->json([
            'message' => '✅ Admin connecté avec succès',
            'admin'   => $admin->only(['nom', 'email']),
            'role'    => 'admin',
            'token'   => $token,
        ]);
    }

    // 🚪 Logout
    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Déconnexion réussie ✅']);
    }

    // 👤 Get Profile
    public function profile(Request $request): JsonResponse
    {
        $admin = $request->user();

        // Return only safe fields
        return response()->json($admin->only(['nom', 'email']));
    }

    // ✏️ Update Name
    public function updateProfile(Request $request): JsonResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
        ]);

        $admin->update(['nom' => $validated['nom']]);

        return response()->json([
            'message' => '✅ Nom mis à jour avec succès',
            'admin' => $admin->only(['nom', 'email']),
        ]);
    }

    // 🔒 Update Password
    public function updatePassword(Request $request): JsonResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $admin->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => '✅ Mot de passe mis à jour avec succès']);
    }
}
