import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { listActiveCheckouts } from "@/components/lib/equipmentData";

function Progress() {
	return (
		<ol className="flex items-center gap-2 text-xs mb-4">
			<li className="px-2 py-1 rounded-full bg-blue-600 text-white">1. Select</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">2. Scan/Photo</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Done</li>
		</ol>
	);
}

export default function SelectReturnItem() {
	const active = listActiveCheckouts();
	return (
		<ITStaffLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold mb-2">Return – Select Item</h2>
				<Progress />
				<Card>
					<CardHeader>
						<CardTitle>Items on loan</CardTitle>
						<CardDescription>Choose the item you want to return</CardDescription>
					</CardHeader>
					<CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{active.map((i) => (
							<Card key={i.checkoutId}>
								<CardContent className="p-4 space-y-2">
									<div className="font-medium">{i.equipmentName}</div>
									<p className="text-sm text-neutral-500">Due: {i.dueDate}</p>
									<Button className="w-full">Select</Button>
								</CardContent>
							</Card>
						))}
					</CardContent>
				</Card>
			</div>
		</ITStaffLayout>
	);
}


