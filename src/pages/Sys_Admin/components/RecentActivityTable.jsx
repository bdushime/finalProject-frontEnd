
import React from 'react';
import { MoreHorizontal, ArrowUpRight, MapPin, X, User, Calendar, Box } from 'lucide-react';

const activities = [
    { id: "TRK-2942", user: "Jean Claude", id_num: "23049", item: "Epson Projector X4", location: "Block C - Room 102", status: "Active" },
    { id: "TRK-2941", user: "Divine U.", id_num: "22910", item: "Dell Latitude 5420", location: "Library Zone A", status: "Checked Out" },
    { id: "TRK-2940", user: "Patrick M.", id_num: "21004", item: "Sony A7III Kit", location: "Media Lab", status: "Active" },
    { id: "TRK-2939", user: "Sarah K.", id_num: "24112", item: "HDMI Cable 10m", location: "Block A - Hall", status: "Returned" },
    { id: "TRK-2938", user: "Eric N.", id_num: "22055", item: "Sound System Set", location: "Unknown (Sensor Off)", status: "Alert" },
];

const getStatusStyles = (status) => {
    switch (status) {
        case 'Active': return 'bg-[#8D8DC7]/10 text-[#8D8DC7]';
        case 'Checked Out': return 'bg-orange-100 text-orange-700';
        case 'Returned': return 'bg-green-100 text-green-700';
        case 'Alert': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const RecentActivityTable = () => {
    const navigate = useNavigate();
    const [selectedActivity, setSelectedActivity] = useState(null);

    return (
        <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs text-gray-400 font-medium border-b border-gray-50">
                        <th className="py-3 px-4 pl-0 font-normal">Tracking ID</th>
                        <th className="py-3 px-4 font-normal">Student / Staff</th>
                        <th className="py-3 px-4 font-normal">Equipment</th>
                        <th className="py-3 px-4 font-normal">IOT Location</th>
                        <th className="py-3 px-4 font-normal">Status</th>
                        <th className="py-3 px-4 font-normal text-right">Details</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {activities.map((activity) => (
                        <tr
                            key={activity.id}
                            className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                        >
                            <td className="py-4 px-4 pl-0 font-medium text-gray-500">{activity.id}</td>
                            <td className="py-4 px-4">
                                <div className="flex items-center">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${activity.user}&background=random&color=fff`}
                                        alt={activity.user}
                                        className="w-8 h-8 rounded-full mr-3"
                                    />
                                    <div>
                                        <div className="font-semibold text-slate-800">{activity.user}</div>
                                        <div className="text-xs text-gray-400">ID: {activity.id_num}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-slate-800 font-medium">{activity.item}</td>
                            <td className="py-4 px-4 text-gray-500">
                                <div className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                    {activity.location}
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
                                <h3 className="text-xl font-bold text-slate-900">Loan Details</h3>
                                <p className="text-gray-400 text-sm">ID: {selectedActivity.id}</p>
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
                                    <p className="font-bold text-slate-900">{selectedActivity.user}</p>
                                    <p className="text-xs text-gray-500">ID: {selectedActivity.id_num}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4">
                                    <Box className="w-6 h-6 text-[#8D8DC7]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Equipment</p>
                                    <p className="font-bold text-slate-900">{selectedActivity.item}</p>
                                    <p className="text-xs text-gray-500">Current Status: {selectedActivity.status}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-gray-50 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4">
                                    <MapPin className="w-6 h-6 text-[#8D8DC7]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Location</p>
                                    <p className="font-bold text-slate-900">{selectedActivity.location}</p>
                                    <p className="text-xs text-green-600 font-bold">Signal Strong</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 bg-[#8D8DC7] text-white py-3 rounded-xl font-bold hover:bg-[#7b7bb5] transition-colors">
                                View Full History
                            </button>
                            <button className="flex-1 border border-gray-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                Report Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentActivityTable;
