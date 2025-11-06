import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Bell, Clock } from "lucide-react";
import { listNotifications } from "@/components/lib/equipmentData";

export default function Notifications() {
	const items = listNotifications();

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold">Notifications</h2>
				<div className="mt-4 rounded-2xl shadow-lg bg-white border border-neutral-200 divide-y divide-neutral-200">
					{items.map((n) => (
						<motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 flex items-start gap-3 border-b border-neutral-200 mb-1">
							<div className="mt-0.5 rounded-xl bg-blue-50 p-2 text-blue-600">
								<Bell className="h-4 w-4" />
							</div>
							<div className="flex-1">
								<p className="font-medium">{n.title}</p>
								<p className="text-sm text-neutral-500">{n.description}</p>
								<div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
									<Clock className="h-3.5 w-3.5" /> {n.time}
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</MainLayout>
	);
}


