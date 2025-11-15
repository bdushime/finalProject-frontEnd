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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Overview of your equipment borrowing activity
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

