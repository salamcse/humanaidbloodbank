<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodDonor extends Model
{
    protected $fillable = [
        'donor_code',
        'name',
        'blood_group',
        'gender',
        'age',
        'weight',
        'phone',
        'email',
        'district',
        'area',
        'address',
        'last_donated_at',
        'is_available',
        'total_donations',
        'health_status',
        'notes',
    ];

    protected $casts = [
        'last_donated_at' => 'date',
        'is_available' => 'boolean',
        'age' => 'integer',
        'weight' => 'integer',
        'total_donations' => 'integer',
    ];

    protected $appends = [
        'is_eligible',
        'days_until_eligible',
    ];

    public function donationRecords()
    {
        return $this->hasMany(DonationRecord::class);
    }

    public function requests()
    {
        return $this->hasMany(BloodRequest::class, 'matched_donor_id');
    }

    public function getIsEligibleAttribute(): bool
    {
        if (! $this->is_available) {
            return false;
        }
        if (! $this->last_donated_at) {
            return true;
        }

        return $this->last_donated_at->diffInDays(now()) >= 90;
    }

    public function getDaysUntilEligibleAttribute(): int
    {
        if (! $this->last_donated_at) {
            return 0;
        }
        $daysSince = $this->last_donated_at->diffInDays(now());

        return $daysSince >= 90 ? 0 : (90 - $daysSince);
    }
}
