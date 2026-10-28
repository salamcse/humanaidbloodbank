<?php

namespace App\Http\Controllers;

use App\Models\BloodDonor;
use App\Models\BloodInventory;
use App\Models\BloodRequest;
use App\Models\BoardMember;
use App\Models\DonationRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class BloodAppController extends Controller
{
    /**
     * Display the main Blood Donor & Hospital Blood Bank portal
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $bloodGroup = $request->input('blood_group');
        $availability = $request->input('availability');
        $area = $request->input('area');

        $donorsQuery = BloodDonor::query()->latest();

        if (! empty($bloodGroup) && $bloodGroup !== 'ALL') {
            $donorsQuery->where('blood_group', $bloodGroup);
        }

        if ($availability === 'available') {
            $donorsQuery->where('is_available', true);
        } elseif ($availability === 'resting') {
            $donorsQuery->where('is_available', false);
        }

        if (! empty($area) && $area !== 'ALL') {
            $donorsQuery->where('area', 'like', "%{$area}%");
        }

        if (! empty($search)) {
            $donorsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('area', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('donor_code', 'like', "%{$search}%");
            });
        }

        $donors = $donorsQuery->get();

        $activeRequests = BloodRequest::with('matchedDonor')
            ->where('status', 'Active')
            ->orderByRaw("FIELD(urgency, 'Critical Immediate', 'Urgent (Within 4 hrs)', 'Standard (Today)')")
            ->latest()
            ->get();

        $fulfilledRequests = BloodRequest::where('status', 'Fulfilled')
            ->latest()
            ->take(5)
            ->get();

        $inventory = BloodInventory::orderByRaw("FIELD(blood_group, 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')")->get();

        $areas = BloodDonor::distinct()->pluck('area')->filter()->values();

        // Calculate dynamic stats
        $totalDonors = BloodDonor::count();
        $availableDonors = BloodDonor::where('is_available', true)->count();
        $activeRequestsCount = $activeRequests->count();
        $totalUnitsInBank = BloodInventory::sum('units_available');
        $criticalGroups = BloodInventory::whereColumn('units_available', '<=', 'critical_threshold')->pluck('blood_group');

        $boardMembers = BoardMember::orderBy('display_order')->get();

        return Inertia::render('welcome', [
            'donors' => $donors,
            'activeRequests' => $activeRequests,
            'fulfilledRequests' => $fulfilledRequests,
            'inventory' => $inventory,
            'areas' => $areas,
            'boardMembers' => $boardMembers,
            'stats' => [
                'total_donors' => $totalDonors,
                'available_donors' => $availableDonors,
                'active_requests' => $activeRequestsCount,
                'total_units_in_bank' => (int) $totalUnitsInBank,
                'critical_groups' => $criticalGroups,
            ],
            'filters' => [
                'search' => $search ?? '',
                'blood_group' => $bloodGroup ?? 'ALL',
                'availability' => $availability ?? 'ALL',
                'area' => $area ?? 'ALL',
            ],
        ]);
    }

    /**
     * Register a new volunteer blood donor
     */
    public function storeDonor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'blood_group' => 'required|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'gender' => 'required|string|in:Male,Female,Other',
            'age' => 'required|integer|min:18|max:65',
            'weight' => 'nullable|integer|min:45|max:200',
            'phone' => 'required|string|max:30|unique:blood_donors,phone',
            'email' => 'nullable|email|max:255',
            'district' => 'required|string|max:100',
            'area' => 'required|string|max:100',
            'address' => 'nullable|string|max:500',
            'last_donated_at' => 'nullable|date|before_or_equal:today',
            'notes' => 'nullable|string|max:500',
        ], [
            'phone.unique' => 'A donor with this phone number is already registered.',
            'age.min' => 'Donor must be at least 18 years old.',
            'age.max' => 'Donor maximum eligible age is 65 years.',
            'weight.min' => 'Minimum body weight for safe donation is 45 kg.',
        ]);

        $nextId = (BloodDonor::max('id') ?? 0) + 1001;
        $validated['donor_code'] = 'HAH-DN-' . $nextId;
        $validated['is_available'] = true;

        if (! empty($validated['last_donated_at'])) {
            $daysSince = Carbon::parse($validated['last_donated_at'])->diffInDays(now());
            if ($daysSince < 90) {
                $validated['is_available'] = false;
                $validated['health_status'] = 'Resting Period (' . (90 - $daysSince) . ' days left)';
            } else {
                $validated['health_status'] = 'Eligible';
            }
        } else {
            $validated['health_status'] = 'Eligible (First Time)';
        }

        $donor = BloodDonor::create($validated);

        return redirect()->back()->with('success', "Donor {$donor->name} ({$donor->blood_group}) registered successfully! Donor Code: {$donor->donor_code}");
    }

    /**
     * Toggle availability status of a donor
     */
    public function toggleAvailability(BloodDonor $donor)
    {
        $donor->is_available = ! $donor->is_available;
        $donor->health_status = $donor->is_available ? 'Eligible' : 'Temporarily Unavailable';
        $donor->save();

        return redirect()->back()->with('success', "Status updated for {$donor->name} to " . ($donor->is_available ? 'Available' : 'Resting/Unavailable'));
    }

    /**
     * Submit an Emergency Blood Request / SOS
     */
    public function storeRequest(Request $request)
    {
        $validated = $request->validate([
            'patient_name' => 'required|string|max:255',
            'hospital_name' => 'required|string|max:255',
            'hospital_ward_bed' => 'nullable|string|max:255',
            'blood_group' => 'required|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'units_needed' => 'required|integer|min:1|max:10',
            'urgency' => 'required|string|in:Critical Immediate,Urgent (Within 4 hrs),Standard (Today)',
            'contact_person' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:30',
            'medical_reason' => 'required|string|max:500',
            'additional_instructions' => 'nullable|string|max:1000',
        ]);

        $randomCode = rand(500, 999);
        $validated['request_code'] = 'HAH-REQ-' . $randomCode;
        $validated['status'] = 'Active';
        $validated['units_received'] = 0;

        $bloodReq = BloodRequest::create($validated);

        return redirect()->back()->with('success', "Emergency Blood Request [{$bloodReq->request_code}] for {$bloodReq->blood_group} has been posted to the Live Alert Board!");
    }

    /**
     * Mark an emergency request as Fulfilled
     */
    public function fulfillRequest(BloodRequest $bloodRequest, Request $request)
    {
        $bloodRequest->status = 'Fulfilled';
        $bloodRequest->units_received = $bloodRequest->units_needed;

        if ($request->filled('matched_donor_id')) {
            $bloodRequest->matched_donor_id = $request->input('matched_donor_id');
            $donor = BloodDonor::find($request->input('matched_donor_id'));
            if ($donor) {
                $donor->increment('total_donations');
                $donor->last_donated_at = Carbon::today();
                $donor->is_available = false;
                $donor->health_status = 'Resting Period (90 days)';
                $donor->save();

                DonationRecord::create([
                    'blood_donor_id' => $donor->id,
                    'blood_request_id' => $bloodRequest->id,
                    'donation_date' => Carbon::today(),
                    'units' => $bloodRequest->units_needed,
                    'hospital_location' => $bloodRequest->hospital_name . ' - ' . ($bloodRequest->hospital_ward_bed ?? 'Main Center'),
                    'notes' => 'Donated in response to emergency request ' . $bloodRequest->request_code,
                ]);
            }
        }

        $bloodRequest->save();

        return redirect()->back()->with('success', "Blood Request [{$bloodRequest->request_code}] marked as Fulfilled!");
    }

    /**
     * Quick stock adjustment for hospital blood bank
     */
    public function adjustInventory(Request $request, BloodInventory $bloodInventory)
    {
        $validated = $request->validate([
            'delta_units' => 'required|integer',
            'action_type' => 'required|string|in:add,deduct',
            'reason' => 'nullable|string|max:255',
        ]);

        if ($validated['action_type'] === 'add') {
            $bloodInventory->units_available += abs($validated['delta_units']);
            $bloodInventory->last_restocked_at = now();
        } else {
            $deductAmount = abs($validated['delta_units']);
            if ($bloodInventory->units_available < $deductAmount) {
                return redirect()->back()->withErrors(['delta_units' => "Cannot deduct {$deductAmount} units; only {$bloodInventory->units_available} units are in stock."]);
            }
            $bloodInventory->units_available -= $deductAmount;
        }

        $bloodInventory->save();

        return redirect()->back()->with('success', "Blood inventory for {$bloodInventory->blood_group} successfully updated to {$bloodInventory->units_available} units.");
    }

    /**
     * Store a new board member dynamically
     */
    public function storeBoardMember(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'organization' => 'nullable|string|max:255',
            'committee' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'message' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'image_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'display_order' => 'nullable|integer',
        ]);

        $imageUrl = $validated['image_url'] ?? '/images/board/board_leader.png';

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'board_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('images/board'), $fileName);
            $imageUrl = '/images/board/' . $fileName;
        }

        BoardMember::create([
            'name' => $validated['name'],
            'designation' => $validated['designation'],
            'organization' => $validated['organization'] ?? 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
            'committee' => $validated['committee'] ?? 'Governing Board',
            'bio' => $validated['bio'] ?? null,
            'message' => $validated['message'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'image_url' => $imageUrl,
            'display_order' => $validated['display_order'] ?? (BoardMember::max('display_order') + 1),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', "Board member {$validated['name']} added successfully.");
    }

    /**
     * Update an existing board member
     */
    public function updateBoardMember(Request $request, BoardMember $boardMember)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'organization' => 'nullable|string|max:255',
            'committee' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:1000',
            'message' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'image_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:5120',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'board_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('images/board'), $fileName);
            $boardMember->image_url = '/images/board/' . $fileName;
        } elseif (! empty($validated['image_url'])) {
            $boardMember->image_url = $validated['image_url'];
        }

        $boardMember->name = $validated['name'];
        $boardMember->designation = $validated['designation'];
        $boardMember->organization = $validated['organization'] ?? $boardMember->organization;
        $boardMember->committee = $validated['committee'] ?? $boardMember->committee;
        $boardMember->bio = $validated['bio'] ?? $boardMember->bio;
        $boardMember->message = $validated['message'] ?? $boardMember->message;
        $boardMember->phone = $validated['phone'] ?? $boardMember->phone;
        $boardMember->email = $validated['email'] ?? $boardMember->email;
        if (isset($validated['display_order'])) {
            $boardMember->display_order = $validated['display_order'];
        }
        if (isset($validated['is_active'])) {
            $boardMember->is_active = $validated['is_active'];
        }

        $boardMember->save();

        return redirect()->back()->with('success', "Board member {$boardMember->name} updated successfully.");
    }

    /**
     * Delete a board member
     */
    public function deleteBoardMember(BoardMember $boardMember)
    {
        $name = $boardMember->name;
        $boardMember->delete();

        return redirect()->back()->with('success', "Board member {$name} removed successfully.");
    }

    /**
     * Toggle active status of a board member
     */
    public function toggleBoardMember(BoardMember $boardMember)
    {
        $boardMember->is_active = ! $boardMember->is_active;
        $boardMember->save();

        $status = $boardMember->is_active ? 'active' : 'hidden';
        return redirect()->back()->with('success', "Board member {$boardMember->name} marked as {$status}.");
    }
}

