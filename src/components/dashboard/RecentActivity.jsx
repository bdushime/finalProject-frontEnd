import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { AlertTriangle, CheckCircle2, Info, Clock, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";

const activities = [
    { id: "2", deviceName: "iPad Air", description: "Successfully returned by John Doe", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), type: "success" },
    { id: "3", deviceName: "Canon DSLR", description: "Maintenance scheduled for next week", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: "info" },
    { id: "4", deviceName: "Dell Laptop", description: "Overdue loan - 3 days past due date", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: "warning" },
    { id: "5", deviceName: "Sony Camera", description: "New device added to inventory", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), type: "info" },
];

const typeConfig = {
    error: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/20", badge: "destructive" },
    success: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/20", badge: "default" },
    info: { icon: Info, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/20", badge: "secondary" },
    warning: { icon: Clock, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/20", badge: "outline" },
};

export default function RecentActivity() {
    return (
        <Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-600">Latest events and updates in your system</CardDescription>
                </div>
                <Button variant="outline" className="px-2 py-4 border border-gray-400 rounded-xl">
                    <Eye className="h-4 w-4" />
                    View All
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const config = typeConfig[activity.type];
                        const Icon = config.icon;

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className={`p-2 rounded-lg ${config.bgColor} shrink-0`}>
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-foreground">
                                            {activity.deviceName}
                                        </span>
                                        <Badge variant={config.badge} className="text-xs">
                                            {activity.type}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}


