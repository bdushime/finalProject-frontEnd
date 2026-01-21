import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsWidget() {
    return (
        <div className="bg-[#f0f9ff] rounded-[32px] p-6 h-full flex flex-col justify-between relative group hover:shadow-md transition-all shadow-[0_4px_20px_rgba(11,29,58,0.05)] border border-slate-100">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-[#0b1d3a]">Notifications</h3>
                <div className="relative">
<<<<<<< HEAD
                    <Bell className="w-6 h-6 text-[#126dd5]/50" />
                </div>
            </div>

            <div className="mt-4 flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                <p className="text-sm">No new notifications</p>
=======
                    <Bell className="w-6 h-6 text-[#126dd5]" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#f0f9ff]"></span>
                </div>
            </div>

            <div className="mt-4 space-y-3">
                <div className="bg-white p-3 rounded-2xl shadow-sm text-sm border border-slate-100/50 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                    <div>
                        <div className="font-semibold text-[#0b1d3a] mb-0.5">Return Reminder</div>
                        <div className="text-slate-500 text-xs">Projector due in 2 hours</div>
                    </div>
                </div>
                <div className="bg-white/50 p-3 rounded-2xl text-sm border border-transparent hover:bg-white hover:border-slate-100/50 transition-all flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                    <div>
                        <div className="font-medium text-[#0b1d3a] mb-0.5 opacity-80">Request Approved</div>
                        <div className="text-slate-500 text-xs">MacBook Pro M2</div>
                    </div>
                </div>
>>>>>>> 8d7aaf80a8a982856b2333184c20b98c5b95b4ab
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-white/40 rounded-full blur-2xl -z-10"></div>
        </div>
    );
}

