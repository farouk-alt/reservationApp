<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetMail;
use App\Models\Employe;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $email = $request->email;

        $user = Employe::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email introuvable'], 404);
        }

        $token = Str::random(60);

        DB::table('password_resets')->updateOrInsert(
            ['email' => $email],
            ['token' => $token, 'created_at' => now()]
        );

        // FRONTEND URL
        $frontendUrl = env('FRONTEND_URL', 'http://reservation.local');

        $resetLink = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($email);

        // Send email
        Mail::to($email)->send(new PasswordResetMail($user, $resetLink));

        return response()->json(['message' => 'Lien de réinitialisation envoyé']);
    }

public function resetPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'token' => 'required',
        'password' => 'required|min:6'
    ]);

    $record = DB::table('password_resets')
        ->where('email', $request->email)
        ->where('token', $request->token)
        ->first();

    if (!$record) {
        return response()->json(['message' => 'Lien invalide'], 400);
    }

    Employe::where('email', $request->email)->update([
        'password' => bcrypt($request->password)
    ]);

    DB::table('password_resets')->where('email', $request->email)->delete();

    return response()->json(['message' => 'Mot de passe réinitialisé']);
}


}
