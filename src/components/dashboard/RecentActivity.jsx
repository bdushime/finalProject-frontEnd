import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useTranslation } from "react-i18next";

// UPDATE: Accepting 'metrics' prop
export default function RecentActivity({ data, metrics }) {
  const { t } = useTranslation(["itstaff"]);
  const activities = data || [];

  // --- NEW LOGIC: Inventory Utilization ---
  // Calculates percentage of devices currently borrowed
  const totalDevices = metrics?.total || 1; // Default to 1 to avoid division by zero
  const activeLoans = metrics?.active || 0;

  // Calculate percentage (e.g., 2 active / 10 total = 20%)
  const usagePercent = Math.round((activeLoans / totalDevices) * 100);

  return (
    <div className="flex flex-col justify-between p-4 h-full">
      {/* --- Header & Percentage --- */}
      <div className="flex items-baseline justify-between text-gray-900 mb-4">
        <div className="text-lg font-bold">{t('dashboard.recentActivity.title')}</div>
        <div className="text-2xl font-bold">{usagePercent}%</div>
      </div>

      {/* --- Progress Bar --- */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${usagePercent}%` }}
        ></div>
      </div>

      {/* Subtext description */}
      <p className="text-xs text-slate-500 mb-4">
        {t('dashboard.recentActivity.inUse', { active: activeLoans, total: totalDevices })}
      </p>

      {/* --- Activity List Container --- */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>{t('dashboard.recentActivity.noActivity')}</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {/* Icon & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 shrink-0">
                    <Clock className="h-4 w-4 text-slate-600" />
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-slate-900">
                      {activity.deviceName}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {activity.description}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {/* Safety check for date formatting */}
                      {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                </div>

                {/* Status Indicator (Green for Returned, Amber for Active/Overdue) */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border shrink-0 ${activity.returned
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-amber-500 bg-amber-50 text-amber-600"
                    }`}
                >
                  {activity.returned ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}