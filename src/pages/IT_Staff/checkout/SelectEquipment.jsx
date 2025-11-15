import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { equipmentData } from "@/components/lib/equipmentData";

function Progress() {
	return (
		<ol className="flex items-center gap-2 text-xs mb-4">
			<li className="px-2 py-1 rounded-full bg-blue-600 text-white">1. Select</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">2. Scan</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Photo</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">4. Details</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">5. Sign</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">6. Done</li>
		</ol>
	);
}

export default function SelectEquipment() {
	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold mb-2">Checkout – Select Equipment</h2>
				<Progress />
				<Card>
					<CardHeader>
						<CardTitle>Select items</CardTitle>
						<CardDescription>Search and choose available equipment</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="mb-4 max-w-sm">
							<Input placeholder="Search by name or brand" />
						</div>
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{equipmentData.slice(0,6).map((e) => (
								<Card key={e.id}>
									<CardContent className="p-4 space-y-2">
										<div className="aspect-video rounded-lg bg-neutral-100 dark:bg-neutral-800" />
										<div className="font-medium">{e.name}</div>
										<p className="text-sm text-neutral-500">{e.brand} • {e.model}</p>
										<Button className="w-full" disabled={e.available === 0}>Select</Button>
									</CardContent>
								</Card>
							))}
						</div>
						<div className="mt-4 flex justify-end">
							<Button>Next</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}

