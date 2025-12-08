import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Laptop2,
    ClipboardPlus,
    History,
    BellRing,
    QrCode,
    ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            label: "Browse Equipment",
            description: "Laptops, cameras, and lab gear",
            icon: Laptop2,
            onClick: () => navigate('/student/browse'),
        },
        {
            label: "Request Equipment",
            description: "Submit a detailed IT request",
            icon: ClipboardPlus,
            onClick: () => navigate('/student/borrow-request'),
        },
        {
            label: "Scan QR Code",
            description: "Instant scan to borrow onsite",
            icon: QrCode,
            onClick: () => navigate('/student/borrow-request?scan=true'),
        },
        {
            label: "View History",
            description: "Track previous checkouts",
            icon: History,
            onClick: () => navigate('/student/history'),
        },
        {
            label: "Notifications",
            description: "See approvals and alerts",
            icon: BellRing,
            onClick: () => navigate('/student/notifications'),
        },
        {
            label: "Equipment Health",
            description: "Condition updates & score",
            icon: ShieldCheck,
            onClick: () => navigate('/student/borrowed-items'),
        },
    ];

    return (
        <Card className="border border-slate-100/80 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.4)] bg-white/95 backdrop-blur-sm text-[#0b1d3a]">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-[#0b1d3a] tracking-tight">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.label}
                                className="h-auto p-4 flex flex-col items-start gap-2 bg-slate-50 hover:bg-sky-50 text-[#0b1d3a] border border-slate-100 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-[0_12px_28px_-22px_rgba(8,47,73,0.35)]"
                                onClick={action.onClick}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="p-2 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold tracking-tight">{action.label}</div>
                                        <div className="text-xs text-slate-600">{action.description}</div>
                                    </div>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

