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
    Schema::table('reservations', function (Blueprint $table) {
        if (Schema::hasColumn('reservations', 'duree')) {
            $table->dropColumn('duree');
        }
    });
}

public function down()
{
    Schema::table('reservations', function (Blueprint $table) {
        $table->integer('duree')->nullable(); // optional rollback
    });
}

};
