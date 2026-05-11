import { useCallback } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationsPagination } from "@/components/common/NotificationsPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import Loader from "@/components/common/Loader";

export default function ITStaffNotifications() {
  const { t } = useTranslation(["itstaff", "common"]);
  const navigate = useNavigate();

  const {
    notifications,
    loading,
    page,
    totalPages,
    setPage,
    markAsRead,
    markAllAsRead,
    unreadCount,
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

  const handleViewDetails = useCallback(
    (notification) => {
      if (!notification) return;
      const notifId = notification?._id || notification?.id;
      if (notifId) markAsRead(notifId); // Keep parity with the previous IT Staff behavior.
      navigate("/it/current-checkouts");
    },
    [markAsRead, navigate],
  );

  return (
    <ITStaffLayout>
      <div className="mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              {t("notifications.title")}
              {unreadCount > 0 && (
                <Badge className="bg-red-600 text-white text-sm">
                  {t("notifications.unread", { count: unreadCount })}
                </Badge>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{t("notifications.desc")}</p>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              {t("notifications.markAll")}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-2xl sm:rounded-4xl shadow-sm border border-slate-100 overflow-hidden p-4 sm:p-6">
          {loading ? (
            <div className="h-[50vh] flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              <NotificationList
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onViewDetails={handleViewDetails}
                markReadOnClick={true}
                emptyState={
                  <div className="p-16 text-center text-slate-400">
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bell className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {t("notifications.noNotifications")}
                    </p>
                    <p className="text-sm mt-2">{t("notifications.noNotificationsDesc")}</p>
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
    </ITStaffLayout>
  );
}