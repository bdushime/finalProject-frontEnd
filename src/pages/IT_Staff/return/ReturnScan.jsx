import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { QrCode, Camera } from "lucide-react";

function Progress() {
	return (
		<ol className="flex items-center gap-2 text-xs mb-4">
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">1. Select</li>
			<li className="px-2 py-1 rounded-full bg-blue-600 text-white">2. Scan/Photo</li>
			<li className="px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">3. Done</li>
		</ol>
	);
}

export default function ReturnScan() {
	return (
		<ITStaffLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold mb-2">Return – Scan & Photo</h2>
				<Progress />
				<Card>
					<CardHeader>
						<CardTitle>Scan and capture</CardTitle>
						<CardDescription>Scan QR and take return photo</CardDescription>
					</CardHeader>
					<CardContent className="grid md:grid-cols-2 gap-6">
						<div className="aspect-[4/3] rounded-xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center relative">
							<div className="absolute inset-6 rounded-xl border-2 border-blue-600" />
							<QrCode className="h-16 w-16 text-neutral-400" />
						</div>
						<div className="aspect-video rounded-xl bg-neutral-100 dark:bg-neutral-800 grid place-items-center">
							<Camera className="h-16 w-16 text-neutral-400" />
						</div>
						<div className="md:col-span-2 flex justify-end gap-3">
							<Button variant="outline">Back</Button>
							<Button>Next</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</ITStaffLayout>
	);
}


