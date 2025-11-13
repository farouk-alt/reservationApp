<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeUserMail;
class EmployeAuthController extends Controller
{
    // 🟢 LOGIN
    public function login(Request $request)
    {
        $request->validate(['login' => 'required', 'password' => 'required']);
        $login = $request->login;

        $employe = Employe::where('username', $login)
            ->orWhere('email', $login)
            ->first();

        if (! $employe || ! Hash::check($request->password, $employe->password)) {
            throw ValidationException::withMessages([
                'login' => ['Identifiants invalides.']
            ]);
        }

        $token = $employe->createToken('employe_token')->plainTextToken;

        return response()->json([
            'message' => '✅ Employé connecté avec succès',
            'employe' => $employe->only(['id','nom','prenom','departement','username','email']),
            'role'    => 'employe',
            'token'   => $token,
        ]);
    }

    // 🔴 LOGOUT
    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    // 👤 PROFILE INFO
    public function profile(Request $request)
    {
        $employe = $request->user();

        $filtered = $employe->only([
            'nom',
            'prenom',
            'departement',
            'username',
            'email',
        ]);

        return response()->json($filtered);
    }

    // 🧾 UPDATE PROFILE
    public function updateProfile(Request $request): JsonResponse
    {
        $employe = $request->user();

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'departement' => 'required|string|max:255',
        ]);

        $employe->update($validated);

        return response()->json([
            'message' => '✅ Profil mis à jour avec succès',
            'employe' => $employe->only(['id','nom','prenom','departement','username','email']),
        ]);
    }

    // 🔒 UPDATE PASSWORD
    public function updatePassword(Request $request): JsonResponse
    {
        $employe = $request->user();

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $employe->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => '✅ Mot de passe mis à jour avec succès']);
    }

    // 🆕 REGISTER
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

        $validated['password'] = Hash::make($validated['password']);
        $employe = Employe::create($validated);
        $token = $employe->createToken('employe_token')->plainTextToken;
        Mail::to($employe->email)->send(new WelcomeUserMail($employe));

        return response()->json([
            'message' => '✅ Compte créé et connecté avec succès',
            'employe' => $employe->only(['id','nom','prenom','departement','username','email']),
            'role'    => 'employe',
            'token'   => $token,
        ]);
    }
}
