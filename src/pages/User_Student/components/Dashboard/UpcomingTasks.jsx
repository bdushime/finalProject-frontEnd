import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function UpcomingTasks({ notifications }) {
    const tasks = [
        { title: 'Project Update', time: 'Sep 13, 13:00', done: false },
        { title: 'Team Meeting', time: 'Sep 13, 10:30', done: true },
        { title: 'Interview', time: 'Sep 13, 08:30', done: true },
        { title: 'Discuss Q3 Goals', time: 'Sep 13, 14:45', done: false },
    ];

    return (
        <div className="bg-[#1e1e1e] rounded-[32px] p-6 text-white min-h-[400px] flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <h3 className="text-xl font-medium">Onboarding Task</h3>
                <span className="text-4xl font-light opacity-50">2/8</span>
            </div>

            <div className="space-y-6">
                {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                        <div className={`p-3 rounded-full ${task.done ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'} transition-colors`}>
                            {/* Icons mapping based on index or type random for demo */}
                            {idx === 0 ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> :
                                idx === 1 ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> :
                                    idx === 2 ? <div className="w-5 h-5 border-2 border-current rounded md:rounded-sm" /> :
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-lg leading-tight">{task.title}</h4>
                            <p className="text-xs text-white/40 mt-1">{task.time}</p>
                        </div>
                        <div className="text-[#FFD028]">
                            {task.done ? <CheckCircle2 className="w-6 h-6 fill-[#FFD028] text-[#1e1e1e]" /> : <Circle className="w-6 h-6 text-white/20" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

