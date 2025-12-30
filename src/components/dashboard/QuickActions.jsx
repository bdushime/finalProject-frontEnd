import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Plus, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const buttonActions = [
    { label: "Create Schedule", icon: Calendar, onClick: () => navigate("/browse")},
    { label: "Generate Report", icon: FileText, onClick: () => navigate("/reports") },
];

export default function QuickActions() {
    const navigate = useNavigate();
    return (
        <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 justify-center items-center flex-wrap px-4 pt-6">
                    

                    {buttonActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.label}
                                variant="outline"
                                className="flex items-center gap-2 border border-gray-400 rounded-md"
                                onClick={action.onClick}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{action.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}


