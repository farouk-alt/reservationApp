<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Employe extends Authenticatable
{
    use HasFactory;

    protected $table = 'employes';

    protected $fillable = [
        'nom',
        'prenom',
        'departement',
        'username',
        'password',
        'email',
    ];

    protected $hidden = ['password'];

    // 🔗 Each employee can have many reservations
    public function reservations()
{
    return $this->hasMany(Reservation::class, 'num_emp');
}

}
