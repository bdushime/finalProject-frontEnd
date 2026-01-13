import React from 'react';
import { BadgeCheck } from 'lucide-react';

export default function ProfileCard({ user }) {
    return (
        <div className="bg-[#b8c0cc] rounded-[32px] p-6 relative overflow-hidden min-h-[320px] flex flex-col justify-end group">
            {/* Background Image/Gradient Placeholder - simulating the photo */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#d1d9e6] to-[#a3b0c2] z-0">
                {/* Replace this with an actual <img> if available */}
                <div className="w-full h-full opacity-30 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
            </div>

            <div className="relative z-10 text-white">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl inline-block absolute top-6 right-6">
                    <span className="font-bold text-white">$1,200</span>
                </div>

                <div className="mb-1">
                    <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
                </div>
                <div className="flex items-center gap-2 text-slate-100/90 mb-4">
                    <span className="text-sm font-medium">{user.role}</span>
                    <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-900" />
                </div>
            </div>
        </div>
    );
}

