import React from 'react';
import { CheckCircle2, Circle, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentActivityList() {
    const navigate = useNavigate();
    const activities = [
        { title: 'Projector Return', time: 'Today, 14:00', status: 'completed', type: 'return', color: 'green' },
        { title: 'MacBook Request', time: 'Today, 10:30', status: 'approved', type: 'request', color: 'purple' },
        { title: 'HDMI Cable', time: 'Yesterday, 16:45', status: 'borrowed', type: 'borrow', color: 'blue' },
        { title: 'Lab Key', time: 'Sep 10, 08:00', status: 'overdue', type: 'borrow', color: 'red' },
    ];

    return (
        <div
            onClick={() => navigate('/student/notifications')}
            className="bg-[#0b1d3a] rounded-[32px] p-6 text-white min-h-[380px] flex flex-col mt-6 shadow-[0_4px_20px_rgba(11,29,58,0.3)] cursor-pointer hover:scale-[1.01] transition-transform"
        >
            <div className="flex justify-between items-start mb-8">
                <h3 className="text-xl font-medium">Recent Activity</h3>
                <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                        <div className={`p-3 rounded-2xl ${activity.color === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
                                activity.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                    activity.color === 'blue' ? 'bg-[#126dd5]/20 text-[#126dd5]' :
                                        'bg-red-500/20 text-red-400'
                            } transition-colors border border-white/5`}>
                            {activity.type === 'return' ? <ArrowDownLeft className="w-5 h-5" /> :
                                activity.type === 'request' ? <Clock className="w-5 h-5" /> :
                                    <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-lg leading-tight text-white/90 group-hover:text-white transition-colors">{activity.title}</h4>
                            <p className="text-xs text-white/40 mt-1 font-medium">{activity.time}</p>
                        </div>
                        <div>
                            {activity.status === 'completed' || activity.status === 'approved' ?
                                <CheckCircle2 className={`w-6 h-6 ${activity.color === 'green' ? 'text-emerald-500' : 'text-[#126dd5]'} fill-current`} /> :
                                activity.status === 'overdue' ?
                                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> :
                                    <Circle className="w-6 h-6 text-white/20" />
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

