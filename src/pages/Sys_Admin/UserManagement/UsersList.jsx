import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import AdminLayout from '../components/AdminLayout';
import api from '@/utils/api';
import { Search, Filter, Plus, Shield, Edit, Trash2, ChevronDown, Clock, X, Loader2, Gavel, MinusCircle, PlusCircle, CreditCard, Lock, Ban, CheckCircle, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/components/ui/utils";

// Define roles
const ROLES = ['All Roles', 'Student', 'IT_Staff', 'Security', 'Admin'];

const UsersList = () => {
    const { t } = useTranslation(["admin", "common"]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [showFilters, setShowFilters] = useState(false);

    // Modals State
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false); // <--- NEW: Message Modal

    const [selectedUser, setSelectedUser] = useState(null);
    const [newScore, setNewScore] = useState(100);

    // Dynamic Data
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
    const [messageData, setMessageData] = useState({ subject: '', body: '' }); // <--- NEW
    const [submitting, setSubmitting] = useState(false);

    // 1. FETCH USERS
    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            toast.error(t('users.failedFetch'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
            console.error(err);
            toast.error(t('users.failedUpdate'));
        } finally {
            setSubmitting(false);
        }
    };

    // 5. HANDLE SUSPEND/ACTIVATE
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
        const actionName = newStatus === 'Suspended' ? 'Suspended' : 'Activated';

        if (!window.confirm(newStatus === 'Suspended' ? t('users.confirmSuspend') : t('users.confirmActivate'))) return;

        setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));

        try {
            await api.put(`/users/${user._id}`, { status: newStatus });
            toast.success(newStatus === 'Suspended' ? t('users.userSuspended') : t('users.userActivated'));
        } catch (err) {
            toast.error(t('users.failedChangeStatus'));
            fetchUsers();
        }
    };

    // 6. DELETE USER
    const handleDeleteUser = async (id) => {
        if (!window.confirm(t('users.confirmDelete'))) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success(t('users.userDeleted'));
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            toast.error(t('users.failedDelete'));
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

        // Optimistic UI Update
        const updatedUsers = users.map(u =>
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
    const filteredUsers = users.filter(user => {
        const fullName = user.fullName || user.username || "";
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

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
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[600px]">

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
                                    {ROLES.map(role => (
                                        <option key={role} value={role}>
                                            {role === 'All Roles' ? t('users.allRoles') : t(`common:roles.${role === 'IT_Staff' ? 'itStaff' : role.toLowerCase()}`)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="overflow-hidden rounded-2xl border border-gray-50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-5">{t('users.userIdentity')}</th>
                                <th className="px-6 py-5">{t('users.assignedRole')}</th>
                                <th className="px-6 py-5">{t('users.status')}</th>
                                <th className="px-6 py-5">{t('users.department')}</th>
                                <th className="px-6 py-5">{t('users.respScore')}</th>
                                <th className="px-6 py-5 text-right">{t('users.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8D8DC7]" /></td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className={`hover:bg-[#8D8DC7]/5 transition-all group ${user.status === 'Suspended' ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#8D8DC7] font-black mr-4 border border-indigo-100 uppercase shadow-sm group-hover:scale-110 transition-transform">
                                                    {(user.fullName || user.username || "U").charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-base">{user.fullName || user.username}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                                                        {user.role === 'Student' && user.studentId && (
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] text-slate-500 font-black tracking-wider border border-gray-200 uppercase">#{user.studentId}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeColor(user.role)} shadow-sm`}>
                                                {user.role === 'Admin' && <Shield className="w-3.5 h-3.5 mr-2" />}
                                                {t(`common:roles.${user.role === 'IT_Staff' ? 'itStaff' : user.role.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(user.status || 'Active')} shadow-sm`}>
                                                {user.status === 'Suspended' ? t('users.suspended') : t('users.activeStatus')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600 font-bold">{user.department || t('users.general')}</td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center justify-center min-w-[3rem] h-9 px-2 rounded-xl text-xs font-black border ${getScoreColor(user.responsibilityScore || 100)} shadow-sm`}>
                                                {user.responsibilityScore ?? 100}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2">

                                                {/* MESSAGE BUTTON */}
                                                <button onClick={() => openMessageModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-blue-500 transition-colors" title="Send Message">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>

                                                <button onClick={() => openEditModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-[#8D8DC7] transition-colors" title="Edit User">
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button onClick={() => openScoreModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-[#8D8DC7] transition-colors" title="Manage Score">
                                                    <Gavel className="w-4 h-4" />
                                                </button>

                                                {user.role !== 'Admin' && (
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`p-2 rounded-lg transition-colors ${user.status === 'Suspended' ? 'hover:bg-emerald-50 text-emerald-500' : 'hover:bg-orange-50 text-orange-500'}`}
                                                        title={user.status === 'Suspended' ? "Activate User" : "Suspend User"}
                                                    >
                                                        {user.status === 'Suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                )}

                                                {user.role !== 'Admin' && (
                                                    <button onClick={() => handleDeleteUser(user._id)} className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all active:scale-90" title="Delete User">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">{t('users.noUsersFound')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD USER MODAL --- */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowAddUserModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
                        <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900 mb-2">{t('users.newUserProfile')}</h2><p className="text-gray-500">{t('users.defaultPassword')}</p></div>
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
                            {/* ... (Existing form inputs for First Name, Last Name, Email, Role, Dept) ... */}
                            {/* I'll abbreviate to save space, assuming you keep your existing form inputs here */}
                            <div className="grid grid-cols-2 gap-5">
                                <input type="text" placeholder={t('users.firstName')} className="w-full p-3 rounded-xl border border-gray-200" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                <input type="text" placeholder={t('users.lastName')} className="w-full p-3 rounded-xl border border-gray-200" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                            </div>
                            <input type="email" placeholder={t('users.emailField')} className="w-full p-3 rounded-xl border border-gray-200" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-5">
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="Student">{t('common:roles.student')}</option>
                                    <option value="IT_Staff">{t('common:roles.itStaff')}</option>
                                    <option value="Security">{t('common:roles.security')}</option>
                                    <option value="Admin">{t('common:roles.admin')}</option>
                                </select>
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">{t('users.activeStatus')}</option>
                                    <option value="Suspended">{t('users.suspended')}</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Student ID (e.g. 2024001)" className="w-full pl-10 p-3 rounded-xl border border-gray-200" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} />
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
                                <input type="text" placeholder="First Name" className="w-full p-3 rounded-xl border border-gray-200" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                                <input type="text" placeholder="Last Name" className="w-full p-3 rounded-xl border border-gray-200" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                            </div>
                            <input type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-gray-200" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="password" placeholder={t('users.resetPassword')} className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:border-red-300 focus:ring-red-100" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="Student">{t('common:roles.student')}</option>
                                    <option value="IT_Staff">{t('common:roles.itStaff')}</option>
                                    <option value="Security">{t('common:roles.security')}</option>
                                    <option value="Admin">{t('common:roles.admin')}</option>
                                </select>
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">{t('users.activeStatus')}</option>
                                    <option value="Suspended">{t('users.suspended')}</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Student ID (e.g. 2024001)" className="w-full pl-10 p-3 rounded-xl border border-gray-200" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} />
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
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8D8DC7] focus:border-[#8D8DC7] outline-none transition-all"
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
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8D8DC7] focus:border-[#8D8DC7] outline-none transition-all resize-none"
                                    value={messageData.body}
                                    onChange={e => setMessageData({ ...messageData, body: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowMessageModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">{t('common:actions.cancel')}</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg transition-all">
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> {t('users.sendNotification')}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
};

export default UsersList;