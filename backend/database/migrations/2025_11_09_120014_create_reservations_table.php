<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id('id');
            $table->foreignId('num_emp')->constrained('employes')->onDelete('cascade');
            $table->foreignId('num_salle')->constrained('salles')->onDelete('cascade');
            $table->date('date_res');
            $table->time('heure_res');
            $table->integer('duree_minutes');
            $table->string('statut', 55)->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};

