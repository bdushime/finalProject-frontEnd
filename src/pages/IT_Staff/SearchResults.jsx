import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Input, Select, Button } from "@/components/common";
import { EquipmentStatus } from "@/types/enums";
import { searchEquipment } from "@/components/lib/equipmentData";

export default function SearchResults() {
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState(undefined);
	const results = searchEquipment({ query, status });

	return (
		<ITStaffLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex-1 grid sm:grid-cols-3 gap-3">
						<Input
							label="Search"
							placeholder="Laptops, cameras, projectors..."
							leftIcon={<Search className="h-4 w-4" />}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
						/>
						<Select
							label="Status"
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							options={[{ label: "All", value: "" }, ...Object.values(EquipmentStatus).map((s) => ({ label: s, value: s }))]}
						/>
						<Button className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
							<Filter className="mr-2 h-4 w-4" /> Apply
						</Button>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{results.map((item) => (
						<motion.div
							key={item.id}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-lg transition-shadow bg-white dark:bg-neutral-900"
						>
							<div className="aspect-video rounded-lg bg-neutral-100 dark:bg-neutral-800" />
							<h3 className="mt-3 font-semibold">{item.name}</h3>
							<p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
							<div className="mt-3 flex items-center justify-between">
								<span className="text-xs rounded-full px-2 py-1 bg-neutral-100 dark:bg-neutral-800">{item.status}</span>
								<Button size="sm">View</Button>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</ITStaffLayout>
	);
}


