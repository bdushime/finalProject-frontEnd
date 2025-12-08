import MainLayout from "@/components/layout/MainLayout";
import DashboardStats from "./dashboards/DashboardStats";
import BorrowedItemsSummary from "./dashboards/BorrowedItemsSummary";
import QuickActions from "./dashboards/QuickActions";
import RecentActivity from "./dashboards/RecentActivity";
import { borrowedItems, notifications, dashboardStats } from "./data/mockData";

export default function Dashboard() {
    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-[#0b2545] tracking-tight mb-1">
                        Student Dashboard
                    </h1>
                    <p className="text-slate-600 text-sm">
                        Your IT equipment activity, status, and quick actions in one place
                    </p>
                </div>

                {/* Summary Cards */}
                <DashboardStats statsData={dashboardStats} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BorrowedItemsSummary items={borrowedItems} />
                    <RecentActivity notifications={notifications} />
                </div>

                {/* Quick Actions */}
                <QuickActions />
            </div>
        </MainLayout>
    );
}

