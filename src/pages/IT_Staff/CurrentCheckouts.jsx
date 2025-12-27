import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { listActiveCheckouts } from "@/components/lib/equipmentData";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import CheckoutDetailsDialog from "../IT_Staff/checkout/CheckoutDetailsDialog";

export default function CurrentCheckouts() {
	const active = listActiveCheckouts();
	const [selectedCheckout, setSelectedCheckout] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleRowClick = (checkout) => {
		setSelectedCheckout(checkout);
		setIsDialogOpen(true);
	};

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
									<th className="px-4 py-3">Actions</th>
								</tr>
							</TableHeader>
							<TableBody className="border border-gray-500 rounded-xl">
								{active.map((row) => (
									<motion.tr 
										key={row.checkoutId} 
										initial={{ opacity: 0 }} 
										animate={{ opacity: 1 }} 
										className="border-b border-gray-500 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
										onClick={() => handleRowClick(row)}
									>
										<td className="px-4 py-3 font-medium border-l-2 border-gray-800">{row.equipmentName}</td>
										<td className="px-4 py-3">{row.checkedOutAt}</td>
										<td className="px-4 py-3">{row.dueDate}</td>
										<td className="px-4 py-3">
											<span className="inline-flex rounded-full bg-cyan-600 px-2 py-1 text-white">Borrowed</span>
										</td>
										<td className="px-4 py-3">
											<Button
												variant="ghost"
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													handleRowClick(row);
												}}
												className="text-blue-600 hover:text-blue-700"
											>
												<Eye className="h-4 w-4 mr-1" />
												View Details
											</Button>
										</td>
									</motion.tr>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* Checkout Details Dialog */}
				<CheckoutDetailsDialog
					isOpen={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					selectedCheckout={selectedCheckout}
				/>
			</div>
		</MainLayout>
	);
}

