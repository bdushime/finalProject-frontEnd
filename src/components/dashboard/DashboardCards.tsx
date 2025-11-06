import { Card, CardContent } from "@components/ui/card";
import { Package, Activity, WifiOff, AlertTriangle, Clock } from "lucide-react";

interface MetricCard {
	label: string;
	value: number;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	bgGradient: string;
}

const metrics: MetricCard[] = [
	{
		label: "Total Devices",
		value: 645,
		icon: Package,
		color: "text-blue-600 dark:text-blue-400",
		bgGradient: "from-blue-500 to-blue-600",
	},
	{
		label: "Active Devices",
		value: 450,
		icon: Activity,
		color: "text-green-600 dark:text-green-400",
		bgGradient: "from-green-500 to-green-600",
	},
	{
		label: "Offline Devices",
		value: 120,
		icon: WifiOff,
		color: "text-orange-600 dark:text-orange-400",
		bgGradient: "from-orange-500 to-orange-600",
	},
	{
		label: "Lost/Stolen",
		value: 30,
		icon: AlertTriangle,
		color: "text-red-600 dark:text-red-400",
		bgGradient: "from-red-500 to-red-600",
	},
	{
		label: "Overdue Loans",
		value: 45,
		icon: Clock,
		color: "text-purple-600 dark:text-purple-400",
		bgGradient: "from-purple-500 to-purple-600",
	},
];

export default function DashboardCards() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;
				return (
					<Card
						key={metric.label}
						className="bg-card border border-gray-300 shadow-md hover:shadow-lg transition-shadow"
					>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<p className="text-sm font-medium text-muted-foreground mb-1">
										{metric.label}
									</p>
									<p className="text-3xl font-bold text-foreground">
										{metric.value.toLocaleString()}
									</p>
								</div>
								<div
									className={`p-3 rounded-lg bg-gradient-to-br ${metric.bgGradient}`}
								>
									<Icon className={`h-6 w-6 ${metric.color}`} />
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

