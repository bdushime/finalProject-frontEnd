import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { calculateReliabilityScore } from "@/utils/scoreCalculator";

export default function ScoreDashboard() {
	const score = calculateReliabilityScore({ totalCheckouts: 24, lateReturns: 2, damages: 0 });

	return (
		<MainLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<h2 className="text-lg font-semibold">Reliability Score</h2>
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-4 grid gap-6 md:grid-cols-2"
				>
					<div className="rounded-2xl shadow-lg bg-white dark:bg-neutral-900 p-6">
						<p className="text-sm text-neutral-500">Your current score</p>
						<p className="mt-2 text-4xl font-semibold">{score}</p>
						<div className="mt-4 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
						<div className="h-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600" style={{ width: `${score}%` }} />
						</div>
					</div>
					<div className="rounded-2xl shadow-lg bg-white dark:bg-neutral-900 p-6">
						<p className="text-sm text-neutral-500">Tips to improve</p>
						<ul className="mt-3 list-disc pl-5 text-sm space-y-1">
							<li>Return items on or before due dates.</li>
							<li>Report issues immediately via the return workflow.</li>
							<li>Keep photos clear to avoid disputes.</li>
						</ul>
					</div>
				</motion.div>
			</div>
		</MainLayout>
	);
}

