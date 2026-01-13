import React, { useState, useEffect } from 'react';
import { MoreHorizontal, ArrowUpRight, MapPin, X, User, Calendar, Box, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api'; // Ensure this path matches your project

const getStatusStyles = (status) => {
    switch (status) {
        case 'Checked Out': return 'bg-orange-100 text-orange-700';
        case 'Returned': return 'bg-green-100 text-green-700';
        case 'Overdue': return 'bg-red-100 text-red-700';
        case 'Pending': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const RecentActivityTable = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // FETCH DATA
    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                // Re-using the admin stats endpoint because it already sorts by latest
                const res = await api.get('/transactions/admin/dashboard-stats');
                setActivities(res.data.recentActivity);
            } catch (err) {
                console.error("Failed to load activities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentActivity();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading live feeds...
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-10 text-gray-400">
                No recent activity found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs text-gray-400 font-medium border-b border-gray-50">
                        <th className="py-3 px-4 pl-0 font-normal">Tracking ID</th>
                        <th className="py-3 px-4 font-normal">Student / Staff</th>
                        <th className="py-3 px-4 font-normal">Equipment</th>
                        <th className="py-3 px-4 font-normal">Location</th>
                        <th className="py-3 px-4 font-normal">Status</th>
                        <th className="py-3 px-4 font-normal text-right">Details</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {activities.map((activity) => (
                        <tr
                            key={activity._id}
                            className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                        >
                            <td className="py-4 px-4 pl-0 font-medium text-gray-500 font-mono">
                                #{activity._id.slice(-6).toUpperCase()} {/* Truncate ID for clean look */}
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#8D8DC7] font-bold text-xs mr-3 uppercase">
                                        {(activity.user?.username || "U").charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{activity.user?.username || "Unknown"}</div>
                                        <div className="text-xs text-gray-400">{activity.user?.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-slate-800 font-medium">
                                {activity.equipment?.name || "Deleted Item"}
                            </td>
                            <td className="py-4 px-4 text-gray-500">
                                <div className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                    {activity.destination || "General Use"}
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusStyles(activity.status)}`}>
                                    {activity.status}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                                <button
                                    onClick={() => setSelectedActivity(activity)}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-gray-400"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Details Modal */}
            {selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Transaction Details</h3>
                                <p className="text-gray-400 text-xs font-mono mt-1">ID: {selectedActivity._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4">
                                    <User className="w-6 h-6 text-[#8D8DC7]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Borrower</p>
                                    <p className="font-bold text-slate-900">{selectedActivity.user?.username}</p>
                                    <p className="text-xs text-gray-500">{selectedActivity.user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4">
                                    <Box className="w-6 h-6 text-[#8D8DC7]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Equipment</p>
                                    <p className="font-bold text-slate-900">{selectedActivity.equipment?.name}</p>
                                    <p className="text-xs text-gray-500">SN: {selectedActivity.equipment?.serialNumber}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4">
                                    <MapPin className="w-6 h-6 text-[#8D8DC7]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Destination</p>
                                    <p className="font-bold text-slate-900">{selectedActivity.destination || "Not specified"}</p>
                                    <p className="text-xs text-green-600 font-bold">
                                        {new Date(selectedActivity.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => navigate('/admin/reports')} className="flex-1 bg-[#8D8DC7] text-white py-3 rounded-xl font-bold hover:bg-[#7b7bb5] transition-colors">
                                View Full History
                            </button>
                            <button onClick={() => setSelectedActivity(null)} className="flex-1 border border-gray-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentActivityTable;