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
        Schema::create('donation_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blood_donor_id')->constrained('blood_donors')->cascadeOnDelete();
            $table->foreignId('blood_request_id')->nullable()->constrained('blood_requests')->nullOnDelete();
            $table->date('donation_date');
            $table->unsignedSmallInteger('units')->default(1);
            $table->string('hospital_location')->default('Human Aid Hospital Main Blood Center');
            $table->decimal('hemoglobin_level', 4, 1)->nullable();
            $table->string('blood_pressure', 20)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donation_records');
    }
};
