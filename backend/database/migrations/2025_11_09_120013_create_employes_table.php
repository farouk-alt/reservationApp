<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('employes', function (Blueprint $table) {
        $table->id(); // Primary Key
        $table->string('nom', 55);
        $table->string('prenom', 55);
        $table->string('departement', 55);
        $table->string('username', 55)->unique();
        $table->string('password', 255);
        $table->string('email', 55)->unique();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employes');
    }
};
