import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import AdminLayout from '../components/AdminLayout';
import api from '@/utils/api';
import { Search, Filter, Plus, Shield, Edit, Trash2, ChevronDown, Clock, X, Loader2, Gavel, MinusCircle, PlusCircle, CreditCard, Lock, Ban, CheckCircle, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/components/ui/utils";
import Loader from "@/components/common/Loader";

// Default system roles
const DEFAULT_ROLES = ['Student', 'IT_Staff', 'Security', 'Admin'];

const UsersList = () => {
    const { t } = useTranslation(["admin", "common"]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [showFilters, setShowFilters] = useState(false);

    // --- NEW: Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Modals State
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusUser, setStatusUser] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [newScore, setNewScore] = useState(100);

    // Dynamic Data
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState(DEFAULT_ROLES);
    const [loading, setLoading] = useState(true);
    const safeUsers = Array.isArray(users) ? users : [];

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Student',
        department: '',
        studentId: '',
        status: 'Active',
        password: ''
    });

    // Message Data
    const [messageData, setMessageData] = useState({ subject: '', body: '' });
    const [submitting, setSubmitting] = useState(false);

    // 1. FETCH USERS (Requesting up to 200 to allow local search/pagination)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users?limit=200');

            const payload = res?.data;
            const list =
                (Array.isArray(payload) && payload) ||
                payload?.users ||
                payload?.results ||
                payload?.items ||
                payload?.data?.users ||
                payload?.data?.results ||
                payload?.data?.items ||
                payload?.data ||
                [];

            setUsers(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error(err);
            toast.error(t('users.failedFetch'));
            setUsers([]);
        }
        finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            const data = Array.isArray(res.data) ? res.data : [];
            const customRoles = data.map(r => r.name);
            setRoles([...DEFAULT_ROLES, ...customRoles.filter(r => !DEFAULT_ROLES.includes(r))]);
        } catch (err) {
            console.error("Failed to fetch roles", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    // --- NEW: Reset to page 1 whenever search or filter changes ---
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    // 2. HANDLE ADD USER
    const handleAddUser = async () => {
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                studentId: formData.role === 'Student' ? formData.studentId : undefined
            };
            await api.post('/users', payload);
            toast.success(t('users.userCreated'));
            setShowAddUserModal(false);
            setFormData({ firstName: '', lastName: '', email: '', role: 'Student', department: '', studentId: '', status: 'Active', password: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error(t('users.failedCreate'));
        } finally {
            setSubmitting(false);
        }
    };

    // 3. OPEN EDIT MODAL
    const openEditModal = (user) => {
        setSelectedUser(user);
        const names = (user.fullName || user.username || "").split(' ');
        const firstName = user.firstName || names[0] || "";
        const lastName = user.lastName || names.slice(1).join(' ') || "";

        setFormData({
            firstName,
            lastName,
            email: user.email || "",
            role: user.role || "Student",
            department: user.department || "",
            studentId: user.studentId || "",
            status: user.status || "Active",
            password: ""
        });
        setShowEditUserModal(true);
    };

    // 4. HANDLE UPDATE USER
    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setSubmitting(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: formData.role,
                department: formData.department,
                studentId: formData.role === 'Student' ? formData.studentId : undefined,
                status: formData.status
            };

            if (formData.password && formData.password.trim() !== "") {
                payload.password = formData.password;
            }

            await api.put(`/users/${selectedUser._id}`, payload);
            toast.success(t('users.userUpdated'));

            setShowEditUserModal(false);
            fetchUsers();
        } catch (err) {
            console.error("🚨 TRUE BACKEND ERROR:", err.response?.data);
            toast.error(t('users.failedUpdate'));
        } finally {
            setSubmitting(false);
        }
    };

    // 5. HANDLE SUSPEND/ACTIVATE
    const openStatusModal = (user) => {
        setStatusUser(user);
        setShowStatusModal(true);
    };

    const confirmToggleStatus = async () => {
        if (!statusUser) return;
        const newStatus = statusUser.status === 'Suspended' ? 'Active' : 'Suspended';

        setUsers(safeUsers.map(u => u._id === statusUser._id ? { ...u, status: newStatus } : u));
        setShowStatusModal(false);

        try {
            await api.put(`/users/${statusUser._id}`, { status: newStatus });
            toast.success(newStatus === 'Suspended' ? t('users.userSuspended') : t('users.userActivated'));
        } catch (err) {
            toast.error(t('users.failedChangeStatus'));
            fetchUsers();
        }
    };

    // Clear an auto-lock triggered by too many failed login attempts. Distinct
    // from suspension — the user keeps their status; only the lock flag and
    // attempt counter are reset so they can try logging in again.
    const handleUnlockUser = async (user) => {
        if (!user) return;
        // Optimistic update so the lock badge disappears immediately.
        setUsers(safeUsers.map((u) => (u._id === user._id ? { ...u, isLocked: false, loginAttempts: 0 } : u)));
        try {
            await api.put(`/users/${user._id}`, { isLocked: false, loginAttempts: 0, lockedAt: null });
            toast.success(t('users.userUnlocked', 'Account unlocked. The user can log in again.'));
        } catch (err) {
            toast.error(t('users.failedUnlock', 'Failed to unlock account.'));
            fetchUsers();
        }
    };

    // 7. SCORE LOGIC
    const openScoreModal = (user) => {
        setSelectedUser(user);
        setNewScore(user.responsibilityScore || 100);
        setShowScoreModal(true);
    };

    const handleSaveScore = async () => {
        if (!selectedUser) return;

        const updatedUsers = safeUsers.map(u =>
            u._id === selectedUser._id ? { ...u, responsibilityScore: newScore } : u
        );
        setUsers(updatedUsers);
        setShowScoreModal(false);

        try {
            await api.put(`/users/${selectedUser._id}`, { responsibilityScore: newScore });
            toast.success(t('users.scoreUpdated'));
        } catch (err) {
            toast.error(t('users.failedUpdateScore'));
            fetchUsers();
        }
    };

    // 8. MESSAGE LOGIC
    const openMessageModal = (user) => {
        setSelectedUser(user);
        setMessageData({ subject: '', body: '' });
        setShowMessageModal(true);
    };

    const handleSendMessage = async () => {
        if (!messageData.subject || !messageData.body) {
            return toast.error(t('users.provideSubjectAndMessage'));
        }
        setSubmitting(true);
        try {
            await api.post('/notifications/send-to-user', {
                userId: selectedUser._id,
                title: messageData.subject,
                message: messageData.body,
                type: 'info'
            });
            toast.success(t('users.messageSent', { name: selectedUser.fullName || selectedUser.username }));
            setShowMessageModal(false);
        } catch (err) {
            console.error(err);
            toast.error(t('users.failedSend'));
        } finally {
            setSubmitting(false);
        }
    };

    // Filter Logic
    const filteredUsers = safeUsers.filter(user => {
        const fullName = user.fullName || user.username || "";
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // --- NEW: Pagination Logic ---
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Student': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'IT':
            case 'IT_Staff': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Security': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Admin': return 'bg-slate-800 text-white border-slate-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const getStatusColor = (status) => {
        if (status === 'Suspended') return 'bg-red-100 text-red-600 border-red-200';
        return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    };

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
            <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{t('users.title')}</h1>
                <p className="text-gray-400 font-medium">{t('users.subtitle')}</p>
            </div>
            <div className="mt-8 md:mt-0 flex gap-4">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center border active:scale-95",
                        showFilters
                            ? "bg-[#8D8DC7] text-white border-[#8D8DC7] shadow-[#8D8DC7]/30"
                            : "bg-slate-900/50 backdrop-blur-md text-white border-slate-700/50 hover:bg-slate-800"
                    )}
                >
                    <Filter className="w-4 h-4 mr-2" /> {t('users.filters')}
                </button>
                <button
                    onClick={() => {
                        setFormData({ firstName: '', lastName: '', email: '', role: 'Student', department: '', studentId: '', status: 'Active', password: '' });
                        setShowAddUserModal(true);
                    }}
                    className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-2xl shadow-2xl shadow-[#8D8DC7]/40 transition-all active:scale-95 flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" /> {t('users.addUser')}
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 min-h-[600px]">

                {/* Filters Row */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-[#8D8DC7]" />
                        <input
                            type="text"
                            placeholder={t('users.searchPlaceholder')}
                            className="w-full pl-14 pr-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/30 focus:outline-none focus:ring-4 focus:ring-[#8D8DC7]/5 focus:border-[#8D8DC7] transition-all font-medium text-slate-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {showFilters && (
                        <div className="flex justify-end animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="relative w-full md:w-64">
                                <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D8DC7] cursor-pointer" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="All Roles">{t('users.allRoles')}</option>
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {DEFAULT_ROLES.includes(role)
                                                ? t(`common:roles.${role === 'IT_Staff' ? 'itStaff' : role.toLowerCase()}`)
                                                : role}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-100 flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse text-left">
                            <colgroup>
                                <col style={{ width: "28%" }} />
                                <col style={{ width: "17%" }} />
                                <col style={{ width: "13%" }} />
                                <col style={{ width: "15%" }} />
                                <col style={{ width: "13%" }} />
                                <col style={{ width: "14%" }} />
                            </colgroup>
                            <thead>
                                <tr className="bg-gray-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-4 py-4 align-middle">{t('users.userIdentity')}</th>
                                    <th className="px-3 py-4 align-middle text-center">{t('users.assignedRole')}</th>
                                    <th className="px-3 py-4 align-middle text-center">{t('users.status')}</th>
                                    <th className="px-3 py-4 align-middle text-center">{t('users.department')}</th>
                                    <th className="px-3 py-4 align-middle text-center">{t('users.score')}</th>
                                    <th className="px-3 py-4 align-middle text-right">{t('users.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8D8DC7]" /></td></tr>
                                ) : currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user._id} className={`hover:bg-[#8D8DC7]/5 transition-colors group align-middle ${user.status === 'Suspended' ? 'bg-red-50/30' : ''}`}>
                                            <td className="px-4 py-4 align-middle">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-11 w-11 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center text-[#8D8DC7] font-black border border-indigo-100 uppercase">
                                                        {(user.fullName || (user.studentId ? `Student ${user.studentId}` : user.username) || "U").charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-semibold text-slate-900 truncate">{user.fullName || (user.studentId ? `Student ${user.studentId}` : user.username)}</div>
                                                        <div className="flex items-center gap-2 mt-0.5 min-w-0">
                                                            <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                                            {user.role === 'Student' && user.studentId && (
                                                                <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] text-slate-500 font-black tracking-wider border border-gray-200 uppercase">#{user.studentId}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-middle text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role === 'Admin' && <Shield className="w-3 h-3 mr-1" />}
                                                    {t(`common:roles.${user.role === 'IT_Staff' ? 'itStaff' : user.role.toLowerCase()}`)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 align-middle text-center">
                                                <div className="inline-flex flex-col items-center gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${getStatusColor(user.status || 'Active')}`}>
                                                        {user.status === 'Suspended' ? t('users.suspended') : t('users.activeStatus')}
                                                    </span>
                                                    {user.isLocked && (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200"
                                                            title={t('users.lockedDueToAttempts', 'Locked after 3 failed login attempts')}
                                                        >
                                                            <Lock className="w-2.5 h-2.5" />
                                                            {t('users.locked', 'Locked')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-middle text-center text-sm text-slate-600 font-semibold">{user.department || t('users.general')}</td>
                                            <td className="px-3 py-4 align-middle text-center">
                                                {user.role === 'Student' ? (
                                                    <span className={`inline-flex items-center justify-center min-w-[2.5rem] h-8 px-2 rounded-lg text-xs font-black border ${getScoreColor(user.responsibilityScore ?? 100)}`}>
                                                        {user.responsibilityScore ?? 100}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-bold">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 align-middle text-right">
                                                <div className="inline-flex items-center justify-end gap-0.5">
                                                    <button onClick={() => openMessageModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-blue-500 transition-colors" title="Send Message">
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEditModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-[#8D8DC7] transition-colors" title="Edit User">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    {user.role === 'Student' && (
                                                        <button onClick={() => openScoreModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-[#8D8DC7] transition-colors" title="Manage Score">
                                                            <Gavel className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {user.isLocked && user.role !== 'Admin' && (
                                                        <button
                                                            onClick={() => handleUnlockUser(user)}
                                                            className="p-2 rounded-lg transition-colors hover:bg-amber-50 text-amber-600"
                                                            title={t('users.unlockAccount', 'Unlock account')}
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {user.role !== 'Admin' && (
                                                        <button
                                                            onClick={() => openStatusModal(user)}
                                                            className={`p-2 rounded-lg transition-colors ${user.status === 'Suspended' ? 'hover:bg-emerald-50 text-emerald-500' : 'hover:bg-orange-50 text-orange-500'}`}
                                                            title={user.status === 'Suspended' ? "Activate User" : "Suspend User"}
                                                        >
                                                            {user.status === 'Suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6" className="p-12 text-center text-gray-400 font-medium">{t('users.noUsersFound', 'No users found.')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- NEW: Pagination Controls --- */}
                    {!loading && filteredUsers.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                            <span className="text-sm font-medium text-slate-500">
                                Showing <span className="font-bold text-slate-700">{indexOfFirstUser + 1}</span> to <span className="font-bold text-slate-700">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-bold text-slate-700">{filteredUsers.length}</span> entries
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#8D8DC7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                                                currentPage === page
                                                    ? 'bg-[#8D8DC7] text-white shadow-md'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#8D8DC7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- ADD USER MODAL --- */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowAddUserModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
                        <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900 mb-2">{t('users.newUserProfile')}</h2><p className="text-gray-500">{t('users.defaultPassword')}</p></div>
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
                            <div className="grid grid-cols-2 gap-5">
                                <input type="text" placeholder={t('users.firstName')} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                <input type="text" placeholder={t('users.lastName')} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                            </div>
                            <input type="email" placeholder={t('users.emailField')} className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-5">
                                <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {DEFAULT_ROLES.includes(role)
                                                ? t(`common:roles.${role === 'IT_Staff' ? 'itStaff' : role.toLowerCase()}`)
                                                : role}
                                        </option>
                                    ))}
                                </select>
                                <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">{t('users.activeStatus')}</option>
                                    <option value="Suspended">{t('users.suspended')}</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Student ID (e.g. 25001)" className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} />
                                </div>
                            )}
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100">{t('common:actions.cancel')}</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800">{submitting ? t('users.creatingUser') : t('users.createUser')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EDIT USER MODAL --- */}
            {showEditUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowEditUserModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
                        <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900 mb-2">{t('users.editUser')}</h2><p className="text-gray-500">{t('users.updatingFor')} <strong>{selectedUser.fullName || selectedUser.username}</strong></p></div>
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
                            <div className="grid grid-cols-2 gap-5">
                                <input type="text" placeholder="First Name" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                <input type="text" placeholder="Last Name" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                            </div>
                            <input type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="password" placeholder={t('users.resetPassword')} className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {DEFAULT_ROLES.includes(role)
                                                ? t(`common:roles.${role === 'IT_Staff' ? 'itStaff' : role.toLowerCase()}`)
                                                : role}
                                        </option>
                                    ))}
                                </select>
                                <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">{t('users.activeStatus')}</option>
                                    <option value="Suspended">{t('users.suspended')}</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Student ID (e.g. 2024001)" className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]/20" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} />
                                </div>
                            )}
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowEditUserModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100">{t('common:actions.cancel')}</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#8D8DC7] hover:bg-[#7b7bb5]">{submitting ? t('users.savingUser') : t('users.saveChanges')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- SCORE MODAL --- */}
            {showScoreModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative text-center">
                        <button onClick={() => setShowScoreModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
                        <div className="w-16 h-16 bg-[#EBEBF5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8D8DC7]">
                            <Gavel className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{t('users.manageScore')}</h2>
                        <p className="text-gray-500 text-sm mt-1">{t('users.adjustScore')} <span className="font-semibold text-slate-700">{selectedUser.fullName || selectedUser.username}</span></p>
                        <div className="flex items-center justify-center gap-6 my-8">
                            <button onClick={() => setNewScore(prev => Math.max(0, prev - 10))} className="w-12 h-12 rounded-full border-2 border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all active:scale-95">
                                <MinusCircle className="w-6 h-6" />
                            </button>
                            <div className="text-center">
                                <div className={`text-4xl font-bold ${newScore < 50 ? 'text-red-500' : newScore < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {newScore}
                                </div>
                                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">{t('users.currentScore')}</span>
                            </div>
                            <button onClick={() => setNewScore(prev => Math.min(100, prev + 10))} className="w-12 h-12 rounded-full border-2 border-green-100 text-green-500 hover:bg-green-50 flex items-center justify-center transition-all active:scale-95">
                                <PlusCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <button onClick={handleSaveScore} className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg transition-all">
                                {t('users.saveChanges')}
                            </button>
                            <button onClick={() => setShowScoreModal(false)} className="w-full py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                {t('common:actions.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MESSAGE MODAL --- */}
            {showMessageModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowMessageModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('users.notifyUser')}</h2>
                            <p className="text-gray-500 text-sm">
                                {t('users.sendingTo')} <span className="font-bold text-slate-700">{selectedUser.fullName || selectedUser.username}</span> ({selectedUser.email}).
                                <br />{t('users.messageVia')}
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t('users.subject')}</label>
                                <input
                                    type="text"
                                    placeholder={t('users.subjectPlaceholder')}
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] outline-none transition-all"
                                    value={messageData.subject}
                                    onChange={e => setMessageData({ ...messageData, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t('users.message')}</label>
                                <textarea
                                    rows="4"
                                    placeholder={t('users.messagePlaceholder')}
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] outline-none transition-all resize-none"
                                    value={messageData.body}
                                    onChange={e => setMessageData({ ...messageData, body: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowMessageModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">{t('common:actions.cancel')}</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg transition-all">
                                    {submitting ? <Loader variant="inline" /> : <><Send className="w-4 h-4" /> {t('users.sendNotification')}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- CONFIRM STATUS MODAL --- */}
            {showStatusModal && statusUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative text-center">
                        <button onClick={() => setShowStatusModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X className="w-5 h-5" /></button>

                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${statusUser.status === 'Suspended' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                            {statusUser.status === 'Suspended' ? <CheckCircle className="w-8 h-8" /> : <Ban className="w-8 h-8" />}
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            {statusUser.status === 'Suspended' ? 'Activate User' : 'Suspend User'}
                        </h2>

                        <p className="text-gray-500 text-sm mb-8">
                            Are you sure you want to {statusUser.status === 'Suspended' ? 'activate' : 'suspend'} <span className="font-bold text-slate-700">{statusUser.fullName || statusUser.username}</span>?
                            {statusUser.status !== 'Suspended' && " They will not be able to log in while suspended."}
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setShowStatusModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                                {t('common:actions.cancel')}
                            </button>
                            <button onClick={confirmToggleStatus} className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${statusUser.status === 'Suspended' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}>
                                Yes, {statusUser.status === 'Suspended' ? 'Activate' : 'Suspend'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
};

export default UsersList;