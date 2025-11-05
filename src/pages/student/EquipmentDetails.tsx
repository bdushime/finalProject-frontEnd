import { motion } from "framer-motion";
import { QrCode, CircleDot, ArrowLeft, Camera, BadgeInfo } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/common";
import { EquipmentCondition, EquipmentStatus } from "@/types/enums";
import { getEquipmentById } from "@/components/lib/equipmentData";

export default function EquipmentDetails() {
	// In a real app, get ID from route params
	const equipment = getEquipmentById("eq-001");

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<Button variant="ghost" className="mb-4" aria-label="Back">
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>

				<div className="grid gap-6 lg:grid-cols-3">
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						className="rounded-2xl shadow-lg bg-white dark:bg-neutral-900 p-5 lg:col-span-2"
					>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h2 className="text-xl font-semibold">{equipment?.name}</h2>
								<p className="text-sm text-neutral-500">ID: {equipment?.id}</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800">
									<CircleDot className="h-3.5 w-3.5 text-emerald-600" />
									{EquipmentStatus.AVAILABLE}
								</span>
								<span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800">
									<BadgeInfo className="h-3.5 w-3.5 text-blue-600" />
									{EquipmentCondition.GOOD}
								</span>
							</div>
						</div>

						<div className="mt-6 grid gap-6 md:grid-cols-2">
							<div className="aspect-video w-full rounded-xl bg-neutral-100 dark:bg-neutral-800" />
							<div className="space-y-3 text-sm">
								<p><span className="font-medium">Category:</span> {equipment?.category}</p>
								<p><span className="font-medium">Description:</span> {equipment?.description}</p>
								<p><span className="font-medium">Location:</span> {equipment?.location}</p>
								<p><span className="font-medium">Last serviced:</span> {equipment?.lastServiced}</p>
							</div>
						</div>

						<div className="mt-6 flex flex-col sm:flex-row gap-3">
						<Button className="bg-linear-to-r from-blue-600 to-purple-600 text-white">Check Out</Button>
							<Button variant="outline" className="flex items-center gap-2">
								<Camera className="h-4 w-4" /> View Photos
							</Button>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.05 }}
						className="rounded-2xl shadow-lg bg-white dark:bg-neutral-900 p-5"
					>
						<h3 className="font-semibold mb-4">QR Code</h3>
						<div className="aspect-square rounded-xl grid place-items-center bg-neutral-50 dark:bg-neutral-800">
							<QrCode className="h-28 w-28 text-neutral-400" />
						</div>
					</motion.div>
				</div>
			</div>
		</MainLayout>
	);
}


