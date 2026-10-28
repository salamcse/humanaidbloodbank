import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { dashboard, home } from '@/routes';
import {
    Users,
    Heart,
    AlertCircle,
    Package,
    ArrowRight,
    ExternalLink,
    ShieldCheck,
    Plus,
    Trash2,
    CheckCircle2,
    Edit3,
    X,
    Upload,
    Camera
} from 'lucide-react';

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
    boardMembers: BoardMember[];
    donorsCount: number;
    requestsCount: number;
    inventoryCount: number;
}

export default function Dashboard({
    boardMembers = [],
    donorsCount = 0,
    requestsCount = 0,
    inventoryCount = 0,
}: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<BoardMember | null>(null);

    const form = useForm<{
        name: string;
        designation: string;
        organization: string;
        committee: string;
        bio: string;
        message: string;
        phone: string;
        email: string;
        social_facebook: string;
        social_linkedin: string;
        display_order: number;
        image_url: string;
        image: File | null;
    }>({
        name: '',
        designation: '',
        organization: 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
        committee: 'Board Member',
        bio: '',
        message: '',
        phone: '',
        email: '',
        social_facebook: '',
        social_linkedin: '',
        display_order: 1,
        image_url: '',
        image: null,
    });

    const handleOpenAdd = () => {
        setEditingMember(null);
        form.setData({
            name: '',
            designation: '',
            organization: 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
            committee: 'Board Member',
            bio: '',
            message: '',
            phone: '',
            email: '',
            social_facebook: '',
            social_linkedin: '',
            display_order: boardMembers.length + 1,
            image_url: '/images/board/board_leader.png',
            image: null,
        });
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (member: BoardMember) => {
        setEditingMember(member);
        form.setData({
            name: member.name,
            designation: member.designation,
            organization: member.organization || 'Human Aid Bangladesh & Sadhinota Blood Transfusion Center',
            committee: member.committee || 'Board Member',
            bio: member.bio || '',
            message: member.message || '',
            phone: member.phone || '',
            email: member.email || '',
            social_facebook: member.social_facebook || '',
            social_linkedin: member.social_linkedin || '',
            display_order: member.display_order,
            image_url: member.image_url || '',
            image: null,
        });
        setIsEditModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMember) {
            form.post(`/board-members/${editingMember.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setEditingMember(null);
                }
            });
        } else {
            form.post('/board-members', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    form.reset();
                }
            });
        }
    };

    const handleToggle = (id: number) => {
        router.patch(`/board-members/${id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to remove this board member?')) {
            router.delete(`/board-members/${id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Staff Dashboard - Human Aid Hospital & SBTC" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Welcome Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl border border-slate-800">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Administrative Control Center</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            Hospital & Blood Bank Management
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Sadhinota Blood Transfusion Center • A sister concern of Human Aid Bangladesh
                        </p>
                    </div>

                    <Link
                        href={home()}
                        className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                    >
                        <span>Open Public Blood Bank</span>
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active SOS Alerts</span>
                            <div className="text-2xl font-black text-rose-600 mt-1">{requestsCount}</div>
                            <span className="text-[11px] text-slate-400">Patients needing blood</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Donors</span>
                            <div className="text-2xl font-black text-slate-900 mt-1">{donorsCount}</div>
                            <span className="text-[11px] text-emerald-600 font-semibold">Active voluntary network</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Heart className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Blood Stock</span>
                            <div className="text-2xl font-black text-slate-900 mt-1">{inventoryCount} Bags</div>
                            <span className="text-[11px] text-slate-400">Across all 8 blood groups</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Board Members</span>
                            <div className="text-2xl font-black text-slate-900 mt-1">{boardMembers.length}</div>
                            <span className="text-[11px] text-slate-400">Trustees & leadership</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Board Members Management Table */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">
                                Board of Directors & Trustees Registry
                            </h2>
                            <p className="text-xs text-slate-500">
                                Real-time dynamic management of board members, photos, designations, and public visibility.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={handleOpenAdd}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add New Member</span>
                            </button>
                            <Link
                                href={home() + '?tab=board'}
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                            >
                                <span>Manage in Live Portal</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4">Member</th>
                                    <th className="py-3 px-4">Designation & Body</th>
                                    <th className="py-3 px-4">Contact</th>
                                    <th className="py-3 px-4">Order</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {boardMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                    <img
                                                        src={member.image_url}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm">{member.name}</div>
                                                    <div className="text-[11px] text-slate-400">{member.organization}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-rose-600">{member.designation}</div>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-650 text-[10px] font-bold">
                                                {member.committee}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            <div>{member.phone || 'N/A'}</div>
                                            <div className="text-slate-400 text-[11px]">{member.email || 'N/A'}</div>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-700">
                                            #{member.display_order}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                member.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                                {member.is_active ? 'Active (Public)' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleOpenEdit(member)}
                                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs inline-flex items-center gap-1 transition-all border border-rose-200"
                                                title="Edit Member Information"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>

                                            <button
                                                onClick={() => handleToggle(member.id)}
                                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                                            >
                                                {member.is_active ? 'Hide' : 'Show'}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 font-bold text-xs transition-colors"
                                                title="Delete Member"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit / Add Board Member Modal */}
            {isEditModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsEditModalOpen(false)}
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
                                        {editingMember ? 'Edit Board Member Info' : 'Add New Board Member'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Update executive credentials, designation, phone, bio & speech.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
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
                                        value={form.data.designation}
                                        onChange={(e) => form.setData('designation', e.target.value)}
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
                                        value={form.data.committee}
                                        onChange={(e) => form.setData('committee', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    >
                                        <option value="Board Member">1. Board Member</option>
                                        <option value="Advisor panel">2. Advisor panel</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Organization
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.organization}
                                        onChange={(e) => form.setData('organization', e.target.value)}
                                        placeholder="Human Aid Bangladesh Foundation"
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
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        placeholder="+880 1324-251510"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Official Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="office@humanaidbd.org"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Display Order #
                                    </label>
                                    <input
                                        type="number"
                                        value={form.data.display_order}
                                        onChange={(e) => form.setData('display_order', parseInt(e.target.value) || 1)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Photo URL or Path
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.image_url}
                                        onChange={(e) => form.setData('image_url', e.target.value)}
                                        placeholder="/images/board/board_leader.png"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                    />
                                </div>
                            </div>

                            {/* Photo Upload Option */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Upload New Photo (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => form.setData('image', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Executive Message / Speech Quote
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    placeholder="Executive message highlighting human service and transfusion goals..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Biography & Vision
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.data.bio}
                                    onChange={(e) => form.setData('bio', e.target.value)}
                                    placeholder="Detailed overview of professional contributions, philanthropic work, and community impact..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:outline-rose-600"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
                                >
                                    {form.processing ? 'Saving...' : editingMember ? 'Save Changes' : 'Create Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Staff Dashboard',
            href: dashboard(),
        },
    ],
};
