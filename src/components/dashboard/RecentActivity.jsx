import { Card } from "@components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const activities = [
  {
    id: "2",
    deviceName: "iPad Air",
    description: "Successfully returned by John Doe",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    returned: true,
  },
  {
    id: "3",
    deviceName: "Canon DSLR",
    description: "Maintenance scheduled for next week",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    returned: false,
  },
  {
    id: "4",
    deviceName: "Dell Laptop",
    description: "Overdue loan - 3 days past due date",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    returned: false,
  },
  {
    id: "5",
    deviceName: "Sony Camera",
    description: "New device added to inventory",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    returned: true,
  },
];

export default function RecentActivity() {
  const totalTasks = activities.length;
  const completedTasks = activities.filter((a) => a.returned).length;
  const completionPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    // <div className="flex px-4 py-2 items-center justify-center bg-red-500">
      <div className="flex flex-col justify-between p-2">
        {/* <Card className="relative border-none shadow-md p-4"> */}
          {/* Top summary */}
          <div className="flex items-baseline justify-between text-gray-900">
            <div className="text-lg font-bold">Borrowed Devices</div>
            <div className="text-2xl font-bold">{completionPercent}%</div>
          </div>

          {/* Small progress bar */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-7 border-r border-gray-300 rounded-lg bg-[#F9D37A] px-3 text-[10px] font-medium leading-[28px] text-gray-900">
              Returned
            </div>
            <div className="flex-1 h-7 rounded-full bg-[#343434] px-3 text-[10px] font-medium leading-[28px] text-gray-100">
              Borrowed
            </div>
            <div className="h-7 w-7 rounded-2xl bg-[#C7C7C7]" />
          </div>

          {/* Dark card container */}
          <div className="mt-6">
            {/* Handle behind card */}
            <div className="mx-6 h-5 rounded-t-full bg-[#E0E0E0]" />

            <div className="rounded-3xl bg-[#222226] px-5 pt-6 text-gray-100 shadow-lg">
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <p className="text-sm font-semibold">Onboarding Task</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Latest device borrowing activity
                  </p>
                </div>
                <p className="text-lg font-semibold">
                  {completedTasks}/{totalTasks}
                </p>
              </div>

              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className=" gap-3 rounded-xl bg-transparent px-1 py-2"
                  >
                    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                      <div className="flex items-center justify-center gap-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#333337]">
                        <Clock className="h-4 w-4 text-gray-200" />
                        </div>
                      
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {activity.deviceName}
                        </span>
                        <span className="truncate text-[11px] text-gray-400">
                          {activity.description}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {formatDistanceToNow(activity.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      </div>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
                        activity.returned
                          ? "border-[#F9D37A] bg-[#F9D37A] text-[#2B2B2F]"
                          : "border-gray-600 text-gray-500"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        {/* </Card> */}
      </div>
    // </div>
  );
}