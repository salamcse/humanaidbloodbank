<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationRecord extends Model
{
    protected $fillable = [
        'blood_donor_id',
        'blood_request_id',
        'donation_date',
        'units',
        'hospital_location',
        'hemoglobin_level',
        'blood_pressure',
        'notes',
    ];

    protected $casts = [
        'donation_date' => 'date',
        'units' => 'integer',
        'hemoglobin_level' => 'float',
    ];

    public function donor()
    {
        return $this->belongsTo(BloodDonor::class, 'blood_donor_id');
    }

    public function request()
    {
        return $this->belongsTo(BloodRequest::class, 'blood_request_id');
    }
}
