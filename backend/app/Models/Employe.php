<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employe extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'employes';

    protected $fillable = [
        'nom',
        'prenom',
        'departement',
        'username',
        'password',
        'email',
    ];

        protected $hidden = [
            'password',
            'remember_token',
            'created_at',
            'updated_at',
            'id'
        ];


    // 🔗 Each employee can have many reservations
    public function reservations()
{
    return $this->hasMany(Reservation::class, 'num_emp');
}

}
