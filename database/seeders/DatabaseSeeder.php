<?php

namespace Database\Seeders;

use App\Models\BoardMember;
use App\Models\BloodDonor;
use App\Models\BloodInventory;
use App\Models\BloodRequest;
use App\Models\DonationRecord;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Hospital Admin User
        User::firstOrCreate(
            ['email' => 'admin@humanaid.org'],
            [
                'name' => 'Human Aid Hospital Admin',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 1. Seed Blood Bank Inventory for all 8 blood groups
        $inventoryData = [
            ['blood_group' => 'A+', 'units_available' => 28, 'safe_threshold' => 15, 'critical_threshold' => 6, 'expiry_risk_units' => 2],
            ['blood_group' => 'A-', 'units_available' => 7,  'safe_threshold' => 10, 'critical_threshold' => 4, 'expiry_risk_units' => 0],
            ['blood_group' => 'B+', 'units_available' => 34, 'safe_threshold' => 15, 'critical_threshold' => 8, 'expiry_risk_units' => 3],
            ['blood_group' => 'B-', 'units_available' => 5,  'safe_threshold' => 10, 'critical_threshold' => 4, 'expiry_risk_units' => 1],
            ['blood_group' => 'AB+', 'units_available' => 12, 'safe_threshold' => 12, 'critical_threshold' => 5, 'expiry_risk_units' => 1],
            ['blood_group' => 'AB-', 'units_available' => 3,  'safe_threshold' => 8,  'critical_threshold' => 3, 'expiry_risk_units' => 0],
            ['blood_group' => 'O+', 'units_available' => 42, 'safe_threshold' => 20, 'critical_threshold' => 10, 'expiry_risk_units' => 4],
            ['blood_group' => 'O-', 'units_available' => 4,  'safe_threshold' => 12, 'critical_threshold' => 5, 'expiry_risk_units' => 0],
        ];

        foreach ($inventoryData as $inv) {
            BloodInventory::updateOrCreate(
                ['blood_group' => $inv['blood_group']],
                array_merge($inv, ['last_restocked_at' => Carbon::now()->subDays(rand(1, 4))])
            );
        }

        // 2. Seed Realistic Donors
        $donorsData = [
            [
                'donor_code' => 'HAH-DN-1001',
                'name' => 'Tanvir Ahmed',
                'blood_group' => 'O+',
                'gender' => 'Male',
                'age' => 28,
                'weight' => 72,
                'phone' => '+880 1711-234567',
                'email' => 'tanvir.ahmed@gmail.com',
                'district' => 'Dhaka',
                'area' => 'Dhanmondi',
                'address' => 'Road 7/A, Dhanmondi, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(120),
                'is_available' => true,
                'total_donations' => 6,
                'health_status' => 'Eligible',
                'notes' => 'Regular voluntary donor. Available for emergency call.'
            ],
            [
                'donor_code' => 'HAH-DN-1002',
                'name' => 'Nusrat Jahan',
                'blood_group' => 'A+',
                'gender' => 'Female',
                'age' => 25,
                'weight' => 56,
                'phone' => '+880 1819-345678',
                'email' => 'nusrat.jahan@yahoo.com',
                'district' => 'Dhaka',
                'area' => 'Mirpur 10',
                'address' => 'Section 10, Block C, Mirpur, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(105),
                'is_available' => true,
                'total_donations' => 4,
                'health_status' => 'Eligible',
                'notes' => 'College lecturer, keen on platelet and whole blood donation.'
            ],
            [
                'donor_code' => 'HAH-DN-1003',
                'name' => 'Arifur Rahman',
                'blood_group' => 'B+',
                'gender' => 'Male',
                'age' => 32,
                'weight' => 78,
                'phone' => '+880 1912-456789',
                'email' => 'arif.rahman@outlook.com',
                'district' => 'Dhaka',
                'area' => 'Uttara Sector 7',
                'address' => 'Sector 7, Road 12, Uttara, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(25), // Recently donated
                'is_available' => false,
                'total_donations' => 9,
                'health_status' => 'Resting Period',
                'notes' => 'Resting period until next 65 days. Top tier active donor.'
            ],
            [
                'donor_code' => 'HAH-DN-1004',
                'name' => 'Farhana Islam',
                'blood_group' => 'O-',
                'gender' => 'Female',
                'age' => 29,
                'weight' => 59,
                'phone' => '+880 1613-567890',
                'email' => 'farhana.islam@gmail.com',
                'district' => 'Dhaka',
                'area' => 'Gulshan 2',
                'address' => 'Road 54, Gulshan 2, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(140),
                'is_available' => true,
                'total_donations' => 5,
                'health_status' => 'Eligible',
                'notes' => 'Rare Universal Donor (O-Negative). Emergency contact priority.'
            ],
            [
                'donor_code' => 'HAH-DN-1005',
                'name' => 'Mahmudul Hasan',
                'blood_group' => 'AB+',
                'gender' => 'Male',
                'age' => 30,
                'weight' => 81,
                'phone' => '+880 1714-678901',
                'email' => 'mahmud.hasan@live.com',
                'district' => 'Dhaka',
                'area' => 'Mohakhali DOHS',
                'address' => 'Lane 4, Mohakhali DOHS, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(98),
                'is_available' => true,
                'total_donations' => 3,
                'health_status' => 'Eligible',
                'notes' => 'Corporate executive, ready during weekdays after 5 PM.'
            ],
            [
                'donor_code' => 'HAH-DN-1006',
                'name' => 'Sadia Karim',
                'blood_group' => 'B-',
                'gender' => 'Female',
                'age' => 24,
                'weight' => 54,
                'phone' => '+880 1815-789012',
                'email' => 'sadia.karim@gmail.com',
                'district' => 'Dhaka',
                'area' => 'Mohammadpur',
                'address' => 'Salimullah Road, Mohammadpur, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(110),
                'is_available' => true,
                'total_donations' => 2,
                'health_status' => 'Eligible',
                'notes' => 'Rare B-Negative donor. Fast responder.'
            ],
            [
                'donor_code' => 'HAH-DN-1007',
                'name' => 'Kazi Imtiaz',
                'blood_group' => 'A-',
                'gender' => 'Male',
                'age' => 35,
                'weight' => 74,
                'phone' => '+880 1916-890123',
                'email' => 'imtiaz.kazi@gmail.com',
                'district' => 'Dhaka',
                'area' => 'Banani',
                'address' => 'Block F, Road 11, Banani, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(150),
                'is_available' => true,
                'total_donations' => 8,
                'health_status' => 'Eligible',
                'notes' => 'Rare A-Negative donor, owns a car so can reach hospital quickly.'
            ],
            [
                'donor_code' => 'HAH-DN-1008',
                'name' => 'Zubair Hossain',
                'blood_group' => 'AB-',
                'gender' => 'Male',
                'age' => 27,
                'weight' => 68,
                'phone' => '+880 1717-901234',
                'email' => 'zubair.h@techcorp.bd',
                'district' => 'Dhaka',
                'area' => 'Old Dhaka',
                'address' => 'Nazimuddin Road, Lalbagh, Old Dhaka',
                'last_donated_at' => Carbon::now()->subDays(130),
                'is_available' => true,
                'total_donations' => 4,
                'health_status' => 'Eligible',
                'notes' => 'Extremely rare AB-Negative blood group.'
            ],
            [
                'donor_code' => 'HAH-DN-1009',
                'name' => 'Shakil Anowar',
                'blood_group' => 'O+',
                'gender' => 'Male',
                'age' => 22,
                'weight' => 64,
                'phone' => '+880 1818-012345',
                'email' => 'shakil.anowar@du.ac.bd',
                'district' => 'Dhaka',
                'area' => 'Dhaka University Campus',
                'address' => 'Shahbagh, Dhaka',
                'last_donated_at' => null, // First time donor
                'is_available' => true,
                'total_donations' => 0,
                'health_status' => 'Eligible',
                'notes' => 'Student volunteer, first-time verified donor.'
            ],
            [
                'donor_code' => 'HAH-DN-1010',
                'name' => 'Meherun Nesa',
                'blood_group' => 'B+',
                'gender' => 'Female',
                'age' => 31,
                'weight' => 62,
                'phone' => '+880 1919-123456',
                'email' => 'meherun.nesa@hospital.org',
                'district' => 'Dhaka',
                'area' => 'Badda',
                'address' => 'Middle Badda, Pragati Sarani, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(95),
                'is_available' => true,
                'total_donations' => 5,
                'health_status' => 'Eligible',
                'notes' => 'Registered medical nurse, available in morning shifts.'
            ],
            [
                'donor_code' => 'HAH-DN-1011',
                'name' => 'Rashidul Huq',
                'blood_group' => 'A+',
                'gender' => 'Male',
                'age' => 38,
                'weight' => 84,
                'phone' => '+880 1720-234567',
                'email' => 'rashid.huq@bankbd.com',
                'district' => 'Dhaka',
                'area' => 'Motijheel',
                'address' => 'Dilkusha C/A, Motijheel, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(180),
                'is_available' => true,
                'total_donations' => 12,
                'health_status' => 'Eligible',
                'notes' => 'Veteran donor with 12 successful donations.'
            ],
            [
                'donor_code' => 'HAH-DN-1012',
                'name' => 'Afroza Sultana',
                'blood_group' => 'O+',
                'gender' => 'Female',
                'age' => 26,
                'weight' => 58,
                'phone' => '+880 1821-345678',
                'email' => 'afroza.sultana@gmail.com',
                'district' => 'Dhaka',
                'area' => 'Khilgaon',
                'address' => 'Block C, Taltola, Khilgaon, Dhaka',
                'last_donated_at' => Carbon::now()->subDays(45), // Resting
                'is_available' => false,
                'total_donations' => 3,
                'health_status' => 'Resting Period',
                'notes' => 'Donated 45 days ago for emergency maternity case.'
            ]
        ];

        $createdDonors = [];
        foreach ($donorsData as $dData) {
            $createdDonors[] = BloodDonor::updateOrCreate(
                ['donor_code' => $dData['donor_code']],
                $dData
            );
        }

        // 3. Seed Active Emergency Blood Requests for Human Aid Hospital
        $requestsData = [
            [
                'request_code' => 'HAH-REQ-501',
                'patient_name' => 'Mst. Selina Begum',
                'hospital_name' => 'Human Aid Hospital',
                'hospital_ward_bed' => 'ICU Bed 03',
                'blood_group' => 'O-',
                'units_needed' => 2,
                'units_received' => 0,
                'urgency' => 'Critical Immediate',
                'contact_person' => 'Kamal Hossain (Son)',
                'contact_phone' => '+880 1755-112233',
                'medical_reason' => 'Emergency Road Trauma Surgery with acute hemorrhage',
                'status' => 'Active',
                'additional_instructions' => 'Patient in critical condition in Human Aid Hospital ICU. Fresh blood bags needed immediately.',
            ],
            [
                'request_code' => 'HAH-REQ-502',
                'patient_name' => 'Master Rayan (Age 7)',
                'hospital_name' => 'Human Aid Hospital',
                'hospital_ward_bed' => 'Pediatric Care Ward 2A',
                'blood_group' => 'B+',
                'units_needed' => 1,
                'units_received' => 0,
                'urgency' => 'Urgent (Within 4 hrs)',
                'contact_person' => 'Dr. Shamsul Alam',
                'contact_phone' => '+880 1811-445566',
                'medical_reason' => 'Severe Thalassemia periodic transfusion (Hemoglobin < 5.2)',
                'status' => 'Active',
                'additional_instructions' => 'Filtered leukocyte-reduced blood preferred.',
            ],
            [
                'request_code' => 'HAH-REQ-503',
                'patient_name' => 'Nasreen Akhtar',
                'hospital_name' => 'Human Aid Hospital',
                'hospital_ward_bed' => 'Maternity Wing Bed 14',
                'blood_group' => 'A+',
                'units_needed' => 2,
                'units_received' => 1,
                'urgency' => 'Critical Immediate',
                'contact_person' => 'Tariqul Islam (Husband)',
                'contact_phone' => '+880 1922-778899',
                'medical_reason' => 'Emergency Cesarean Delivery with severe placenta previa',
                'status' => 'Active',
                'additional_instructions' => 'Operation scheduled in OT 1. 1 bag already arranged, 1 more urgently needed.',
            ],
            [
                'request_code' => 'HAH-REQ-504',
                'patient_name' => 'Abdul Kader Mollah',
                'hospital_name' => 'Human Aid Hospital',
                'hospital_ward_bed' => 'Cardiac Care Unit (CCU 5)',
                'blood_group' => 'AB-',
                'units_needed' => 1,
                'units_received' => 0,
                'urgency' => 'Urgent (Within 4 hrs)',
                'contact_person' => 'Rezaul Karim (Brother)',
                'contact_phone' => '+880 1733-990011',
                'medical_reason' => 'Emergency Coronary Artery Bypass Graft (CABG)',
                'status' => 'Active',
                'additional_instructions' => 'Rare AB-Negative donor required on standby.',
            ],
            [
                'request_code' => 'HAH-REQ-505',
                'patient_name' => 'Faruk Chowdhury',
                'hospital_name' => 'Human Aid Hospital',
                'hospital_ward_bed' => 'General Surgery Ward 4B',
                'blood_group' => 'B-',
                'units_needed' => 1,
                'units_received' => 1,
                'urgency' => 'Standard (Today)',
                'contact_person' => 'Anisur Rahman',
                'contact_phone' => '+880 1688-334455',
                'medical_reason' => 'Post-operative recovery blood replenishment',
                'status' => 'Fulfilled',
                'additional_instructions' => 'Successfully received blood from volunteer donor.',
            ],
        ];

        foreach ($requestsData as $req) {
            BloodRequest::updateOrCreate(
                ['request_code' => $req['request_code']],
                $req
            );
        }

        // 4. Seed Recent Donation Records
        DonationRecord::create([
            'blood_donor_id' => $createdDonors[0]->id,
            'donation_date' => Carbon::now()->subDays(120),
            'units' => 1,
            'hospital_location' => 'Human Aid Hospital Main Blood Center',
            'hemoglobin_level' => 14.2,
            'blood_pressure' => '120/80',
            'notes' => 'Clean voluntary donation. Patient well tolerated.'
        ]);

        DonationRecord::create([
            'blood_donor_id' => $createdDonors[2]->id,
            'donation_date' => Carbon::now()->subDays(25),
            'units' => 1,
            'hospital_location' => 'Human Aid Hospital Emergency OT',
            'hemoglobin_level' => 13.8,
            'blood_pressure' => '118/78',
            'notes' => 'Donated for emergency surgery at Human Aid Hospital.'
        ]);

        // 5. Seed Board Members / Governing Body
        $boardMembersData = [
            [
                'name' => 'Alhaj Md. Abdus Salam',
                'designation' => 'Chairman & Founder Trustee',
                'organization' => 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
                'committee' => 'Board Member',
                'image_url' => '/images/board/board_leader.png',
                'bio' => 'Philanthropist and healthcare visionary leading humanitarian transfusion initiatives, emergency donor networks, and charitable healthcare programs across Bangladesh.',
                'message' => 'Our mission at Human Aid Hospital and Sadhinota Blood Transfusion Center is to ensure that no patient ever suffers or loses a life due to unavailability of safe, screened blood. We invite every citizen to join this noble voluntary movement.',
                'phone' => '+880 1324-251510',
                'email' => 'humanaidoffice@gmail.com',
                'social_facebook' => 'https://www.facebook.com/sbtc107',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Md. Nazmul Huda',
                'designation' => 'Executive Director & General Secretary',
                'organization' => 'Human Aid Bangladesh Foundation',
                'committee' => 'Board Member',
                'image_url' => '/images/board/board_speaker.png',
                'bio' => 'Healthcare strategist leading institutional collaborations, university research partnerships with DIU Health Informatics Research Lab (HiRL), and emergency response logistics.',
                'message' => 'By combining modern digital informatics with grassroots blood donation drives, we are building a world-class, automated voluntary donor registry for rapid emergency blood mobilization.',
                'phone' => '+880 1711-223344',
                'email' => 'secretary@humanaidbd.org',
                'social_facebook' => 'https://www.facebook.com/sbtc107',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Engr. Tanvir Ahmed',
                'designation' => 'Director of Youth & Health Informatics',
                'organization' => 'Human Aid Bangladesh Foundation',
                'committee' => 'Board Member',
                'image_url' => '/images/board/board_youth_director.png',
                'bio' => 'Youth leader and systems engineer coordinating volunteer student networks across colleges and universities, automating real-time donor matching and digital emergency notification channels.',
                'message' => 'Empowering youth with technology creates an unstoppable force for good. We are mobilizing thousands of active blood donors with one tap.',
                'phone' => '+880 1799-887766',
                'email' => 'tanvir@humanaidbd.org',
                'social_facebook' => 'https://www.facebook.com/sbtc107',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Prof. Dr. M. A. Rashid',
                'designation' => 'Medical Director & Chief Transfusion Specialist',
                'organization' => 'Human Aid Hospital',
                'committee' => 'Advisor panel',
                'image_url' => '/images/board/board_speaker.png',
                'bio' => 'Senior Hematologist & Transfusion Medicine consultant leading clinical safety, cross-matching, and WHO-standard blood preservation.',
                'message' => 'We enforce stringent laboratory protocols for viral screening, antibody detection, and component separation to protect every patient.',
                'phone' => '+880 1819-334455',
                'email' => 'medical.director@humanaid.org',
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Advocate Syeda Rehana Begum',
                'designation' => 'Vice Chairperson & Legal Advisor',
                'organization' => 'Human Aid Bangladesh Foundation',
                'committee' => 'Advisor panel',
                'image_url' => '/images/board/board_leader.png',
                'bio' => 'Supreme Court Advocate championing patient welfare rights, ethical healthcare access, and non-profit hospital governance.',
                'message' => 'Transparency and ethical humanitarian service are the core pillars of our hospital foundation.',
                'phone' => '+880 1911-556677',
                'email' => 'legal@humanaidbd.org',
                'display_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($boardMembersData as $bm) {
            BoardMember::updateOrCreate(
                ['name' => $bm['name']],
                $bm
            );
        }
    }
}
