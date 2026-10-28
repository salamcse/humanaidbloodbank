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
        Schema::create('blood_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code')->unique();
            $table->string('patient_name');
            $table->string('hospital_name')->default('Human Aid Hospital');
            $table->string('hospital_ward_bed')->nullable();
            $table->string('blood_group', 5)->index();
            $table->unsignedSmallInteger('units_needed')->default(1);
            $table->unsignedSmallInteger('units_received')->default(0);
            $table->string('urgency', 50)->default('Critical Immediate')->index();
            $table->string('contact_person');
            $table->string('contact_phone', 30)->index();
            $table->string('medical_reason');
            $table->string('status', 30)->default('Active')->index();
            $table->foreignId('matched_donor_id')->nullable()->constrained('blood_donors')->nullOnDelete();
            $table->text('additional_instructions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blood_requests');
    }
};
