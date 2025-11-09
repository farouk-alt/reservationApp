<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Salle extends Model
{
     use HasFactory;

protected $fillable = [
    'type',
    'code',
    'capacite',
    'statut',
];
public function reservations()
{
    return $this->hasMany(Reservation::class, 'num_salle');
}

}
