import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, History, Bell, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            label: "Browse Equipment",
            description: "View available equipment",
            icon: Package,
            onClick: () => navigate('/student/browse'),
            variant: "default",
        },
        {
            label: "Request Equipment",
            description: "Submit a borrow request",
            icon: Plus,
            onClick: () => navigate('/student/borrow-request'),
            variant: "default",
        },
        {
            label: "Scan QR Code",
            description: "Quick scan to borrow",
            icon: QrCode,
            onClick: () => navigate('/student/borrow-request?scan=true'),
            variant: "outline",
        },
        {
            label: "View History",
            description: "Check past borrows",
            icon: History,
            onClick: () => navigate('/student/history'),
            variant: "outline",
        },
        {
            label: "Notifications",
            description: "View all notifications",
            icon: Bell,
            onClick: () => navigate('/student/notifications'),
            variant: "outline",
        },
    ];

    return (
        <Card className="border-gray-300">
            <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.label}
                                variant={action.variant}
                                className="h-auto p-4 flex flex-col items-start gap-2"
                                onClick={action.onClick}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <Icon className="h-5 w-5" />
                                    <div className="flex-1 text-left">
                                        <div className="font-semibold">{action.label}</div>
                                        <div className="text-xs opacity-80">{action.description}</div>
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

