import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Plus, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function QuickActions() {
    const navigate = useNavigate();
    const buttonActions = [
        { label: "Lend Equipment", icon: Calendar, onClick: () => navigate("/it/browse")},
        { label: "Generate Report", icon: FileText, onClick: () => navigate("/it/reports") },
    ];
    return (
        <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col w-full">
            <CardHeader>
                <CardTitle className="text-base sm:text-lg lg:text-xl font-bold">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <div className="flex gap-2 sm:gap-4 justify-center items-center flex-col sm:flex-row flex-wrap px-2 sm:px-4 w-full">
                    

                    {buttonActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.label}
                                variant="outline"
                                className="flex items-center gap-1 sm:gap-2 border border-gray-400 rounded-md text-xs sm:text-sm px-3 sm:px-4 py-2"
                                onClick={action.onClick}
                            >
                                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>{action.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}


