<?php

use App\Http\Controllers\BloodAppController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [BloodAppController::class, 'index'])->name('home');
Route::post('/donors', [BloodAppController::class, 'storeDonor'])->name('donors.store');
Route::patch('/donors/{donor}/toggle', [BloodAppController::class, 'toggleAvailability'])->name('donors.toggle');
Route::post('/requests', [BloodAppController::class, 'storeRequest'])->name('requests.store');
Route::post('/requests/{bloodRequest}/fulfill', [BloodAppController::class, 'fulfillRequest'])->name('requests.fulfill');
Route::post('/inventory/{bloodInventory}/adjust', [BloodAppController::class, 'adjustInventory'])->name('inventory.adjust');
Route::post('/board-members', [BloodAppController::class, 'storeBoardMember'])->name('board-members.store');
Route::post('/board-members/{boardMember}', [BloodAppController::class, 'updateBoardMember'])->name('board-members.update');
Route::delete('/board-members/{boardMember}', [BloodAppController::class, 'deleteBoardMember'])->name('board-members.destroy');
Route::patch('/board-members/{boardMember}/toggle', [BloodAppController::class, 'toggleBoardMember'])->name('board-members.toggle');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard', [
            'boardMembers' => \App\Models\BoardMember::orderBy('display_order')->get(),
            'donorsCount' => \App\Models\BloodDonor::count(),
            'requestsCount' => \App\Models\BloodRequest::where('status', 'Active')->count(),
            'inventoryCount' => \App\Models\BloodInventory::sum('units_available'),
        ]);
    })->name('dashboard');
});

require __DIR__.'/settings.php';
