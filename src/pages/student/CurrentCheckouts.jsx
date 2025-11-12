import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { listActiveCheckouts } from "@/components/lib/equipmentData";
import { Table, TableBody, TableHeader } from "@/components/ui/table";

export default function CurrentCheckouts() {
	const active = listActiveCheckouts();

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold">Active Checkouts</h2>
				<div className="mt-4 rounded-2xl shadow-lg bg-white">
					<div className="overflow-x-auto">
						<Table className="w-full text-sm border-separate border-spacing-y-2 border-spacing-x-0">
							<TableHeader className="text-left text-neutral-500">
								<tr>
									<th className="px-4 py-3">Item</th>
									<th className="px-4 py-3">Checked Out</th>
									<th className="px-4 py-3">Due Date</th>
									<th className="px-4 py-3">Status</th>
								</tr>
							</TableHeader>
							<TableBody className="border border-gray-500 rounded-xl">
								{active.map((row) => (
									<motion.tr key={row.checkoutId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-gray-500 rounded-xl">
										<td className="px-4 py-3 font-medium border-l-2 border-gray-800">{row.equipmentName}</td>
										<td className="px-4 py-3">{row.checkedOutAt}</td>
										<td className="px-4 py-3">{row.dueDate}</td>
										<td className="px-4 py-3">
											<span className="inline-flex rounded-full bg-cyan-600 px-2 py-1 text-white">Borrowed</span>
										</td>
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

