<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blood_inventories', function (Blueprint $table) {
            $table->id();
            $table->string('blood_group', 5)->unique();
            $table->unsignedInteger('units_available')->default(0);
            $table->unsignedInteger('safe_threshold')->default(15);
            $table->unsignedInteger('critical_threshold')->default(5);
            $table->unsignedInteger('expiry_risk_units')->default(0);
            $table->timestamp('last_restocked_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_inventories');
    }
};
