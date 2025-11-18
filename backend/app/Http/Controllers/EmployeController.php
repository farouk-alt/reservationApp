<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeController extends Controller
{
    public function index()
    {
        return Employe::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:55',
            'prenom' => 'required|string|max:55',
            'departement' => 'required|string|max:55',
            'username' => 'required|string|max:55|unique:employes',
            'password' => 'required|string|min:6',
            'email' => 'required|email|unique:employes',
        ]);

        $data['password'] = Hash::make($data['password']);
        $employe = Employe::create($data);

        return response()->json($employe, 201);
    }

    public function show(Employe $employe)
    {
        return response()->json($employe);
    }

    public function update(Request $request, Employe $employe)
{
    $validated = $request->validate([
        'nom' => 'sometimes|string|max:55',
        'prenom' => 'sometimes|string|max:55',
        'departement' => 'sometimes|string|max:55',
        'username' => 'sometimes|string|max:55|unique:employes,username,' . $employe->id,
        'password' => 'sometimes|string|min:6',
        'email' => 'sometimes|email|unique:employes,email,' . $employe->id,
    ]);

    if (isset($validated['password'])) {
        $validated['password'] = Hash::make($validated['password']);
    }

    $employe->update($validated);

    return response()->json($employe, 200);
}


    public function destroy(Employe $employe)
    {
        $employe->delete();
        return response()->json(['message' => 'Employé supprimé avec succès'], 200);
    }
}
