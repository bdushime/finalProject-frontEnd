import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout'; // Your layout file
import StatsCard from './components/StatsCard';
import api from '@/utils/api';
import { 
    Package, 
    Wifi, 
    AlertTriangle, 
    UserX, 
    Clock, 
    ChevronDown, 
    QrCode, 
    ShieldAlert, 
    Activity,
    Loader2
} from 'lucide-react';

// // Reusable Stats Card Component (Internal for simplicity)
// const StatsCard = ({ title, value, change, trend, subtext, icon: Icon, dark, isAlert, onClick }) => (
//     <div 
//         onClick={onClick}
//         className={`p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-pointer ${
//             dark ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-900'
//         } ${isAlert ? 'border-2 border-red-500/50' : ''}`}
//     >
//         <div className="flex justify-between items-start mb-2">
//             <p className={`text-sm font-semibold ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{title}</p>
//             <div className={`p-2 rounded-xl ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
//                 <Icon className={`w-5 h-5 ${isAlert ? 'text-red-500' : 'text-[#8D8DC7]'}`} />
//             </div>
//         </div>
//         <h3 className="text-3xl font-bold mb-1">{value}</h3>
//         <div className="flex items-center text-xs mt-2 opacity-80">
//             <span className={`font-medium px-2 py-0.5 rounded mr-2 ${
//                 trend === 'positive' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
//             }`}>
//                 {change}
//             </span>
//             {subtext}
//         </div>
//     </div>
// );

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            activeBorrowed: 0,
            totalUsers: 0,
            atRiskItems: 0,
            systemStatus: "Checking..."
        },
        recentActivity: []
    });

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const res = await api.get('/transactions/admin/dashboard-stats');
                setData(res.data);
            } catch (err) {
                console.error("Failed to load admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#8D8DC7]" />
            </div>
        );
    }

    const HeroSection = (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Admin,</h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
                        {currentDate} • System Status: {data.stats.systemStatus}
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex gap-3">
                    <button className="bg-slate-800 text-gray-300 font-medium py-3 px-6 rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center">
                        <Clock className="w-4 h-4 mr-2" /> Today <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                    <button onClick={() => navigate('/admin/equipment')} className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white font-medium py-3 px-8 rounded-2xl shadow-lg transition-all flex items-center">
                        <QrCode className="w-5 h-5 mr-2" /> Manage Inventory
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <StatsCard
                    title="Active Borrowed"
                    value={data.stats.activeBorrowed}
                    change="+Live"
                    trend="positive"
                    subtext="Students with items"
                    icon={Package}
                    dark
                    onClick={() => navigate('/admin/reports')}
                />
                <StatsCard
                    title="Total Users"
                    value={data.stats.totalUsers}
                    change="Stable"
                    trend="positive"
                    subtext="Registered accounts"
                    icon={Wifi}
                    dark
                    onClick={() => navigate('/admin/users')}
                />
                <StatsCard
                    title="At-Risk Items"
                    value={data.stats.atRiskItems}
                    change="Action Req"
                    trend={data.stats.atRiskItems > 0 ? "negative" : "positive"}
                    subtext="Overdue items"
                    icon={AlertTriangle}
                    dark
                    isAlert={data.stats.atRiskItems > 0}
                    onClick={() => navigate('/admin/reports')}
                />
                <StatsCard
                    title="Available Equip"
                    value={data.stats.availableEquipment}
                    change="Stock"
                    trend="positive"
                    subtext="Ready for checkout"
                    icon={Activity} // Changed icon
                    onClick={() => navigate('/admin/data')}
                />
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                {/* Left Column: Recent Activity Table */}
                <div className="xl:col-span-2 space-y-6 h-full">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                            <button onClick={() => navigate('/admin/reports')} className="text-sm text-[#8D8DC7] font-medium hover:underline">View All</button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Equipment</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentActivity.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4">No recent activity</td></tr>
                                    ) : (
                                        data.recentActivity.map((tx) => (
                                            <tr key={tx._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{tx.user?.username || 'Unknown'}</td>
                                                <td className="px-4 py-3">{tx.equipment?.name || 'Deleted Item'}</td>
                                                <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        tx.status === 'Checked Out' ? 'bg-blue-100 text-blue-700' :
                                                        tx.status === 'Returned' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions (Static for now) */}
                <div className="space-y-6 h-full">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/admin/users')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors">
                                👥 Manage Users
                            </button>
                            <button onClick={() => navigate('/admin/config')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors">
                                ⚙️ System Config
                            </button>
                            <button onClick={() => navigate('/admin/reports')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-medium transition-colors">
                                📊 Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;