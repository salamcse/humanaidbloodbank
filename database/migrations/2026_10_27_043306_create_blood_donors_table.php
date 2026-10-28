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
        Schema::create('blood_donors', function (Blueprint $table) {
            $table->id();
            $table->string('donor_code')->unique();
            $table->string('name');
            $table->string('blood_group', 5)->index();
            $table->string('gender', 20)->default('Male');
            $table->unsignedSmallInteger('age');
            $table->unsignedSmallInteger('weight')->nullable();
            $table->string('phone', 30)->index();
            $table->string('email')->nullable();
            $table->string('district', 100)->default('Dhaka');
            $table->string('area', 100)->index();
            $table->text('address')->nullable();
            $table->date('last_donated_at')->nullable();
            $table->boolean('is_available')->default(true)->index();
            $table->unsignedInteger('total_donations')->default(0);
            $table->string('health_status', 50)->default('Eligible');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_donors');
    }
};
