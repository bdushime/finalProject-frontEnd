import MainLayout from "@/components/layout/MainLayout";
import DashboardCards from "@/components/dashboard/DashboardCards";
import Charts from "@/components/dashboard/Charts";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";

export function Dashboard() {
	return (
		<MainLayout>
			<div className="space-y-6">
				{/* Summary Cards */}
				<DashboardCards />
				<Charts />

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<QuickActions />
					<RecentActivity />
				</div>
			</div>
		</MainLayout>
	);
}
