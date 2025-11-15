import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { QrCode } from "lucide-react";

function Progress() {
	return (
		<ol className="flex items-center gap-2 text-xs mb-4">
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">1. Select</li>
			<li className="px-2 py-1 rounded-full bg-blue-600 text-white">2. Scan</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Photo</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">4. Details</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">5. Sign</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">6. Done</li>
		</ol>
	);
}

export default function ScanQRCode() {
	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold mb-2">Checkout – Scan QR</h2>
				<Progress />
				<Card>
					<CardHeader>
						<CardTitle>Scan the item code</CardTitle>
						<CardDescription>Allow camera permissions to continue</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="aspect-[4/3] rounded-xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center relative">
							<div className="absolute inset-6 rounded-xl border-2 border-blue-600" />
							<QrCode className="h-16 w-16 text-neutral-400" />
						</div>
						<div className="flex gap-3 justify-end">
							<Button variant="outline">Back</Button>
							<Button>Next</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</MainLayout>
	);
}

