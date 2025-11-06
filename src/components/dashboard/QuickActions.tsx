import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Plus, Calendar, FileText, Shield } from "lucide-react";

const buttonActions = [
	{
		label: "Create Schedule",
		icon: Calendar,
		onClick: () => console.log("Create Schedule"),
	},
	{
		label: "Generate Report",
		icon: FileText,
		onClick: () => console.log("Generate Report"),
	},
];

export default function QuickActions() {
	return (
		<Card className="border border-gray-300 shadow-md hover:shadow-lg transition-shadow">
			<CardHeader>
				<CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
				<CardDescription>Common tasks and operations</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-4 flex-wrap justify-center">
					{/* Add Device - Plain text with icon */}
					<button
						onClick={() => console.log("Add Device")}
						className="flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity border border-gray-400 rounded-md py-2.5 px-4 cursor-pointer"
					>
						<Plus className="h-4 w-4" />
						<span className="font-medium">Add Device</span>
					</button>

					{/* Bordered buttons for other actions */}
					{buttonActions.map((action) => {
						const Icon = action.icon;
						return (
							<Button
								key={action.label}
								variant="outline"
								className="flex items-center gap-2 h-auto py-2.5 px-4 border border-gray-400 rounded-md"
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

