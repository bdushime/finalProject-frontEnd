import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";

function Progress() {
	return (
		<ol className="flex items-center gap-2 text-xs mb-4">
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">1. Select</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">2. Scan</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Photo</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">4. Details</li>
			<li className="px-2 py-1 rounded-full bg-blue-600 text-white">5. Sign</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">6. Done</li>
		</ol>
	);
}

export default function DigitalSignature() {
	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold mb-2">Checkout – Sign</h2>
				<Progress />
				<Card>
					<CardHeader>
						<CardTitle>Digital Signature</CardTitle>
						<CardDescription>Sign within the area below</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-56 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
						<div className="mt-4 flex justify-end gap-3">
							<Button variant="outline">Clear</Button>
							<Button>Next</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}

