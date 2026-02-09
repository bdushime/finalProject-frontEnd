import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'; 
import api from '@/utils/api';
import { Search, Filter, Plus, Shield, Edit, Trash2, ChevronDown, Clock, X, Loader2, Gavel, MinusCircle, PlusCircle, CreditCard, Save } from 'lucide-react';
import { toast } from 'sonner';

// Define roles
const ROLES = ['All Roles', 'Student', 'IT_Staff', 'Security', 'Admin'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

const UsersList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [showFilters, setShowFilters] = useState(false);
    
    // Modals State
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false); // <--- NEW: Edit Modal State
    const [showScoreModal, setShowScoreModal] = useState(false); 
    const [selectedUser, setSelectedUser] = useState(null); 
    const [newScore, setNewScore] = useState(100); 

    // Dynamic Data
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form Data (Add/Edit User)
    const [formData, setFormData] = useState({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        role: 'Student', 
        department: '',
        studentId: '' 
    });
    const [submitting, setSubmitting] = useState(false);

    // 1. FETCH USERS
    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch users");
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
            toast.success("User created successfully!");
            setShowAddUserModal(false);
            setFormData({ firstName: '', lastName: '', email: '', role: 'Student', department: '', studentId: '' });
            fetchUsers(); 
        } catch (err) {
            console.error(err);
            toast.error("Failed to create user. Email or ID may exist.");
        } finally {
            setSubmitting(false);
        }
    };

    // 3. OPEN EDIT MODAL
    const openEditModal = (user) => {
        setSelectedUser(user);
        // Split full name if needed, or just use what we have. 
        // Assuming user object has firstName/lastName or we parse fullName
        const names = (user.fullName || user.username || "").split(' ');
        const firstName = user.firstName || names[0] || "";
        const lastName = user.lastName || names.slice(1).join(' ') || "";

        setFormData({
            firstName,
            lastName,
            email: user.email || "",
            role: user.role || "Student",
            department: user.department || "",
            studentId: user.studentId || ""
        });
        setShowEditUserModal(true);
    };

    // 4. HANDLE UPDATE USER
    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                studentId: formData.role === 'Student' ? formData.studentId : undefined 
            };

            await api.put(`/users/${selectedUser._id}`, payload);
            toast.success("User updated successfully!");
            setShowEditUserModal(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update user.");
        } finally {
            setSubmitting(false);
        }
    };

    // 5. HANDLE DELETE USER
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success("User deleted");
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    // 6. OPEN SCORE MODAL
    const openScoreModal = (user) => {
        setSelectedUser(user);
        setNewScore(user.responsibilityScore || 100); 
        setShowScoreModal(true);
    };

    // 7. SAVE NEW SCORE
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
            toast.success(`Score updated for ${selectedUser.fullName || selectedUser.username}`);
        } catch (err) {
            console.error("Score update failed:", err);
            toast.error("Failed to update score in database");
            fetchUsers(); // Revert on failure
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const fullName = user.fullName || user.username || "";
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase())); 
        
        const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
        // Mock status logic if not in backend yet
        const userStatus = user.status || 'Active'; 
        const matchesStatus = statusFilter === 'All Status' || userStatus === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
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

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                <p className="text-gray-400">Manage access and responsibility scores.</p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-3">
                <button onClick={() => setShowFilters(!showFilters)} className={`font-medium py-3 px-6 rounded-2xl shadow-lg border transition-all flex items-center ${showFilters ? 'bg-[#8D8DC7] text-white border-[#8D8DC7]' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}>
                    <Filter className="w-4 h-4 mr-2" /> Filters
                </button>
                <button onClick={() => {
                    setFormData({ firstName: '', lastName: '', email: '', role: 'Student', department: '', studentId: '' });
                    setShowAddUserModal(true);
                }} className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white font-medium py-3 px-6 rounded-2xl shadow-lg shadow-[#8D8DC7]/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center">
                    <Plus className="w-5 h-5 mr-2" /> Add User
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[600px]">

                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search by name, email or ID..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="relative">
                                <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <th className="p-4 pl-0">User Identity</th>
                                <th className="p-4">Assigned Role</th>
                                <th className="p-4">Department</th>
                                <th className="p-4">Resp. Score</th>
                                <th className="p-4">Last Login</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8D8DC7]" /></td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 pl-0">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-[#8D8DC7] font-bold mr-3 border border-gray-100 uppercase">
                                                    {(user.fullName || user.username || "U").charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{user.fullName || user.username}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {user.email} 
                                                        {user.role === 'Student' && user.studentId && (
                                                            <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                                                                #{user.studentId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                {user.role === 'Admin' && <Shield className="w-3 h-3 mr-1.5" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium">{user.department || "General"}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-bold border ${getScoreColor(user.responsibilityScore || 100)}`}>
                                                {user.responsibilityScore ?? 100}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="w-3 h-3 mr-1.5" />
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openScoreModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-[#8D8DC7] transition-colors" title="Manage Score">
                                                    <Gavel className="w-4 h-4" />
                                                </button>
                                                {/* 👇 UPDATED: Attached onClick handler here */}
                                                <button onClick={() => openEditModal(user)} className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-[#8D8DC7] transition-colors" title="Edit User">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.role !== 'Admin' && (
                                                    <button onClick={() => handleDeleteUser(user._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Delete User">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No users found matching your filters.</td></tr>
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
                        <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900 mb-2">New User Profile</h2><p className="text-gray-500">Default password: <strong>password123</strong></p></div>
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
                            <div className="grid grid-cols-2 gap-5">
                                <input type="text" placeholder="First Name" className="w-full p-3 rounded-xl border border-gray-200" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                                <input type="text" placeholder="Last Name" className="w-full p-3 rounded-xl border border-gray-200" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                            </div>
                            <input type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-gray-200" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-5">
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="Student">Student</option>
                                    <option value="IT_Staff">IT Staff</option>
                                    <option value="Security">Security</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                    <option value="">Select Dept...</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="IT Services">IT Services</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Networking">Networking</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Student ID (e.g. 2024001)" className="w-full pl-10 p-3 rounded-xl border border-gray-200" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                                </div>
                            )}
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800">{submitting ? "Creating..." : "Create User"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EDIT USER MODAL (NEW) --- */}
            {showEditUserModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowEditUserModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
                        <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900 mb-2">Edit User Profile</h2><p className="text-gray-500">Updating details for <strong>{selectedUser.fullName || selectedUser.username}</strong></p></div>
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
                            <div className="grid grid-cols-2 gap-5">
                                <input type="text" placeholder="First Name" className="w-full p-3 rounded-xl border border-gray-200" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                                <input type="text" placeholder="Last Name" className="w-full p-3 rounded-xl border border-gray-200" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                            </div>
                            <input type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-gray-200" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-5">
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="Student">Student</option>
                                    <option value="IT_Staff">IT Staff</option>
                                    <option value="Security">Security</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <select className="w-full p-3 rounded-xl border border-gray-200" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                                    <option value="">Select Dept...</option>
                                    <option value="Software Engineering">Software Engineering</option>
                                    <option value="IT Services">IT Services</option>
                                    <option value="Information Technology">Information Technology</option>
                                    <option value="Networking">Networking</option>
                                </select>
                            </div>
                            {formData.role === 'Student' && (
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="Student ID (e.g. 2024001)" className="w-full pl-10 p-3 rounded-xl border border-gray-200" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
                                </div>
                            )}
                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowEditUserModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#8D8DC7] hover:bg-[#7b7bb5]">{submitting ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- SCORE MODAL (UNCHANGED) --- */}
            {showScoreModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative text-center">
                        <button onClick={() => setShowScoreModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X className="w-5 h-5" /></button>
                        
                        <div className="w-16 h-16 bg-[#EBEBF5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8D8DC7]">
                            <Gavel className="w-8 h-8" />
                        </div>
                        
                        <h2 className="text-xl font-bold text-slate-900">Manage Responsibility Score</h2>
                        <p className="text-gray-500 text-sm mt-1">Adjust score for <span className="font-semibold text-slate-700">{selectedUser.fullName || selectedUser.username}</span></p>

                        <div className="flex items-center justify-center gap-6 my-8">
                            <button onClick={() => setNewScore(prev => Math.max(0, prev - 10))} className="w-12 h-12 rounded-full border-2 border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all active:scale-95">
                                <MinusCircle className="w-6 h-6" />
                            </button>
                            
                            <div className="text-center">
                                <div className={`text-4xl font-bold ${newScore < 50 ? 'text-red-500' : newScore < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {newScore}
                                </div>
                                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Current Score</span>
                            </div>

                            <button onClick={() => setNewScore(prev => Math.min(100, prev + 10))} className="w-12 h-12 rounded-full border-2 border-green-100 text-green-500 hover:bg-green-50 flex items-center justify-center transition-all active:scale-95">
                                <PlusCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button onClick={handleSaveScore} className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg transition-all">
                                Save Changes
                            </button>
                            <button onClick={() => setShowScoreModal(false)} className="w-full py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default UsersList;