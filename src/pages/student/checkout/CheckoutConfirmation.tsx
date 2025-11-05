import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { CheckCircle2, Printer, Download } from "lucide-react";

function Progress() {
	return (
		<ol className="flex items-center gap-2 text-xs mb-4">
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">1. Select</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">2. Scan</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Photo</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">4. Details</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">5. Sign</li>
			<li className="px-2 py-1 rounded-full bg-blue-600 text-white">6. Done</li>
		</ol>
	);
}

export default function CheckoutConfirmation() {
	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold mb-2">Checkout – Confirmation</h2>
				<Progress />
				<Card>
					<CardHeader className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5 text-emerald-600" />
						<CardTitle>Checkout confirmed</CardTitle>
						<CardDescription>Your receipt is below</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-sm">
							<p><span className="font-medium">Name:</span> John Doe</p>
							<p><span className="font-medium">Items:</span> 2</p>
							<p><span className="font-medium">Due date:</span> 2025-12-01</p>
						</div>
						<div className="flex gap-3">
							<Button variant="outline" className="flex items-center gap-2"><Printer className="h-4 w-4"/> Print</Button>
							<Button className="flex items-center gap-2"><Download className="h-4 w-4"/> Download</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}



