import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import {
    Heart,
    Droplet,
    Phone,
    MapPin,
    Calendar,
    ShieldCheck,
    AlertCircle,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    ArrowRight,
    X,
    Award,
    Activity,
    User,
    Hospital,
    Share2,
    Download,
    AlertTriangle,
    QrCode,
    Sparkles,
    Check,
    ChevronRight,
    Users,
    Package,
    PhoneCall,
    ExternalLink,
    Camera,
    ZoomIn,
    ChevronLeft,
    Image as ImageIcon,
    MessageCircle,
    LogIn,
    LogOut,
    LayoutDashboard,
    Quote,
    UserPlus,
    Edit3,
    Trash2
} from 'lucide-react';

const getWhatsAppUrl = (phone: string, text?: string) => {
    let digits = (phone || '').replace(/\D/g, '');
    if (digits.startsWith('0')) {
        digits = '88' + digits;
    } else if (digits.length === 10 && digits.startsWith('1')) {
        digits = '880' + digits;
    } else if (!digits.startsWith('880') && digits.length <= 11) {
        digits = '88' + digits;
    }
    const base = `https://wa.me/${digits}`;
    if (text) {
        return `${base}?text=${encodeURIComponent(text)}`;
    }
    return base;
};


const GALLERY_ITEMS = [
    {
        id: 1,
        title: "MoU Signing Ceremony & Delegation",
        subtitle: "Human Aid Bangladesh & DIU Health Informatics Research Lab (HiRL)",
        date: "October 2026",
        src: "/images/gallery/mou_team.jpg",
        category: "Academic Partnership",
        description: "Official delegation and research scholars from Daffodil International University (DIU) and Human Aid Bangladesh celebrating the historic MoU signing ceremony for digital health informatics, blood safety, and volunteer network collaboration."
    },
    {
        id: 2,
        title: "MoU Agreement Execution",
        subtitle: "Formal Contract Signing on Dais",
        date: "October 2026",
        src: "/images/gallery/mou_signing.jpg",
        category: "MoU Signing",
        description: "Key leaders from Human Aid Bangladesh and Health Informatics Research Lab executing the mutual cooperation agreement for health tech and transfusion research."
    },
    {
        id: 3,
        title: "Exchange of Signed MoU Binders",
        subtitle: "Mutual Handshake & Commitment",
        date: "October 2026",
        src: "/images/gallery/mou_handshake.jpg",
        category: "Ceremony",
        description: "Formal exchange of official agreement documents between DIU Department of CSE / HiRL and Human Aid Bangladesh leadership."
    },
    {
        id: 4,
        title: "Formal Protocol Signing Moment",
        subtitle: "Digital Healthcare & Blood Registry Initiative",
        date: "October 2026",
        src: "/images/gallery/mou_close_up.jpg",
        category: "Research",
        description: "Signing moment formalizing joint technical initiatives for digital blood tracking, donor matching algorithms, and community transfusion support."
    }
];

interface Donor {
    id: number;
    donor_code: string;
    name: string;
    blood_group: string;
    gender: string;
    age: number;
    weight: number | null;
    phone: string;
    email: string | null;
    district: string;
    area: string;
    address: string | null;
    last_donated_at: string | null;
    is_available: boolean;
    total_donations: number;
    health_status: string;
    notes: string | null;
    is_eligible: boolean;
    days_until_eligible: number;
}

interface BloodRequest {
    id: number;
    request_code: string;
    patient_name: string;
    hospital_name: string;
    hospital_ward_bed: string | null;
    blood_group: string;
    units_needed: number;
    units_received: number;
    urgency: string;
    contact_person: string;
    contact_phone: string;
    medical_reason: string;
    status: string;
    additional_instructions: string | null;
    created_at: string;
    matched_donor?: Donor;
}

interface BloodInventory {
    id: number;
    blood_group: string;
    units_available: number;
    safe_threshold: number;
    critical_threshold: number;
    expiry_risk_units: number;
    stock_status: 'Safe' | 'Low' | 'Critical';
    last_restocked_at: string | null;
}

interface Stats {
    total_donors: number;
    available_donors: number;
    active_requests: number;
    total_units_in_bank: number;
    critical_groups: string[];
}

interface BoardMember {
    id: number;
    name: string;
    designation: string;
    organization: string;
    committee: string;
    image_url: string;
    bio: string | null;
    message: string | null;
    phone: string | null;
    email: string | null;
    social_facebook: string | null;
    social_linkedin: string | null;
    display_order: number;
    is_active: boolean;
}

interface Props {
    donors: Donor[];
    activeRequests: BloodRequest[];
    fulfilledRequests: BloodRequest[];
    inventory: BloodInventory[];
    areas: string[];
    boardMembers?: BoardMember[];
    stats: Stats;
    filters: {
        search: string;
        blood_group: string;
        availability: string;
        area: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Blood Compatibility Matrix
const COMPATIBILITY: Record<string, { canDonateTo: string[]; canReceiveFrom: string[] }> = {
    'O-': {
        canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Donor
        canReceiveFrom: ['O-']
    },
    'O+': {
        canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
        canReceiveFrom: ['O+', 'O-']
    },
    'A-': {
        canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
        canReceiveFrom: ['A-', 'O-']
    },
    'A+': {
        canDonateTo: ['A+', 'AB+'],
        canReceiveFrom: ['A+', 'A-', 'O+', 'O-']
    },
    'B-': {
        canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
        canReceiveFrom: ['B-', 'O-']
    },
    'B+': {
        canDonateTo: ['B+', 'AB+'],
        canReceiveFrom: ['B+', 'B-', 'O+', 'O-']
    },
    'AB-': {
        canDonateTo: ['AB+', 'AB-'],
        canReceiveFrom: ['AB-', 'A-', 'B-', 'O-']
    },
    'AB+': {
        canDonateTo: ['AB+'],
        canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] // Universal Recipient
    }
};

export default function Welcome({
    donors = [],
    activeRequests = [],
    fulfilledRequests = [],
    inventory = [],
    areas = [],
    boardMembers = [],
    stats,
    filters,
    flash
}: Props) {
    const pageProps = usePage().props as any;
    const authUser = pageProps?.auth?.user;
    const successMessage = flash?.success || pageProps?.flash?.success;
    const errorMessage = flash?.error || pageProps?.flash?.error;

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'overview' | 'donors' | 'emergency' | 'inventory' | 'gallery' | 'board' | 'register' | 'compatibility'>(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            if (tab && ['overview', 'donors', 'emergency', 'inventory', 'gallery', 'board', 'register', 'compatibility'].includes(tab)) {
                return tab as any;
            }
        }
        return 'overview';
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedGroup, setSelectedGroup] = useState(filters?.blood_group || 'ALL');
    const [selectedAvailability, setSelectedAvailability] = useState(filters?.availability || 'ALL');
    const [selectedArea, setSelectedArea] = useState(filters?.area || 'ALL');

    // Gallery state
    const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>('ALL');
    const [lightboxItem, setLightboxItem] = useState<(typeof GALLERY_ITEMS)[0] | null>(null);

    // Board Members state & management (Only 2 panels: 1. Board Member, 2. Advisor panel)
    const [selectedCommittee, setSelectedCommittee] = useState<string>('Board Member');
    const [selectedBoardMember, setSelectedBoardMember] = useState<BoardMember | null>(null);
    const [isManageBoardModalOpen, setIsManageBoardModalOpen] = useState(false);
    const [editingBoardMember, setEditingBoardMember] = useState<BoardMember | null>(null);

    const boardForm = useForm({
        name: '',
        designation: '',
        organization: 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
        committee: 'Board Member',
        bio: '',
        message: '',
        phone: '',
        email: '',
        display_order: 1,
        image_url: '',
        image: null as File | null,
    });

    const handleOpenCreateBoardMember = () => {
        setEditingBoardMember(null);
        boardForm.setData({
            name: '',
            designation: '',
            organization: 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
            committee: 'Board Member',
            bio: '',
            message: '',
            phone: '',
            email: '',
            display_order: (boardMembers.length + 1),
            image_url: '/images/board/board_leader.png',
            image: null,
        });
        setIsManageBoardModalOpen(true);
    };

    const handleOpenEditBoardMember = (member: BoardMember) => {
        setEditingBoardMember(member);
        boardForm.setData({
            name: member.name,
            designation: member.designation,
            organization: member.organization || 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
            committee: member.committee || 'Board Member',
            bio: member.bio || '',
            message: member.message || '',
            phone: member.phone || '',
            email: member.email || '',
            display_order: member.display_order,
            image_url: member.image_url || '',
            image: null,
        });
        setIsManageBoardModalOpen(true);
    };

    const handleSubmitBoardMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBoardMember) {
            boardForm.post(`/board-members/${editingBoardMember.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsManageBoardModalOpen(false);
                    setEditingBoardMember(null);
                }
            });
        } else {
            boardForm.post('/board-members', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsManageBoardModalOpen(false);
                    boardForm.reset();
                }
            });
        }
    };

    const handleDeleteBoardMember = (id: number) => {
        if (confirm('Are you sure you want to remove this board member from the system?')) {
            router.delete(`/board-members/${id}`, { preserveScroll: true });
        }
    };

    const handleToggleBoardMember = (id: number) => {
        router.patch(`/board-members/${id}/toggle`, {}, { preserveScroll: true });
    };

    // Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState<BloodInventory | null>(null);
    const [selectedDonorCard, setSelectedDonorCard] = useState<Donor | null>(null);
    const [selectedRequestToFulfill, setSelectedRequestToFulfill] = useState<BloodRequest | null>(null);

    // Interactive Compatibility State
    const [compatSelectedGroup, setCompatSelectedGroup] = useState<string>('O+');

    // Interactive Eligibility Calculator State
    const [calcLastDonated, setCalcLastDonated] = useState<string>('');
    const [calcAge, setCalcAge] = useState<number>(25);
    const [calcWeight, setCalcWeight] = useState<number>(65);

    // Filter Donors locally for instantaneous search response
    const filteredDonors = useMemo(() => {
        return donors.filter((donor) => {
            if (selectedGroup !== 'ALL' && donor.blood_group !== selectedGroup) return false;
            if (selectedAvailability === 'available' && !donor.is_available) return false;
            if (selectedAvailability === 'resting' && donor.is_available) return false;
            if (selectedArea !== 'ALL' && !donor.area.toLowerCase().includes(selectedArea.toLowerCase())) return false;
            if (searchTerm.trim() !== '') {
                const term = searchTerm.toLowerCase();
                const matches =
                    donor.name.toLowerCase().includes(term) ||
                    donor.phone.toLowerCase().includes(term) ||
                    donor.area.toLowerCase().includes(term) ||
                    donor.district.toLowerCase().includes(term) ||
                    donor.donor_code.toLowerCase().includes(term) ||
                    donor.blood_group.toLowerCase().includes(term);
                if (!matches) return false;
            }
            return true;
        });
    }, [donors, selectedGroup, selectedAvailability, selectedArea, searchTerm]);

    // Donor Registration Form
    const donorForm = useForm({
        name: '',
        blood_group: 'A+',
        gender: 'Male',
        age: 25,
        weight: 60,
        phone: '',
        email: '',
        district: 'Dhaka',
        area: '',
        address: '',
        last_donated_at: '',
        notes: ''
    });

    const handleDonorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        donorForm.post('/donors', {
            preserveScroll: true,
            onSuccess: () => {
                donorForm.reset();
                setActiveTab('donors');
            }
        });
    };

    // Emergency Request Form
    const requestForm = useForm({
        patient_name: '',
        hospital_name: 'Human Aid Hospital',
        hospital_ward_bed: 'ICU Bed 03',
        blood_group: 'O+',
        units_needed: 1,
        urgency: 'Critical Immediate',
        contact_person: '',
        contact_phone: '',
        medical_reason: '',
        additional_instructions: ''
    });

    const handleRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        requestForm.post('/requests', {
            preserveScroll: true,
            onSuccess: () => {
                requestForm.reset();
                setIsRequestModalOpen(false);
                setActiveTab('emergency');
            }
        });
    };

    // Fulfill Request Form
    const fulfillForm = useForm({
        matched_donor_id: ''
    });

    const handleFulfillSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequestToFulfill) return;
        fulfillForm.post(`/requests/${selectedRequestToFulfill.id}/fulfill`, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedRequestToFulfill(null);
                fulfillForm.reset();
            }
        });
    };

    // Inventory Adjust Form
    const inventoryForm = useForm({
        delta_units: 1,
        action_type: 'add',
        reason: 'Hospital Blood Donation Drive'
    });

    const handleInventorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStockModalOpen) return;
        inventoryForm.post(`/inventory/${isStockModalOpen.id}/adjust`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsStockModalOpen(null);
                inventoryForm.reset();
            }
        });
    };

    // Toggle Donor Availability
    const toggleAvailability = (donorId: number) => {
        router.patch(`/donors/${donorId}/toggle`, {}, { preserveScroll: true });
    };

    // Calculator Results
    const eligibilityResult = useMemo(() => {
        let isEligible = true;
        let reasons: string[] = [];
        let daysLeft = 0;

        if (calcAge < 18 || calcAge > 65) {
            isEligible = false;
            reasons.push('Eligible age range for blood donation is 18 to 65 years.');
        }

        if (calcWeight < 45) {
            isEligible = false;
            reasons.push('Minimum required weight is 45 kg to ensure donor safety.');
        }

        if (calcLastDonated) {
            const lastDate = new Date(calcLastDonated);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 90) {
                isEligible = false;
                daysLeft = 90 - diffDays;
                reasons.push(`You must wait 90 days between donations. ${daysLeft} days remaining.`);
            }
        }

        return { isEligible, reasons, daysLeft };
    }, [calcLastDonated, calcAge, calcWeight]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-rose-500 selection:text-white">
            <Head title="Human Aid Hospital - Blood Bank & Voluntary Donor Network" />

            {/* Top Announcement Bar */}
            <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white text-xs py-2 px-4 shadow-sm border-b border-rose-900/30">
                <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                        <span className="font-extrabold tracking-wide">SADHINOTA BLOOD TRANSFUSION CENTER</span>
                        <span className="hidden md:inline text-rose-300">•</span>
                        <span className="hidden md:inline text-rose-200">A Sister Concern of Human Aid Bangladesh</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <a href="tel:01324251510" className="flex items-center gap-1.5 hover:text-rose-200 transition-colors">
                            <PhoneCall className="w-3.5 h-3.5 text-rose-300" />
                            <span>Hotline: <strong className="underline text-white font-mono">01324-251510</strong></span>
                        </a>
                        <span className="text-rose-400/60 hidden sm:inline">•</span>
                        <a
                            href={getWhatsAppUrl('01324251510', 'Hello Human Aid Hospital / Sadhinota Blood Bank. I need blood assistance.')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600/50 hover:bg-emerald-600 border border-emerald-400/40 px-2.5 py-0.5 rounded-full text-emerald-100 hover:text-white transition-all"
                            title="Chat or Call on WhatsApp"
                        >
                            <MessageCircle className="w-3 h-3 text-emerald-300" />
                            <span>WhatsApp: 01324-251510</span>
                        </a>
                        <span className="text-rose-400/60 hidden sm:inline">•</span>
                        <a
                            href="https://www.facebook.com/sbtc107"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600/40 hover:bg-blue-600/70 border border-blue-400/30 px-2.5 py-0.5 rounded-full text-blue-200 hover:text-white transition-all"
                        >
                            <ExternalLink className="w-3 h-3" />
                            <span>fb.com/sbtc107</span>
                        </a>
                        {authUser && (
                            <>
                                <span className="text-rose-400/60 hidden md:inline">•</span>
                                <Link href="/dashboard" className="text-white hover:text-rose-200 font-bold flex items-center gap-1">
                                    <LayoutDashboard className="w-3.5 h-3.5 text-rose-300" />
                                    <span>Portal ({authUser.name})</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Hospital Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Transfusion Center Branding with Single Clean Logo */}
                        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('overview')}>
                            <div className="h-12 w-12 sm:h-14 sm:w-14 p-1 rounded-2xl bg-white shadow-md border-2 border-rose-200 overflow-hidden shrink-0 flex items-center justify-center transition-transform hover:scale-105">
                                <img src="/images/logo.png" alt="রক্ত দিন, জীবন বাঁচান" className="h-full w-auto object-contain" />
                            </div>
                            <div className="shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight whitespace-nowrap">
                                        Sadhinota <span className="text-rose-600">Blood Transfusion Center</span>
                                    </h1>
                                </div>
                                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                                    <span className="bg-rose-100 px-2 py-0.5 rounded-full text-[10px] text-rose-800 font-bold">Human Aid BD</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500 font-medium hidden xl:inline">Mirpur, Dhaka</span>
                                </p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-slate-100/90 p-1 xl:p-1.5 rounded-2xl border border-slate-200/80 text-xs xl:text-sm font-semibold text-slate-650 shrink-0">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'overview'
                                         ? 'bg-white text-rose-600 shadow-xs font-bold'
                                         : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('emergency')}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'emergency'
                                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 font-bold'
                                        : 'text-rose-700 hover:bg-rose-50'
                                }`}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${activeTab === 'emergency' ? 'bg-white' : 'bg-rose-600'}`}></span>
                                </span>
                                SOS Board
                                {stats?.active_requests > 0 && (
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'emergency' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-700'}`}>
                                        {stats.active_requests}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('donors')}
                                className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'donors'
                                         ? 'bg-white text-rose-600 shadow-xs font-bold'
                                         : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                Donors
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'inventory'
                                         ? 'bg-white text-rose-600 shadow-xs font-bold'
                                         : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                Blood Stock
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('board');
                                    setSelectedCommittee('Board Member');
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'board' && selectedCommittee === 'Board Member'
                                        ? 'bg-white text-rose-600 shadow-xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                <Users className="w-3.5 h-3.5 text-rose-500" />
                                <span>Board Member</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('board');
                                    setSelectedCommittee('Advisor panel');
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'board' && selectedCommittee === 'Advisor panel'
                                        ? 'bg-white text-rose-600 shadow-xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                                <span>Advisor Panel</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'gallery'
                                        ? 'bg-white text-rose-600 shadow-xs font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                <Camera className="w-3.5 h-3.5 text-rose-500" />
                                <span>Gallery</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('compatibility')}
                                className={`px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === 'compatibility'
                                         ? 'bg-white text-rose-600 shadow-xs font-bold'
                                         : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                Matrix
                            </button>
                        </nav>

                        {/* Action CTA Buttons & Auth Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setIsRequestModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                            >
                                <AlertCircle className="w-4 h-4" />
                                <span>SOS Blood</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('register')}
                                className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                            >
                                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                                <span>Join Donor</span>
                            </button>

                            {/* Dynamic Portal / Logout Section: only visible when staff is authenticated */}
                            {authUser && (
                                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 shrink-0">
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all whitespace-nowrap"
                                        title={`Logged in as ${authUser.name}`}
                                    >
                                        <LayoutDashboard className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Portal</span>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200"
                                        title="Log Out"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation bar */}
                    <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-100 gap-2 no-scrollbar text-xs font-semibold">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'overview' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('emergency')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${activeTab === 'emergency' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-100 text-rose-800'}`}
                        >
                            <span>SOS Alerts ({stats?.active_requests})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('donors')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'donors' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            Donors ({stats?.available_donors})
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'inventory' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            Blood Stock
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('board');
                                setSelectedCommittee('Board Member');
                            }}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${activeTab === 'board' && selectedCommittee === 'Board Member' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Board Member</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('board');
                                setSelectedCommittee('Advisor panel');
                            }}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${activeTab === 'board' && selectedCommittee === 'Advisor panel' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Advisor Panel</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('gallery')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1 ${activeTab === 'gallery' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Gallery</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'register' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            Join as Donor
                        </button>
                        <button
                            onClick={() => setActiveTab('compatibility')}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'compatibility' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-100 text-slate-700'}`}
                        >
                            Compatibility
                        </button>
                    </div>
                </div>
            </header>

            {/* Flash Message Toast */}
            {successMessage && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <p className="text-sm font-semibold">{successMessage}</p>
                        </div>
                        <button onClick={() => router.reload()} className="text-emerald-700 hover:text-emerald-900">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <p className="text-sm font-semibold">{errorMessage}</p>
                        </div>
                        <button onClick={() => router.reload()} className="text-rose-700 hover:text-rose-900">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 1. OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-12 pb-16">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
                        <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                                    {/* Official Slogan & Center Banner */}
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 text-xs font-bold tracking-wide shadow-xs border border-rose-200">
                                        <Droplet className="w-4 h-4 text-rose-600 fill-rose-600" />
                                        <span className="text-rose-700 font-extrabold text-sm">রক্ত দিন, জীবন বাঁচান</span>
                                        <span className="text-rose-300">•</span>
                                        <span className="text-slate-600 hidden sm:inline">Sadhinota Blood Transfusion Center (SBTC)</span>
                                    </div>

                                    {/* Featured Logo Artwork Display */}
                                    <div className="flex items-center gap-5 bg-white/95 p-4 rounded-3xl border border-rose-200 shadow-sm max-w-xl">
                                        <img src="/images/logo.png" alt="রক্ত দিন জীবন বাঁচান" className="h-20 sm:h-24 w-auto object-contain drop-shadow-sm shrink-0" />
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                                A Sister Concern of Human Aid Bangladesh
                                            </span>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                                                স্বাধীনতা ব্লাড ট্রান্সফিউশন সেন্টার
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                মিরপুর দারুস সালামে ২৪ ঘণ্টা সম্পূর্ণ নিরাপদ রক্তদান, স্ক্রিনিং ও ক্রস ম্যাচিং সেবা।
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-base sm:text-lg text-slate-650 max-w-2xl leading-relaxed">
                                        Connect directly with voluntary blood donors, check real-time hospital blood bank reserves, and post urgent SOS transfusion alerts for ICU, emergency surgeries, and thalassemia patients.
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                                        <button
                                            onClick={() => setActiveTab('donors')}
                                            className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-600/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                                        >
                                            <Search className="w-5 h-5" />
                                            <span>Find Ready Donors</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('register')}
                                            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                                        >
                                            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                                            <span>Join Donor Registry</span>
                                        </button>
                                    </div>

                                    {/* Blood Group Quick Pill Filter */}
                                    <div className="pt-4 space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Quick Match by Blood Group:</p>
                                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                            {BLOOD_GROUPS.map((bg) => (
                                                <button
                                                    key={bg}
                                                    onClick={() => {
                                                        setSelectedGroup(bg);
                                                        setActiveTab('donors');
                                                    }}
                                                    className="w-11 h-11 rounded-xl font-black text-sm bg-white hover:bg-rose-600 hover:text-white text-slate-800 border border-slate-200 hover:border-rose-600 shadow-xs transition-all flex items-center justify-center group"
                                                >
                                                    <span className="group-hover:scale-110 transition-transform">{bg}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Hero Visual / Live Hospital Status Card */}
                                <div className="lg:col-span-5">
                                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
                                        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Live Hospital Status</span>
                                                <h3 className="text-xl font-black text-slate-900 mt-0.5">Human Aid Blood Bank</h3>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                24/7 Active
                                            </div>
                                        </div>

                                        {/* 4 Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4 my-6">
                                            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
                                                <div className="flex items-center justify-between text-rose-600 mb-2">
                                                    <Users className="w-5 h-5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded">Donors</span>
                                                </div>
                                                <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.total_donors || 0}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5">Registered Heroes</div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                                                <div className="flex items-center justify-between text-emerald-600 mb-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded">Ready</span>
                                                </div>
                                                <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.available_donors || 0}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5">Available Immediately</div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                                                <div className="flex items-center justify-between text-amber-600 mb-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded">Urgent</span>
                                                </div>
                                                <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.active_requests || 0}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5">Active SOS Requests</div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                                                <div className="flex items-center justify-between text-blue-600 mb-2">
                                                    <Package className="w-5 h-5" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded">Stock</span>
                                                </div>
                                                <div className="text-2xl sm:text-3xl font-black text-slate-900">{stats?.total_units_in_bank || 0}</div>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5">Units in Hospital Bank</div>
                                            </div>
                                        </div>

                                        {/* Critical shortages banner */}
                                        {stats?.critical_groups && stats.critical_groups.length > 0 && (
                                            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                                    <span className="text-xs text-red-900 font-bold">
                                                        Urgent Shortage: {stats.critical_groups.join(', ')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTab('register')}
                                                    className="text-xs font-bold text-red-700 hover:text-red-900 underline"
                                                >
                                                    Donate Now
                                                </button>
                                            </div>
                                        )}

                                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                            <span>Blood Bank Ward: Level 2, Room 204</span>
                                            <button
                                                onClick={() => setActiveTab('inventory')}
                                                className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                            >
                                                Full Stock Ledger <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Active Emergency Requests Section */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        Active Emergency SOS Requests
                                    </h2>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                    Patients currently in Human Aid Hospital ICU, OT, or pediatric wing needing immediate blood.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsRequestModalOpen(true)}
                                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-sm hover:bg-rose-700 transition-all flex items-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" /> Post New Request
                                </button>
                                <button
                                    onClick={() => setActiveTab('emergency')}
                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                                >
                                    View All ({activeRequests.length})
                                </button>
                            </div>
                        </div>

                        {activeRequests.length === 0 ? (
                            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-800">No Pending Emergency Requests</h3>
                                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                                    All current hospital blood demands have been fulfilled. Thank you to our generous donors!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeRequests.slice(0, 3).map((req) => (
                                    <div
                                        key={req.id}
                                        className="bg-white rounded-3xl p-6 border-2 border-rose-200 hover:border-rose-400 transition-all shadow-md shadow-rose-900/5 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-600/30">
                                                        {req.blood_group}
                                                    </span>
                                                    <div>
                                                        <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                                            {req.request_code}
                                                        </span>
                                                        <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                                                            {req.patient_name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    req.urgency.includes('Critical')
                                                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {req.urgency}
                                                </span>
                                            </div>

                                            <div className="space-y-2.5 text-xs text-slate-650 bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">Location:</span>
                                                    <span className="font-bold text-slate-800">{req.hospital_name} • {req.hospital_ward_bed}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">Units Needed:</span>
                                                    <span className="font-bold text-rose-600">{req.units_needed} Bag(s) ({req.units_received} received)</span>
                                                </div>
                                                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60">
                                                    <span className="text-slate-500">Reason:</span>
                                                    <span className="font-medium text-slate-700 text-right">{req.medical_reason}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-slate-100">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">Attendant: <strong>{req.contact_person}</strong></span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <a
                                                    href={getWhatsAppUrl(
                                                        req.contact_phone,
                                                        `Assalamu Alaikum. I am responding to the emergency blood request for patient ${req.patient_name} (${req.blood_group} blood) at ${req.hospital_name}. Attendant: ${req.contact_person}. Reason: ${req.medical_reason}`
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs group"
                                                    title="Open WhatsApp to call or chat with attendant"
                                                >
                                                    <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                    <span>Call Now</span>
                                                    <span className="text-[10px] text-emerald-400 font-medium opacity-90">(WhatsApp)</span>
                                                </a>
                                                <button
                                                    onClick={() => setSelectedRequestToFulfill(req)}
                                                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Fulfill / Match
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Blood Bank Live Stock Snapshot */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-2">
                                            <Package className="w-3.5 h-3.5" />
                                            <span>Hospital Transfusion Laboratory</span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                            Human Aid Hospital Blood Bank Stock
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Real-time inventory levels of tested and processed blood bags ready for surgery and transfusion.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('inventory')}
                                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all"
                                    >
                                        Manage Inventory
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                                    {inventory.map((item) => {
                                        const isCritical = item.units_available <= item.critical_threshold;
                                        const isLow = !isCritical && item.units_available < item.safe_threshold;
                                        return (
                                            <div
                                                key={item.blood_group}
                                                className={`p-4 rounded-2xl border transition-all text-center ${
                                                    isCritical
                                                        ? 'bg-rose-950/40 border-rose-500/50 text-white ring-1 ring-rose-500/30'
                                                        : isLow
                                                        ? 'bg-amber-950/30 border-amber-500/40 text-white'
                                                        : 'bg-slate-800/80 border-slate-700 text-white'
                                                }`}
                                            >
                                                <div className="text-2xl font-black text-rose-400">{item.blood_group}</div>
                                                <div className="text-3xl font-black mt-1 mb-1">{item.units_available}</div>
                                                <div className="text-[11px] font-semibold text-slate-400">Bags</div>
                                                <div className="mt-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        isCritical
                                                            ? 'bg-rose-600 text-white animate-pulse'
                                                            : isLow
                                                            ? 'bg-amber-500 text-slate-950'
                                                            : 'bg-emerald-500/20 text-emerald-300'
                                                    }`}>
                                                        {item.stock_status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works & Safety Guidelines */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Safe & Ethical Practice</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                                Why Donate at Human Aid Hospital?
                            </h2>
                            <p className="text-sm text-slate-500 mt-2">
                                We maintain international WHO standards for blood safety, sterility, and donor health preservation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-lg">100% Free Screening</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Every donor receives complimentary screening for Hepatitis B/C, HIV, Malaria, Syphilis, and hemoglobin level checks before donation.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-lg">Digital Donor ID Card</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Registered donors receive an official digital donor card with QR verification, blood group badge, and emergency family blood priority.
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-slate-900 text-lg">Resting Period Protection</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Our system automatically locks your availability for 90 days after each donation to protect your iron stores and vitality.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Photo Gallery & Events Section on Overview */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-1">
                                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Activities & Partnerships</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    Photo Gallery & Collaborations
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Moments from Human Aid Bangladesh & Sadhinota Blood Transfusion Center events, partnerships, and research initiatives.
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                            >
                                <span>View All Photos</span>
                                <ArrowRight className="w-4 h-4 text-rose-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {GALLERY_ITEMS.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setLightboxItem(item)}
                                    className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img
                                            src={item.src}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-slate-900 text-xs font-bold backdrop-blur-xs">
                                                <ZoomIn className="w-3.5 h-3.5 text-rose-600" /> View Fullscreen
                                            </span>
                                        </div>
                                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-xs shadow-xs">
                                            {item.category}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                                            <span>{item.date}</span>
                                            <span className="text-rose-600 font-bold">HiRL • Human Aid</span>
                                        </div>
                                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Board of Directors & Visionary Leadership Section on Overview */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-1">
                                    <Users className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Leadership & Governance</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    Board of Directors & Visionary Leadership
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Dedicated trustees, hematologists, and leaders guiding Human Aid Bangladesh & Sadhinota Blood Transfusion Center.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleOpenCreateBoardMember}
                                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all border border-rose-200"
                                >
                                    <Plus className="w-4 h-4 text-rose-600" />
                                    <span>Add Member</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('board')}
                                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                                >
                                    <span>View All Board Members</span>
                                    <ArrowRight className="w-4 h-4 text-rose-400" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {boardMembers.slice(0, 3).map((member) => (
                                <div
                                    key={member.id}
                                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                        <img
                                            src={member.image_url}
                                            alt={member.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                                            <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-xs shadow-xs">
                                                {member.committee}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                                                {member.designation}
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                                                {member.name}
                                            </h3>
                                            {member.message && (
                                                <p className="text-xs text-slate-600 mt-2 line-clamp-3 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    "{member.message}"
                                                </p>
                                            )}
                                        </div>
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <button
                                                onClick={() => setSelectedBoardMember(member)}
                                                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                            >
                                                <span>Read Vision</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                            {member.phone && (
                                                <a
                                                    href={getWhatsAppUrl(member.phone, `Assalamu Alaikum ${member.name}. Contacting regarding Human Aid Bangladesh & Sadhinota Blood Transfusion Center.`)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                                >
                                                    <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {/* TAB CONTENT: 2. DONORS DIRECTORY */}
            {activeTab === 'donors' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Voluntary Blood Donor Directory
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Verified donors ready to respond for Human Aid Hospital patients.
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab('register')}
                            className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-sm hover:bg-rose-700 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Register New Donor
                        </button>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-6 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    placeholder="Search by donor name, phone, area, donor code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <select
                                    value={selectedAvailability}
                                    onChange={(e) => setSelectedAvailability(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                >
                                    <option value="ALL">All Availability (Any)</option>
                                    <option value="available">Available Now</option>
                                    <option value="resting">In Resting Period</option>
                                </select>
                            </div>

                            <div className="md:col-span-3">
                                <select
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                >
                                    <option value="ALL">All Areas (Dhaka / Outstation)</option>
                                    {areas.map((a) => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Blood Group Chips */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5" /> Blood Group:
                            </span>
                            <button
                                onClick={() => setSelectedGroup('ALL')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    selectedGroup === 'ALL'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                All Groups
                            </button>
                            {BLOOD_GROUPS.map((bg) => (
                                <button
                                    key={bg}
                                    onClick={() => setSelectedGroup(bg)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        selectedGroup === bg
                                            ? 'bg-rose-600 text-white shadow-xs'
                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                >
                                    {bg}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Donors Grid */}
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                        <span>Showing {filteredDonors.length} registered donors</span>
                    </div>

                    {filteredDonors.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-800">No matching donors found</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                Try clearing your search query or selecting a different blood group.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedGroup('ALL');
                                    setSelectedAvailability('ALL');
                                    setSelectedArea('ALL');
                                }}
                                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDonors.map((donor) => (
                                <div
                                    key={donor.id}
                                    className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-600/20">
                                                    {donor.blood_group}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400">
                                                        {donor.donor_code}
                                                    </span>
                                                    <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                                                        {donor.name}
                                                    </h3>
                                                    <span className="text-xs text-slate-500">
                                                        {donor.age} yrs • {donor.gender} {donor.weight ? `• ${donor.weight}kg` : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                donor.is_available
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {donor.is_available ? 'Available' : 'Resting'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-xs text-slate-650 bg-slate-50 p-3.5 rounded-2xl mb-4 border border-slate-100">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="font-medium truncate">{donor.area}, {donor.district}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 flex items-center gap-1">
                                                    <Award className="w-3.5 h-3.5 text-rose-500" /> Total Donations:
                                                </span>
                                                <span className="font-bold text-slate-900">{donor.total_donations} times</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Last Donated:
                                                </span>
                                                <span className="font-medium text-slate-800">
                                                    {donor.last_donated_at ? new Date(donor.last_donated_at).toLocaleDateString() : 'Never / First Timer'}
                                                </span>
                                            </div>
                                        </div>

                                        {donor.notes && (
                                            <p className="text-xs text-slate-500 italic mb-4 line-clamp-1">
                                                "{donor.notes}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 pt-3 border-t border-slate-100">
                                        <div className="grid grid-cols-2 gap-2">
                                            <a
                                                href={getWhatsAppUrl(
                                                    donor.phone,
                                                    `Assalamu Alaikum ${donor.name}. I found your voluntary blood donor profile (${donor.blood_group}) on Human Aid Hospital network. Are you currently available to donate blood?`
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs group"
                                                title="Open WhatsApp to call or chat with donor"
                                            >
                                                <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                <span>Call Donor</span>
                                                <span className="text-[10px] text-emerald-400 font-medium opacity-90">(WhatsApp)</span>
                                            </a>
                                            <button
                                                onClick={() => setSelectedDonorCard(donor)}
                                                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                            >
                                                <QrCode className="w-3.5 h-3.5 text-rose-600" /> Donor Card
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => toggleAvailability(donor.id)}
                                            className="w-full text-[11px] font-semibold text-slate-500 hover:text-slate-700 underline text-center pt-1"
                                        >
                                            Toggle Status ({donor.is_available ? 'Mark Resting' : 'Mark Available'})
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: 3. EMERGENCY SOS BOARD */}
            {activeTab === 'emergency' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    Emergency Transfusion Alert Board
                                </h2>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Real-time hospital blood alerts requiring urgent volunteer donor matching.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsRequestModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-600/30 hover:bg-rose-700 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Raise Emergency Request
                        </button>
                    </div>

                    {/* Active Requests Grid */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
                                {activeRequests.length} Active
                            </span>
                            <span>Pending Inpatient Blood Demands</span>
                        </h3>

                        {activeRequests.length === 0 ? (
                            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                <h4 className="font-bold text-slate-800 text-lg">No Active Emergency Requests</h4>
                                <p className="text-xs text-slate-500 mt-1">All blood requests have been fulfilled.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="bg-white rounded-3xl p-6 border-2 border-rose-300 shadow-lg shadow-rose-950/5 relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-rose-600/30">
                                                    {req.blood_group}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                                                        {req.request_code}
                                                    </span>
                                                    <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                                                        {req.patient_name}
                                                    </h3>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {req.hospital_name} • <strong className="text-slate-800">{req.hospital_ward_bed}</strong>
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                                                {req.urgency}
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2 text-xs text-slate-700 mb-5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Medical Condition:</span>
                                                <span className="font-bold text-slate-900">{req.medical_reason}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">Units Needed:</span>
                                                <span className="font-black text-rose-600 text-sm">{req.units_needed} Bag(s) ({req.units_received} Arranged)</span>
                                            </div>
                                            {req.additional_instructions && (
                                                <div className="pt-2 border-t border-rose-200/50 text-slate-600 italic">
                                                    "{req.additional_instructions}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="text-xs">
                                                <span className="text-slate-400">Contact:</span>{' '}
                                                <span className="font-bold text-slate-800">{req.contact_person}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={getWhatsAppUrl(
                                                        req.contact_phone,
                                                        `Assalamu Alaikum. I am responding to the emergency blood request for patient ${req.patient_name} (${req.blood_group} blood) at ${req.hospital_name}. Attendant: ${req.contact_person}. Reason: ${req.medical_reason}`
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs group"
                                                    title="Open WhatsApp to call or chat with attendant"
                                                >
                                                    <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                    <span>Call ({req.contact_phone})</span>
                                                    <span className="text-[10px] text-emerald-400 font-medium opacity-90">(WhatsApp)</span>
                                                </a>
                                                <button
                                                    onClick={() => setSelectedRequestToFulfill(req)}
                                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Fulfill
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recently Fulfilled History */}
                    {fulfilledRequests.length > 0 && (
                        <div className="space-y-4 pt-6 border-t border-slate-200">
                            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recently Fulfilled Cases
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {fulfilledRequests.map((fReq) => (
                                    <div key={fReq.id} className="p-4 rounded-2xl bg-white border border-slate-200 opacity-80 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-slate-500">{fReq.request_code}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                                Fulfilled
                                            </span>
                                        </div>
                                        <div className="font-bold text-slate-800 text-sm">{fReq.patient_name} ({fReq.blood_group})</div>
                                        <div className="text-slate-500">{fReq.medical_reason}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: 4. BLOOD BANK INVENTORY */}
            {activeTab === 'inventory' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Hospital Blood Bank Ledger & Stock
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Live inventory counts for whole blood and components in Human Aid Hospital laboratory refrigeration.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-semibold">Total Stock: <strong className="text-slate-900 text-sm">{stats?.total_units_in_bank} Units</strong></span>
                        </div>
                    </div>

                    {/* 8 Blood Groups Inventory Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {inventory.map((item) => {
                            const isCritical = item.units_available <= item.critical_threshold;
                            const isLow = !isCritical && item.units_available < item.safe_threshold;
                            return (
                                <div
                                    key={item.blood_group}
                                    className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-sm ${
                                        isCritical
                                            ? 'border-rose-400 bg-rose-50/20'
                                            : isLow
                                            ? 'border-amber-300'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-rose-600/30">
                                            {item.blood_group}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            isCritical
                                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                                : isLow
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {item.stock_status} Status
                                        </span>
                                    </div>

                                    <div className="space-y-1 mb-5">
                                        <div className="text-3xl font-black text-slate-900">
                                            {item.units_available}{' '}
                                            <span className="text-sm font-semibold text-slate-400">Bags / Units</span>
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            Safe target: <strong>{item.safe_threshold} bags</strong> | Critical: <strong>{item.critical_threshold} bags</strong>
                                        </div>
                                    </div>

                                    {/* Stock progress bar */}
                                    <div className="space-y-1 mb-5">
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isCritical ? 'bg-rose-600' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.min(100, (item.units_available / (item.safe_threshold * 1.5)) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                            <span>Reserve meter</span>
                                            <span>Last restocked: {item.last_restocked_at ? new Date(item.last_restocked_at).toLocaleDateString() : 'Recent'}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setIsStockModalOpen(item)}
                                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Adjust Stock (+ / -)
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 5. REGISTER AS DONOR */}
            {activeTab === 'register' && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                            <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                            <span>Become a Lifesaver</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Register as a Human Aid Voluntary Donor
                        </h2>
                        <p className="text-sm text-slate-500 max-w-xl mx-auto">
                            Join our verified donor directory. You will only be contacted when a patient at Human Aid Hospital or nearby emergency requires your blood group.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
                        <form onSubmit={handleDonorSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Tanvir Ahmed"
                                        value={donorForm.data.name}
                                        onChange={(e) => donorForm.setData('name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                    />
                                    {donorForm.errors.name && <p className="text-xs text-rose-600 mt-1">{donorForm.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Blood Group *
                                    </label>
                                    <select
                                        value={donorForm.data.blood_group}
                                        onChange={(e) => donorForm.setData('blood_group', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-rose-700 focus:bg-white focus:outline-rose-600"
                                    >
                                        {BLOOD_GROUPS.map((bg) => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                    {donorForm.errors.blood_group && <p className="text-xs text-rose-600 mt-1">{donorForm.errors.blood_group}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Mobile Phone (Emergency WhatsApp / Call) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. +880 1711-234567"
                                        value={donorForm.data.phone}
                                        onChange={(e) => donorForm.setData('phone', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                    />
                                    {donorForm.errors.phone && <p className="text-xs text-rose-600 mt-1">{donorForm.errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="e.g. donor@gmail.com"
                                        value={donorForm.data.email}
                                        onChange={(e) => donorForm.setData('email', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Gender & Age *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={donorForm.data.gender}
                                            onChange={(e) => donorForm.setData('gender', e.target.value)}
                                            className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <input
                                            type="number"
                                            min="18"
                                            max="65"
                                            required
                                            placeholder="Age (18-65)"
                                            value={donorForm.data.age}
                                            onChange={(e) => donorForm.setData('age', parseInt(e.target.value) || 18)}
                                            className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                        />
                                    </div>
                                    {donorForm.errors.age && <p className="text-xs text-rose-600 mt-1">{donorForm.errors.age}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Body Weight (kg) *
                                    </label>
                                    <input
                                        type="number"
                                        min="45"
                                        max="200"
                                        placeholder="Weight in kg (min 45 kg)"
                                        value={donorForm.data.weight}
                                        onChange={(e) => donorForm.setData('weight', parseInt(e.target.value) || 50)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                    />
                                    {donorForm.errors.weight && <p className="text-xs text-rose-600 mt-1">{donorForm.errors.weight}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        District & City Area *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="District (e.g. Dhaka)"
                                            required
                                            value={donorForm.data.district}
                                            onChange={(e) => donorForm.setData('district', e.target.value)}
                                            className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Area (e.g. Mirpur)"
                                            required
                                            value={donorForm.data.area}
                                            onChange={(e) => donorForm.setData('area', e.target.value)}
                                            className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Last Blood Donation Date (If Any)
                                    </label>
                                    <input
                                        type="date"
                                        value={donorForm.data.last_donated_at}
                                        onChange={(e) => donorForm.setData('last_donated_at', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                    />
                                    <span className="text-[11px] text-slate-400 mt-1 block">Leave empty if you have never donated blood before.</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Full Address & Nearby Landmark
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Street, House No, Road, Landmark..."
                                    value={donorForm.data.address}
                                    onChange={(e) => donorForm.setData('address', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-rose-600"
                                />
                            </div>

                            {/* Eligibility confirmation checkbox */}
                            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="agreeEligible"
                                    required
                                    className="w-4 h-4 mt-0.5 accent-rose-600"
                                />
                                <label htmlFor="agreeEligible" className="text-xs text-slate-700 leading-normal cursor-pointer">
                                    I confirm that I am in good physical health, weigh at least 45 kg, have no communicable blood-borne conditions, and voluntarily consent to be listed as a donor for Human Aid Hospital.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={donorForm.processing}
                                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Heart className="w-5 h-5 fill-white" />
                                <span>{donorForm.processing ? 'Submitting Registration...' : 'Complete Donor Registration'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 6. COMPATIBILITY & CALCULATOR */}
            {activeTab === 'compatibility' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Clinical Transfusion Science</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                            Blood Compatibility & Eligibility Engine
                        </h2>
                        <p className="text-sm text-slate-500 mt-2">
                            Interactive tool to determine donor-recipient matching and calculate exact next eligible donation dates.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Compatibility Interactive Matrix */}
                        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Interactive Compatibility Matrix</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Select a blood group to see donor and recipient compatibility.</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-black text-sm">
                                    {compatSelectedGroup}
                                </span>
                            </div>

                            {/* Blood group selector pills */}
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {BLOOD_GROUPS.map((bg) => (
                                    <button
                                        key={bg}
                                        onClick={() => setCompatSelectedGroup(bg)}
                                        className={`py-3 rounded-2xl font-black text-sm transition-all ${
                                            compatSelectedGroup === bg
                                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600 ring-offset-2'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {bg}
                                    </button>
                                ))}
                            </div>

                            {/* Results: Can Donate To & Can Receive From */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <span>Can DONATE Blood To:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {COMPATIBILITY[compatSelectedGroup]?.canDonateTo.map((target) => (
                                            <span
                                                key={target}
                                                className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-black text-sm shadow-xs border border-emerald-200"
                                            >
                                                {target}
                                            </span>
                                        ))}
                                    </div>
                                    {compatSelectedGroup === 'O-' && (
                                        <p className="text-xs text-emerald-700 font-semibold pt-1">
                                            ⭐ <strong>Universal Red Cell Donor</strong>: O-Negative can be safely given to any patient in emergency surgery.
                                        </p>
                                    )}
                                </div>

                                <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-3">
                                    <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm">
                                        <Droplet className="w-5 h-5 text-blue-600 fill-blue-600" />
                                        <span>Can RECEIVE Blood From:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {COMPATIBILITY[compatSelectedGroup]?.canReceiveFrom.map((source) => (
                                            <span
                                                key={source}
                                                className="px-3 py-1.5 rounded-xl bg-white text-blue-900 font-black text-sm shadow-xs border border-blue-200"
                                            >
                                                {source}
                                            </span>
                                        ))}
                                    </div>
                                    {compatSelectedGroup === 'AB+' && (
                                        <p className="text-xs text-blue-700 font-semibold pt-1">
                                            ⭐ <strong>Universal Recipient</strong>: AB-Positive patients can receive red blood cells from all blood types.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Can I Donate Today? Calculator */}
                        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                            <div className="pb-4 border-b border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-rose-600" />
                                    <span>Am I Eligible to Donate Today?</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Quick clinical check based on WHO & National Blood Transfusion guidelines.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Your Age (Years)
                                    </label>
                                    <input
                                        type="number"
                                        min="15"
                                        max="80"
                                        value={calcAge}
                                        onChange={(e) => setCalcAge(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Your Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        min="30"
                                        max="150"
                                        value={calcWeight}
                                        onChange={(e) => setCalcWeight(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Date of Your Last Blood Donation
                                    </label>
                                    <input
                                        type="date"
                                        value={calcLastDonated}
                                        onChange={(e) => setCalcLastDonated(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">Leave empty if first-time donor.</span>
                                </div>
                            </div>

                            {/* Eligibility Verdict Card */}
                            <div className={`p-5 rounded-2xl border transition-all ${
                                eligibilityResult.isEligible
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                    : 'bg-rose-50 border-rose-300 text-rose-950'
                            }`}>
                                <div className="flex items-center gap-2 font-black text-base mb-1">
                                    {eligibilityResult.isEligible ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            <span>You are Eligible to Donate Today!</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 text-rose-600" />
                                            <span>Not Currently Eligible</span>
                                        </>
                                    )}
                                </div>

                                {eligibilityResult.isEligible ? (
                                    <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                                        Your health indicators match standard voluntary whole blood donation criteria. Visit Human Aid Hospital blood bank anytime today!
                                    </p>
                                ) : (
                                    <ul className="text-xs text-rose-800 space-y-1 list-disc list-inside mt-2">
                                        {eligibilityResult.reasons.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 7. DEDICATED PHOTO GALLERY TAB */}
            {activeTab === 'gallery' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-1">
                                <Camera className="w-3.5 h-3.5 text-rose-600" />
                                <span>Official Archives</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Human Aid Bangladesh & SBTC Photo Gallery
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Documenting historic agreements, blood donation camps, research partnerships, and medical outreach.
                            </p>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold bg-white px-3.5 py-2 rounded-xl border border-slate-200">
                            Total Photos: <strong className="text-slate-900">{GALLERY_ITEMS.length}</strong>
                        </div>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        {['ALL', 'Academic Partnership', 'MoU Signing', 'Ceremony', 'Research'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedGalleryCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    selectedGalleryCategory === cat
                                        ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {cat === 'ALL' ? 'All Photographs' : cat}
                            </button>
                        ))}
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {GALLERY_ITEMS
                            .filter((item) => selectedGalleryCategory === 'ALL' || item.category === selectedGalleryCategory)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setLightboxItem(item)}
                                    className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                        <img
                                            src={item.src}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-black text-xs shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <ZoomIn className="w-4 h-4 text-rose-600" /> Click to View Fullscreen
                                            </span>
                                        </div>
                                        <div className="absolute top-4 left-4 flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-md">
                                                {item.category}
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium">
                                                {item.date}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-rose-600">
                                            {item.subtitle}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: 8. DEDICATED BOARD MEMBERS / GOVERNING BODY TAB */}
            {activeTab === 'board' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-1">
                                <Users className="w-3.5 h-3.5 text-rose-600" />
                                <span>Human Aid Bangladesh & SBTC</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Board of Directors & Governing Body
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Meet the visionary leadership, founders, and healthcare consultants driving humanitarian blood transfusion in Bangladesh.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-slate-500 font-semibold bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
                                Total Members: <strong className="text-slate-900">{boardMembers.length}</strong>
                            </div>
                            <button
                                onClick={handleOpenCreateBoardMember}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all transform hover:-translate-y-0.5"
                            >
                                <Plus className="w-4 h-4" />
                                <span>+ Add Board Member</span>
                            </button>
                        </div>
                    </div>

                    {/* Only Two Panels: 1. Board Member, 2. Advisor panel */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="inline-flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-xs">
                            <button
                                onClick={() => setSelectedCommittee('Board Member')}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                                    selectedCommittee === 'Board Member'
                                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                            >
                                <Users className="w-4 h-4" />
                                <span>Board Member</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    selectedCommittee === 'Board Member' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {boardMembers.filter(m => m.committee === 'Board Member').length}
                                </span>
                            </button>

                            <button
                                onClick={() => setSelectedCommittee('Advisor panel')}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                                    selectedCommittee === 'Advisor panel'
                                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Advisor Panel</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    selectedCommittee === 'Advisor panel' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                    {boardMembers.filter(m => m.committee === 'Advisor panel').length}
                                </span>
                            </button>
                        </div>

                        <div className="text-xs text-slate-500 font-medium">
                            Panel: <strong className="text-slate-900 font-bold">{selectedCommittee}</strong> ({boardMembers.filter(m => m.committee === selectedCommittee).length} active members)
                        </div>
                    </div>

                    {/* Board Members Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {boardMembers
                            .filter((member) => member.committee === selectedCommittee)
                            .map((member) => (
                                <div
                                    key={member.id}
                                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                            <img
                                                src={member.image_url}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                                                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-md">
                                                    {member.committee}
                                                </span>
                                                {!member.is_active && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold">
                                                        Inactive (Hidden)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-3">
                                            <div>
                                                <span className="text-xs font-black uppercase tracking-wider text-rose-600 block">
                                                    {member.designation}
                                                </span>
                                                <h3 className="text-xl font-black text-slate-900 mt-0.5 group-hover:text-rose-600 transition-colors">
                                                    {member.name}
                                                </h3>
                                                <span className="text-xs text-slate-400 font-medium block">
                                                    {member.organization}
                                                </span>
                                            </div>

                                            {member.bio && (
                                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                    {member.bio}
                                                </p>
                                            )}

                                            {member.message && (
                                                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-slate-700 text-xs italic line-clamp-3 relative">
                                                    <Quote className="w-3.5 h-3.5 text-rose-300 inline mr-1" />
                                                    "{member.message}"
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="p-6 pt-0 space-y-3">
                                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                                            <button
                                                onClick={() => setSelectedBoardMember(member)}
                                                className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <span>Profile</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEditBoardMember(member)}
                                                className="py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-rose-200 shadow-xs"
                                                title="Edit Board Member Info"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                                                <span>Edit Info</span>
                                            </button>
                                            {member.phone ? (
                                                <a
                                                    href={getWhatsAppUrl(
                                                        member.phone,
                                                        `Assalamu Alaikum ${member.name}. Contacting you regarding Human Aid Bangladesh and Sadhinota Blood Transfusion Center.`
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-100" /> WhatsApp
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedBoardMember(member)}
                                                    className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                                                >
                                                    Full Bio
                                                </button>
                                            )}
                                        </div>

                                        {/* Dynamic Toggle / Delete Controls */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleBoardMember(member.id)}
                                                    className="hover:text-slate-700 font-semibold hover:underline"
                                                >
                                                    Status: <strong className={member.is_active ? 'text-emerald-600' : 'text-slate-500'}>{member.is_active ? 'Public' : 'Hidden'}</strong> ({member.is_active ? 'Hide' : 'Show'})
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteBoardMember(member.id)}
                                                className="text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* MODAL 1: EMERGENCY BLOOD REQUEST (SOS) */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">Post Urgent Blood Request (SOS)</h3>
                                    <p className="text-xs text-slate-500">Alerts will be broadcast on the live hospital board.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Patient Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Mst. Selina Begum"
                                        value={requestForm.data.patient_name}
                                        onChange={(e) => requestForm.setData('patient_name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Required Blood Group *
                                    </label>
                                    <select
                                        value={requestForm.data.blood_group}
                                        onChange={(e) => requestForm.setData('blood_group', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-rose-700 focus:bg-white"
                                    >
                                        {BLOOD_GROUPS.map((bg) => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Hospital Location *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Human Aid Hospital"
                                        value={requestForm.data.hospital_name}
                                        onChange={(e) => requestForm.setData('hospital_name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Ward / Bed / Department *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. ICU Bed 03, OT 2"
                                        value={requestForm.data.hospital_ward_bed}
                                        onChange={(e) => requestForm.setData('hospital_ward_bed', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Units Needed *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        required
                                        value={requestForm.data.units_needed}
                                        onChange={(e) => requestForm.setData('units_needed', parseInt(e.target.value) || 1)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Urgency Level *
                                    </label>
                                    <select
                                        value={requestForm.data.urgency}
                                        onChange={(e) => requestForm.setData('urgency', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-rose-700 focus:bg-white"
                                    >
                                        <option value="Critical Immediate">Critical Immediate (Now)</option>
                                        <option value="Urgent (Within 4 hrs)">Urgent (Within 4 hrs)</option>
                                        <option value="Standard (Today)">Standard (Today)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Contact Person *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Attendant / Doctor Name"
                                        value={requestForm.data.contact_person}
                                        onChange={(e) => requestForm.setData('contact_person', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Attendant Contact Phone *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="+880 17..."
                                        value={requestForm.data.contact_phone}
                                        onChange={(e) => requestForm.setData('contact_phone', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Medical Reason / Diagnosis *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Cesarean Delivery / Road Accident Trauma / Thalassemia"
                                    value={requestForm.data.medical_reason}
                                    onChange={(e) => requestForm.setData('medical_reason', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Additional Instructions
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Fresh blood preferred, cross-matching sample ready at Level 2 lab"
                                    value={requestForm.data.additional_instructions}
                                    onChange={(e) => requestForm.setData('additional_instructions', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={requestForm.processing}
                                className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md shadow-rose-600/30 transition-all"
                            >
                                {requestForm.processing ? 'Broadcasting...' : 'Broadcast SOS Request to Blood Board'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: DIGITAL DONOR ID CARD */}
            {selectedDonorCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Verified Donor Identity</span>
                            <button onClick={() => setSelectedDonorCard(null)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Physical Card Simulation */}
                        <div id="printableDonorCard" className="bg-gradient-to-br from-rose-900 via-rose-800 to-red-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-rose-700">
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-rose-600/20 rounded-full blur-2xl pointer-events-none"></div>

                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-rose-700/60">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                                        <img src="/images/logo.png" alt="Hospital Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-rose-300">Human Aid Hospital</div>
                                        <div className="text-sm font-black tracking-tight text-white">OFFICIAL DONOR CARD</div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-rose-200 bg-rose-800/80 px-2 py-0.5 rounded">রক্ত দিন, জীবন বাঁচান</span>
                            </div>

                            {/* Body */}
                            <div className="my-5 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="text-[10px] text-rose-300 font-mono">{selectedDonorCard.donor_code}</div>
                                    <h4 className="text-xl font-black text-white">{selectedDonorCard.name}</h4>
                                    <div className="text-xs text-rose-200">
                                        {selectedDonorCard.age} yrs • {selectedDonorCard.gender} • {selectedDonorCard.area}
                                    </div>
                                    <div className="text-xs text-rose-100 font-semibold pt-1">
                                        📞 {selectedDonorCard.phone}
                                    </div>
                                </div>

                                <div className="w-16 h-16 rounded-2xl bg-white text-rose-600 font-black text-3xl flex items-center justify-center shadow-lg border-2 border-rose-200 shrink-0">
                                    {selectedDonorCard.blood_group}
                                </div>
                            </div>

                            {/* QR Simulation & Verification Footer */}
                            <div className="pt-4 border-t border-rose-700/60 flex items-center justify-between text-xs">
                                <div>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Hospital Verified Donor</span>
                                    </div>
                                    <div className="text-[10px] text-rose-300 mt-0.5">
                                        Donations: <strong>{selectedDonorCard.total_donations} times</strong>
                                    </div>
                                </div>

                                {/* QR Placeholder Grid */}
                                <div className="w-10 h-10 bg-white p-1 rounded-lg flex items-center justify-center">
                                    <QrCode className="w-8 h-8 text-slate-900" />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <button
                                onClick={() => window.print()}
                                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" /> Print / Save PDF
                            </button>
                            <a
                                href={getWhatsAppUrl(
                                    selectedDonorCard.phone,
                                    `Assalamu Alaikum ${selectedDonorCard.name}. Contacting regarding your voluntary donor profile (${selectedDonorCard.blood_group}) at Human Aid Hospital.`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                title="Open WhatsApp Call / Chat"
                            >
                                <Phone className="w-3.5 h-3.5" /> Call via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: INVENTORY ADJUSTMENT */}
            {isStockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Blood Bank Ledger</span>
                                <h3 className="text-lg font-black text-slate-900 mt-0.5">Adjust Stock for {isStockModalOpen.blood_group}</h3>
                            </div>
                            <button onClick={() => setIsStockModalOpen(null)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleInventorySubmit} className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Current Stock in Bank:</span>
                                <span className="text-base font-black text-slate-900">{isStockModalOpen.units_available} Bags</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Action Type
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => inventoryForm.setData('action_type', 'add')}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                            inventoryForm.data.action_type === 'add'
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        + Add Bags (Inflow)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => inventoryForm.setData('action_type', 'deduct')}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                            inventoryForm.data.action_type === 'deduct'
                                                ? 'bg-rose-600 text-white border-rose-600'
                                                : 'bg-white text-slate-700 border-slate-200'
                                        }`}
                                    >
                                        - Deduct Bags (Surgery)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Number of Units / Bags *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    required
                                    value={inventoryForm.data.delta_units}
                                    onChange={(e) => inventoryForm.setData('delta_units', parseInt(e.target.value) || 1)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Department / Reason *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Voluntary Donation Camp / Emergency OT Surgery"
                                    value={inventoryForm.data.reason}
                                    onChange={(e) => inventoryForm.setData('reason', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={inventoryForm.processing}
                                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all"
                            >
                                {inventoryForm.processing ? 'Updating...' : 'Update Blood Bank Record'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: FULFILL / MATCH REQUEST */}
            {selectedRequestToFulfill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Hospital Match</span>
                                <h3 className="text-lg font-black text-slate-900 mt-0.5">Fulfill {selectedRequestToFulfill.request_code}</h3>
                            </div>
                            <button onClick={() => setSelectedRequestToFulfill(null)} className="text-slate-400 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs space-y-1">
                            <div>Patient: <strong>{selectedRequestToFulfill.patient_name}</strong></div>
                            <div>Required: <strong className="text-rose-600 text-sm">{selectedRequestToFulfill.blood_group}</strong> ({selectedRequestToFulfill.units_needed} Bags)</div>
                            <div>Location: {selectedRequestToFulfill.hospital_ward_bed}</div>
                        </div>

                        <form onSubmit={handleFulfillSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Optionally Assign Matching Donor:
                                </label>
                                <select
                                    value={fulfillForm.data.matched_donor_id}
                                    onChange={(e) => fulfillForm.setData('matched_donor_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white"
                                >
                                    <option value="">No specific registered donor (Arranged via bank)</option>
                                    {donors
                                        .filter((d) => d.blood_group === selectedRequestToFulfill.blood_group)
                                        .map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.blood_group}) - {d.phone} [{d.area}]
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={fulfillForm.processing}
                                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{fulfillForm.processing ? 'Processing...' : 'Mark as Successfully Fulfilled'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 5: FULLSCREEN PHOTO LIGHTBOX MODAL */}
            {lightboxItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setLightboxItem(null)}
                >
                    <div
                        className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Lightbox Header */}
                        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold">
                                        {lightboxItem.category}
                                    </span>
                                    <span className="text-xs text-slate-400">{lightboxItem.date}</span>
                                </div>
                                <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                                    {lightboxItem.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setLightboxItem(null)}
                                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Lightbox Image Container */}
                        <div className="relative bg-black flex items-center justify-center overflow-hidden max-h-[60vh]">
                            <img
                                src={lightboxItem.src}
                                alt={lightboxItem.title}
                                className="max-w-full max-h-[60vh] object-contain"
                            />
                        </div>

                        {/* Lightbox Footer & Navigation */}
                        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1 max-w-xl">
                                <span className="text-xs font-bold text-rose-600">{lightboxItem.subtitle}</span>
                                <p className="text-xs text-slate-650 leading-relaxed">
                                    {lightboxItem.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => {
                                        const currentIndex = GALLERY_ITEMS.findIndex((g) => g.id === lightboxItem.id);
                                        const prevIndex = (currentIndex - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
                                        setLightboxItem(GALLERY_ITEMS[prevIndex]);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Previous
                                </button>
                                <button
                                    onClick={() => {
                                        const currentIndex = GALLERY_ITEMS.findIndex((g) => g.id === lightboxItem.id);
                                        const nextIndex = (currentIndex + 1) % GALLERY_ITEMS.length;
                                        setLightboxItem(GALLERY_ITEMS[nextIndex]);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                                    <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <span className="text-lg font-black text-white leading-tight block">Human Aid Hospital</span>
                                    <span className="text-xs text-rose-400 font-bold block">রক্ত দিন, জীবন বাঁচান</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Diagnostic center, tertiary healthcare, and 24-hour voluntary blood transfusion network dedicated to saving lives across Bangladesh.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Services</h4>
                            <ul className="text-xs text-slate-400 space-y-2">
                                <li><button onClick={() => setActiveTab('donors')} className="hover:text-rose-400">Search Blood Donors</button></li>
                                <li><button onClick={() => setIsRequestModalOpen(true)} className="hover:text-rose-400">Emergency SOS Request</button></li>
                                <li><button onClick={() => setActiveTab('inventory')} className="hover:text-rose-400">Hospital Blood Reserves</button></li>
                                <li><button onClick={() => setActiveTab('compatibility')} className="hover:text-rose-400">Blood Compatibility Matrix</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Center Hotline & Social</h4>
                            <ul className="text-xs text-slate-400 space-y-2">
                                <li>Emergency Mobile: <a href="tel:01324251510" className="text-rose-400 font-bold hover:underline font-mono">01324-251510</a></li>
                                <li>Email: <a href="mailto:humanaidoffice@gmail.com" className="text-white hover:underline">humanaidoffice@gmail.com</a></li>
                                <li>Facebook: <a href="https://www.facebook.com/sbtc107" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 mt-1 font-semibold"><ExternalLink className="w-3 h-3" /> fb.com/sbtc107</a></li>
                                <li>Service Hours: <strong className="text-emerald-400">Always Open (24 Hours)</strong></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Official Center Address</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong className="text-white block">Sadhinota Blood Transfusion Center</strong>
                                House-#54 Darus Salam Rd,<br />
                                Mirpur, Dhaka 1216, Bangladesh<br />
                                <span className="text-[11px] text-slate-500 block mt-1">A sister concern of Human Aid Bangladesh</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                        <p>© {new Date().getFullYear()} Human Aid Hospital. All rights reserved. Laravel + Inertia + MySQL.</p>
                        <div className="flex items-center gap-4">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Blood Bank Server Online
                            </span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* MODAL 5: BOARD MEMBER PROFILE & VISION STATEMENT */}
            {selectedBoardMember && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedBoardMember(null)}
                >
                    <div
                        className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image & Designation */}
                        <div className="relative bg-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border-2 border-rose-500 shadow-xl">
                                <img
                                    src={selectedBoardMember.image_url}
                                    alt={selectedBoardMember.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="space-y-1.5 text-center sm:text-left flex-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black inline-block">
                                    {selectedBoardMember.committee}
                                </span>
                                <h3 className="text-2xl font-black text-white leading-tight">
                                    {selectedBoardMember.name}
                                </h3>
                                <p className="text-xs font-bold text-rose-300">
                                    {selectedBoardMember.designation}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {selectedBoardMember.organization}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedBoardMember(null)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Details */}
                        <div className="p-6 sm:p-8 space-y-6">
                            {selectedBoardMember.message && (
                                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700">
                                        <Quote className="w-4 h-4 text-rose-500" />
                                        <span>Keynote Message & Vision for Blood Transfusion Safety</span>
                                    </div>
                                    <p className="text-sm text-slate-800 leading-relaxed italic">
                                        "{selectedBoardMember.message}"
                                    </p>
                                </div>
                            )}

                            {selectedBoardMember.bio && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Biography & Professional Background
                                    </h4>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {selectedBoardMember.bio}
                                    </p>
                                </div>
                            )}

                            {/* Contact & Coordination */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                                <div className="text-xs space-y-0.5">
                                    <span className="text-slate-400 block font-semibold">Direct Secretariat Contact:</span>
                                    <span className="font-bold text-slate-800 font-mono">
                                        {selectedBoardMember.phone || '01324-251510 (Hotline)'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedBoardMember.phone && (
                                        <a
                                            href={getWhatsAppUrl(
                                                selectedBoardMember.phone,
                                                `Assalamu Alaikum ${selectedBoardMember.name}. Contacting regarding Human Aid Hospital and Sadhinota Blood Transfusion Center.`
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                                        >
                                            <MessageCircle className="w-4 h-4" /> Message on WhatsApp
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            const mem = selectedBoardMember;
                                            setSelectedBoardMember(null);
                                            handleOpenEditBoardMember(mem);
                                        }}
                                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-200"
                                        title="Edit this board member's profile"
                                    >
                                        <Edit3 className="w-4 h-4 text-rose-600" />
                                        <span>Edit Info</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedBoardMember(null)}
                                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 6: DYNAMIC BOARD MEMBER MANAGEMENT (ADD / EDIT) */}
            {isManageBoardModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsManageBoardModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl overflow-hidden max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6 p-6 sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        {editingBoardMember ? 'Edit Board Member' : 'Add New Board Member'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Dynamic backend and frontend board administration.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsManageBoardModalOpen(false)}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitBoardMember} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={boardForm.data.name}
                                        onChange={(e) => boardForm.setData('name', e.target.value)}
                                        placeholder="e.g. Alhaj Md. Abdus Salam"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Designation *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={boardForm.data.designation}
                                        onChange={(e) => boardForm.setData('designation', e.target.value)}
                                        placeholder="e.g. Chairman & Founder Trustee"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Committee / Body
                                    </label>
                                    <select
                                        value={boardForm.data.committee}
                                        onChange={(e) => boardForm.setData('committee', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    >
                                        <option value="Board Member">Board Member</option>
                                        <option value="Advisor panel">Advisor Panel</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={boardForm.data.display_order}
                                        onChange={(e) => boardForm.setData('display_order', parseInt(e.target.value) || 1)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Phone / WhatsApp Number
                                    </label>
                                    <input
                                        type="text"
                                        value={boardForm.data.phone}
                                        onChange={(e) => boardForm.setData('phone', e.target.value)}
                                        placeholder="+880 1811-445566"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={boardForm.data.email}
                                        onChange={(e) => boardForm.setData('email', e.target.value)}
                                        placeholder="board@humanaidbd.org"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Upload Photo (or image URL)
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                boardForm.setData('image', e.target.files[0]);
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-650 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:text-xs file:font-bold hover:file:bg-slate-800"
                                    />
                                    <input
                                        type="text"
                                        value={boardForm.data.image_url}
                                        onChange={(e) => boardForm.setData('image_url', e.target.value)}
                                        placeholder="Or paste image URL (e.g. /images/board/board_leader.png)"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-rose-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Vision Statement / Speech
                                </label>
                                <textarea
                                    rows={2}
                                    value={boardForm.data.message}
                                    onChange={(e) => boardForm.setData('message', e.target.value)}
                                    placeholder="Key vision statement or speech on blood transfusion mission..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-rose-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Biography
                                </label>
                                <textarea
                                    rows={2}
                                    value={boardForm.data.bio}
                                    onChange={(e) => boardForm.setData('bio', e.target.value)}
                                    placeholder="Brief professional profile and background..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-rose-600"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsManageBoardModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={boardForm.processing}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
                                >
                                    {boardForm.processing ? 'Saving...' : editingBoardMember ? 'Update Board Member' : 'Save Board Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
