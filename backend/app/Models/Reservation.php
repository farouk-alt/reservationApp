<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Reservation extends Model
{
     use HasFactory;

    protected $fillable = [
        'num_emp',
        'num_salle',
        'date_res',
        'heure_res',
        'duree_minutes',
        'statut',
    ];

    // 🔗 Relations
    public function employe()
    {
        return $this->belongsTo(Employe::class, 'num_emp');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class, 'num_salle');
    }
}
