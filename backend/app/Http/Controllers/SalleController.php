<?php
namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;

class SalleController extends Controller
{
    // GET /api/salles
    public function index()
    {
        return Salle::all();
    }

    // GET /api/salles/{id}
    public function show($id)
    {
        return Salle::findOrFail($id);
    }

    // POST /api/salles
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:50',
             'code' => 'required|string|unique:salles,code',
            'capacite' => 'required|integer|min:1',
            'statut' => 'nullable|string',
        ]);

        $salle = Salle::create($validated);
        return response()->json($salle, 201);
    }

    // PUT /api/salles/{id}
    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|string|max:50',
            'code' => 'required|unique:salles,code,' . $id,
            'capacite' => 'sometimes|integer|min:1',
            'statut' => 'nullable|string',
        ]);

        $salle->update($validated);
        return response()->json($salle);
    }

    // DELETE /api/salles/{id}
    public function destroy($id)
    {
        $salle = Salle::findOrFail($id);
        $salle->delete();

        return response()->json(['message' => 'Salle supprimée avec succès']);
    }
}
