<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodRequest extends Model
{
    protected $fillable = [
        'request_code',
        'patient_name',
        'hospital_name',
        'hospital_ward_bed',
        'blood_group',
        'units_needed',
        'units_received',
        'urgency',
        'contact_person',
        'contact_phone',
        'medical_reason',
        'status',
        'matched_donor_id',
        'additional_instructions',
    ];

    protected $casts = [
        'units_needed' => 'integer',
        'units_received' => 'integer',
    ];

    public function matchedDonor()
    {
        return $this->belongsTo(BloodDonor::class, 'matched_donor_id');
    }

    public function donationRecords()
    {
        return $this->hasMany(DonationRecord::class);
    }
}
