import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { EquipmentLocation } from "@/types/enums";

function Progress() {
	return (
		<ol className="flex items-center gap-2 text-xs mb-4">
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">1. Select</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">2. Scan</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Photo</li>
			<li className="px-2 py-1 rounded-full bg-blue-600 text-white">4. Details</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">5. Sign</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">6. Done</li>
		</ol>
	);
}

export default function CheckoutDetails() {
	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold mb-2">Checkout – Details</h2>
				<Progress />
				<Card>
					<CardHeader>
						<CardTitle>Provide details</CardTitle>
						<CardDescription>Location, purpose and expected date</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid sm:grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium">Pickup Location</label>
								<Select value={Object.values(EquipmentLocation)[0]} onValueChange={() => {}}>
									<SelectTrigger className="mt-1"><SelectValue placeholder="Select location" /></SelectTrigger>
									<SelectContent>
										{Object.values(EquipmentLocation).map((loc) => (
											<SelectItem key={loc} value={loc}>{loc}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Input placeholder="Purpose (e.g., Presentation)" />
							<Input type="date" />
							<Input placeholder="Course/Department" />
						</div>
						<div className="mt-4 flex justify-end gap-3">
							<Button variant="outline">Back</Button>
							<Button>Next</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}

