import { Card } from "@components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipTrigger, TooltipContent } from "@components/ui/tooltip";

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
      <div className="flex flex-col justify-between p-2 sm:p-3 lg:p-2">
          {/* Top summary */}
          <div className="flex items-baseline justify-between text-gray-900">
            <div className="text-base sm:text-lg font-bold">Device Usage</div>
            <div className="text-xl sm:text-2xl font-bold">{completionPercent}%</div>
          </div>

          {/* Small progress bar */}
          <div className="mt-4 sm:mt-6 lg:mt-8 w-full font-sans">
  {/* Container for the segments */}
  <div className="flex w-full items-end">
    
    {/* Segment 1: Yellow (Active) */}
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex w-[45%] flex-col cursor-pointer">
          {/* Label "30%" - hidden on small screens */}
          <span className="hidden sm:block mb-1 sm:mb-2 text-[10px] sm:text-xs font-semibold text-gray-500">30%</span>
          {/* Yellow Bar */}
          <div className="flex h-8 sm:h-10 items-center rounded-l-full bg-[#F9D37A] px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-gray-900">
            Active
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="sm:hidden">
        <p>Active: 30%</p>
      </TooltipContent>
    </Tooltip>

    {/* Segment 2: Dark (Borrowed) */}
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex w-[35%] flex-col cursor-pointer">
          {/* Label with vertical tick mark - hidden on small screens */}
          <div className="hidden sm:flex absolute top-[3px] sm:top-[5px] left-1 sm:left-2 flex-col items-start">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-500">Borrowed</span>
          </div>
          <div className="h-4 sm:h-6 border-l border-gray-400"></div>
          {/* Dark Bar (Square corners for the middle) */}
          <div className="h-8 sm:h-10 w-full bg-[#343434]"></div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="sm:hidden">
        <p>Borrowed: 25%</p>
      </TooltipContent>
    </Tooltip>

    {/* Segment 3: Gray (Lost/Stolen) */}
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative flex w-[20%] flex-col cursor-pointer">
          {/* Label with vertical tick mark - hidden on small screens */}
          <div className="hidden sm:flex absolute top-[3px] sm:top-[5px] left-1 sm:left-2 flex-col items-start">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-500 text-center">Lost/Stolen</span>
          </div>
          <div className="h-4 sm:h-6 border-l border-gray-400"></div>
          {/* Gray Bar (Rounded right corners) */}
          <div className="h-8 sm:h-10 w-full rounded-r-full bg-[#C7C7C7]"></div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="sm:hidden">
        <p>Lost/Stolen: 0%</p>
      </TooltipContent>
    </Tooltip>

  </div>
</div>

          {/* Dark card container */}
          <div className="mt-4 sm:mt-6">
            {/* Handle behind card */}
            <div className="h-3 sm:h-5 mx-3 sm:mx-6 rounded-t-full bg-[#E0E0E0] z-20">
                </div>
            <div className="rounded-2xl sm:rounded-3xl z-30 bg-[#222226] px-3 sm:px-5 pt-4 sm:pt-6 text-gray-100 shadow-lg">
              <div className="mb-3 sm:mb-4 flex items-baseline justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold">Equipments history</p>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-gray-400">
                    Latest device borrowing activity
                  </p>
                </div>
                <p className="text-base sm:text-lg font-semibold">
                  {completedTasks}/{totalTasks}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-2 sm:gap-3 rounded-xl bg-transparent py-1.5 sm:py-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[#333337] shrink-0">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-200" />
                      </div>
                      
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-xs sm:text-sm font-medium">
                          {activity.deviceName}
                        </span>
                        <span className="truncate text-[10px] sm:text-[11px] text-gray-400">
                          {activity.description}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-gray-500">
                          {formatDistanceToNow(activity.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border shrink-0 ${
                        activity.returned
                          ? "border-[#F9D37A] bg-[#F9D37A] text-[#2B2B2F]"
                          : "border-gray-600 bg-transparent text-gray-500"
                      }`}
                    >
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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