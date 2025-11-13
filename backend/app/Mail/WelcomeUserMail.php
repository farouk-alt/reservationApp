<?php

namespace App\Mail;

use App\Models\Employe; // ou User
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public $employe;

    public function __construct(Employe $employe)
    {
        $this->employe = $employe;
    }

    public function build()
    {
        return $this->subject('Bienvenue sur ReservationApp')
                    ->view('emails.welcome');
    }
}

