
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const areaData = [
    { name: 'Mon', usage: 45, returns: 32 },
    { name: 'Tue', usage: 52, returns: 40 },
    { name: 'Wed', usage: 38, returns: 28 },
    { name: 'Thu', usage: 65, returns: 55 },
    { name: 'Fri', usage: 48, returns: 42 },
    { name: 'Sat', usage: 15, returns: 10 },
    { name: 'Sun', usage: 8, returns: 5 },
];

const pieData = [
    { name: 'Projectors', value: 35 },
    { name: 'Laptops', value: 25 },
    { name: 'Sound', value: 20 },
    { name: 'Cables', value: 20 },
];

const BRAND_COLOR = '#8D8DC7';
const COLORS = [BRAND_COLOR, '#1e293b', '#64748b', '#cbd5e1'];

const DashboardCharts = () => {
    return (
        <div className="flex flex-col gap-8">
            {/* Category Distribution - Pie Chart */}
            <div className="h-64 w-full relative">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Equipment Categories</h3>
                        <p className="text-xs text-gray-400">Current active loans by type</p>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                        />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Weekly Usage - Bar Chart */}
            <div className="w-full border-t border-gray-100 pt-8 pb-4">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">Weekly Usage Trends</h4>
                        <p className="text-xs text-gray-400">Total Check-outs Processed</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#8D8DC7]"></div>
                        <span className="text-xs text-slate-600 font-medium">Check-outs</span>
                    </div>
                </div>

                {/* Use a fixed height container for the chart itself, letting the parent grow */}
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar
                                name="Items Checked Out"
                                dataKey="usage"
                                fill={BRAND_COLOR}
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
