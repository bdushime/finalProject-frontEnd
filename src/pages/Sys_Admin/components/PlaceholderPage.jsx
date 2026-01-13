
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
    const HeroSection = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                <p className="text-gray-400">{description}</p>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroSection}>
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="bg-[#8D8DC7]/10 p-6 rounded-full mb-6">
                    <Construction className="w-12 h-12 text-[#8D8DC7]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon</h2>
                <p className="text-gray-500 max-w-md">
                    This module is currently under development. The structure is in place, and features will be added in upcoming updates.
                </p>
            </div>
        </AdminLayout>
    );
};

export default PlaceholderPage;
