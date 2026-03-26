import MainLayout from "./layout/MainLayout";
import { Bell, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationsPagination } from "@/components/common/NotificationsPagination";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SecurityNotifications() {
	const { t } = useTranslation(["security", "common"]);

	const {
		notifications,
		loading,
		error,
		page,
		totalPages,
		setPage,
		markAsRead,
		unreadCount,
		markAllAsRead,
	} = useNotifications({
		initialPage: 1,
		limit: 10,
		enabled: true,
		sortFn: (a, b) => {
			const aUnread = !a?.read;
			const bUnread = !b?.read;
			if (aUnread !== bUnread) return aUnread ? -1 : 1;

			const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
			const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
			return bTime - aTime;
		},
	});

	const HeroSection = (
		<div>
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
				<div>
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
						{t("notifications.title")}
					</h1>
					<p className="text-gray-400 flex items-center gap-2 text-sm">
						<span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
						{t("notifications.subtitle")}
					</p>
				</div>
				<div className="mt-6 md:mt-0 flex items-center gap-2">
					{unreadCount > 0 && (
						<>
							<Badge className="bg-[#8D8DC7] text-white">{unreadCount} Unread</Badge>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={markAllAsRead}
								className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
							>
								Mark all as read
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<MainLayout heroContent={HeroSection}>
			<div className="mt-4">
				<div className="bg-white rounded-2xl sm:rounded-4xl shadow-sm border border-slate-100 overflow-hidden p-4 sm:p-6">
					{loading ? (
						<div className="h-[50vh] flex items-center justify-center">
							<div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-10 py-8 flex items-center gap-3">
								<Loader2 className="w-6 h-6 animate-spin text-[#8D8DC7]" />
								<span className="text-slate-700 font-medium">
									{t("notifications.loading", "Loading notifications...")}
								</span>
							</div>
						</div>
					) : (
						<>
						
							<NotificationList
								notifications={notifications}
								onMarkAsRead={markAsRead}
								markReadOnClick={true}
								emptyState={
									<div className="p-16 text-center text-slate-400">
										<div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
											<Bell className="h-10 w-10 text-slate-300" />
										</div>
										<p className="text-xl font-bold text-slate-900">{t("notifications.empty")}</p>
										<p className="text-sm mt-2">{t("notifications.subtitle")}</p>
									</div>
								}
								formatTimestamp={(createdAt) => {
									if (!createdAt) return "";
									return new Date(createdAt).toLocaleString();
								}}
							/>

							<NotificationsPagination
								currentPage={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						</>
					)}
				</div>
			</div>
		</MainLayout>
	);
}

