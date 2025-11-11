<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class EmployeAuthController extends Controller
{
    public function login(Request $request)
{
    $request->validate(['login' => 'required', 'password' => 'required']);
    $login = $request->login;

    $employe = Employe::where('username', $login)
        ->orWhere('email', $login)
        ->first();

    if (! $employe || ! Hash::check($request->password, $employe->password)) {
        throw ValidationException::withMessages(['login' => ['Identifiants invalides.']]);
    }

    $token = $employe->createToken('employe_token')->plainTextToken;

    return response()->json([
        'message' => '✅ Employé connecté avec succès',
        'employe' => $employe,
        'role'    => 'employe',
        'token'   => $token,
    ]);
}


    public function logout(Request $request): JsonResponse
        {
            $request->user()->tokens()->delete();

            return response()->json([
                'message' => 'Déconnexion réussie',
            ]);
        }
    public function profile(Request $request): JsonResponse
    {
        return response()->json(data: $request->user());
    }

public function register(Request $request): JsonResponse
{
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'departement' => 'required|string|max:255',
        'username' => 'required|string|max:255|unique:employes,username',
        'email' => 'required|email|max:255|unique:employes,email',
        'password' => 'required|string|min:6',
    ]);

    // 🔒 Hash password
    $validated['password'] = Hash::make($validated['password']);

    // 👷‍♂️ Create employee
    $employe = Employe::create($validated);

    // 🎟️ Generate token instantly
    $token = $employe->createToken('employe_token')->plainTextToken;

    // ✅ Return everything needed for auto-login
    return response()->json([
        'message' => '✅ Compte créé et connecté avec succès',
        'employe' => $employe,
        'role'    => 'employe',
        'token'   => $token,
    ]);
}


}
