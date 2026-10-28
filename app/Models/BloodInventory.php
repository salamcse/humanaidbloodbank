<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodInventory extends Model
{
    protected $fillable = [
        'blood_group',
        'units_available',
        'safe_threshold',
        'critical_threshold',
        'expiry_risk_units',
        'last_restocked_at',
    ];

    protected $casts = [
        'units_available' => 'integer',
        'safe_threshold' => 'integer',
        'critical_threshold' => 'integer',
        'expiry_risk_units' => 'integer',
        'last_restocked_at' => 'datetime',
    ];

    protected $appends = [
        'stock_status',
    ];

    public function getStockStatusAttribute(): string
    {
        if ($this->units_available <= $this->critical_threshold) {
            return 'Critical';
        }
        if ($this->units_available < $this->safe_threshold) {
            return 'Low';
        }

        return 'Safe';
    }
}
