import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout'; // Ensure path is correct
import api from '@/utils/api';
import { Search, Filter, Plus, Shield, Edit, Trash2, ChevronDown, Clock, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Assuming you use sonner for notifications

// Define roles and statuses
const ROLES = ['All Roles', 'Student', 'IT_Staff', 'Security', 'Admin'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

const UsersList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [showFilters, setShowFilters] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    
    // Dynamic Data
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form Data
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'Student', department: '' });
    const [creating, setCreating] = useState(false);

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
        setCreating(true);
        try {
            await api.post('/users', newUser);
            toast.success("User created successfully!");
            setShowAddUserModal(false);
            setNewUser({ firstName: '', lastName: '', email: '', role: 'Student', department: '' });
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Failed to create user. Email may exist.");
        } finally {
            setCreating(false);
        }
    };

    // 3. HANDLE DELETE USER
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

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const fullName = user.fullName || user.username || "";
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
        // Mock status logic (since DB mostly doesn't have status yet, assume active)
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

    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                <p className="text-gray-400">Manage access across the system roles.</p>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-3">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`font-medium py-3 px-6 rounded-2xl shadow-lg border transition-all flex items-center ${showFilters ? 'bg-[#8D8DC7] text-white border-[#8D8DC7]' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
                >
                    <Filter className="w-4 h-4 mr-2" /> Filters
                </button>
                <button
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white font-medium py-3 px-6 rounded-2xl shadow-lg shadow-[#8D8DC7]/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add User
                </button>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[600px]">

                {/* Search & Filters Bar */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8D8DC7] focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="relative">
                                <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D8DC7]"
                                    value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
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
                                <th className="p-4">Last Login</th>
                                <th className="p-4">Status</th>
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
                                                    {(user.fullName || user.username).charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{user.fullName || user.username}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
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
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="w-3 h-3 mr-1.5" />
                                                {new Date(user.lastLogin || user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full mr-2 bg-green-500"></span> Active
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg text-gray-500 hover:text-[#8D8DC7] transition-colors" title="Edit User">
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
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowAddUserModal(false)} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400 hover:text-slate-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">New User Profile</h2>
                            <p className="text-gray-500">Create an account. Password defaults to: <strong>password123</strong></p>
                        </div>

                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                                    <input type="text" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8D8DC7] outline-none transition-all font-medium" 
                                        value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                                    <input type="text" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8D8DC7] outline-none transition-all font-medium" 
                                        value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                                <input type="email" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8D8DC7] outline-none transition-all font-medium" 
                                    value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Role</label>
                                    <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8D8DC7] outline-none transition-all font-medium"
                                        value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                        <option value="Student">Student</option>
                                        <option value="IT_Staff">IT Staff</option>
                                        <option value="Security">Security Officer</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Department</label>
                                    <select className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#8D8DC7] outline-none transition-all font-medium"
                                        value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})}>
                                        <option value="">Select Dept...</option>
                                        <option value="Software Engineering">Software Engineering</option>
                                        <option value="IT Services">IT Services</option>
                                        <option value="Security">Security</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3">
                                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                                <button type="submit" disabled={creating} className="flex-1 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl">
                                    {creating ? "Creating..." : "Create User"}
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