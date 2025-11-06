import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/common";
import { listCheckoutHistory } from "@/components/lib/equipmentData";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

export default function CheckoutHistory() {
	const [q, setQ] = useState("");
	const rows = listCheckoutHistory(q);

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<div className="flex items-end justify-between gap-3 flex-wrap">
					<h2 className="text-lg font-semibold">Checkout History</h2>
					<div className="w-full sm:max-w-xs">
						<Input label="Search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history..." />
					</div>
				</div>
				<div className="mt-4 rounded-2xl shadow-lg bg-white">
					<div className="overflow-x-auto">
						<Table className="w-full text-sm border-separate border-spacing-y-2 border-spacing-x-0">
							<TableHeader className="text-left text-white">
								<TableRow>
									<th className="px-4 py-3">Item</th>
									<th className="px-4 py-3">Checked Out</th>
									<th className="px-4 py-3">Returned</th>
									<th className="px-4 py-3">Status</th>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((r) => (
									<motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
										<TableCell className="px-4 py-3 font-medium">{r.item}</TableCell>
										<TableCell className="px-4 py-3">{r.outAt}</TableCell>
										<TableCell className="px-4 py-3">{r.returnedAt ?? "-"}</TableCell>
										<TableCell className="px-4 py-3">
											<span className="inline-flex rounded-full bg-neutral-100  px-2 py-1">{r.status}</span>
										</TableCell>
									</motion.tr>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}


