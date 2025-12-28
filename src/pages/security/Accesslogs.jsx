import React, { useState } from "react";
import MainLayout from "./layout/MainLayout";
import StatCard from "@/components/security/StatCard";
import AccessLogsTable from "@/components/security/AccessLogsTable";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Filter,
} from "lucide-react";

function Accesslogs() {
  const [view, setView] = useState("month"); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 9)); // January 9, 2025
  const [selectedStatuses, setSelectedStatuses] = useState(["all"]);

  // Sample equipment log data with times for day view
  const equipmentLogs = [
    {
      id: 1,
      equipment: "Laptop HP-001",
      officer: "Alice Kim",
      status: "checked-out",
      startDate: "2025-01-21T09:00:00",
      endDate: "2025-01-21T17:30:00",
      color: "bg-purple-500",
    },
    {
      id: 2,
      equipment: "Camera CN-045",
      officer: "Annette Black",
      status: "in-use",
      startDate: "2025-01-09T08:00:00",
      endDate: "2025-01-09T16:00:00",
      color: "bg-orange-500",
    },
    {
      id: 3,
      equipment: "Radio RT-012",
      officer: "Jerome Bell",
      status: "checked-in",
      startDate: "2025-01-14T10:30:00",
      endDate: "2025-01-14T18:00:00",
      color: "bg-green-500",
    },
    {
      id: 4,
      equipment: "Tablet TB-089",
      officer: "Kris Black",
      status: "maintenance",
      startDate: "2025-01-16T14:00:00",
      endDate: "2025-01-16T19:00:00",
      color: "bg-blue-500",
    },
    {
      id: 5,
      equipment: "Walkie-Talkie WT-034",
      officer: "Jenny Wilson",
      status: "checked-in",
      startDate: "2025-01-10T07:00:00",
      endDate: "2025-01-10T20:00:00",
      color: "bg-green-500",
    },
    {
      id: 6,
      equipment: "Flashlight FL-156",
      officer: "Kristin Watson",
      status: "in-use",
      startDate: "2025-01-09T11:00:00",
      endDate: "2025-01-09T15:45:00",
      color: "bg-orange-500",
    },
  ];

  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Checked Out", value: "checked-out", color: "bg-purple-500" },
    { label: "In Use", value: "in-use", color: "bg-orange-500" },
    { label: "Checked In", value: "checked-in", color: "bg-green-500" },
    { label: "Maintenance", value: "maintenance", color: "bg-blue-500" },
    { label: "Reported Lost", value: "lost", color: "bg-red-500" },
  ];

  const handleStatusToggle = (status) => {
    if (status === "all") {
      setSelectedStatuses(["all"]);
    } else {
      setSelectedStatuses((prev) => {
        const withoutAll = prev.filter((s) => s !== "all");

        // Toggle the clicked status
        if (withoutAll.includes(status)) {
          const newStatuses = withoutAll.filter((s) => s !== status);
          // If no statuses left, select 'all'
          return newStatuses.length === 0 ? ["all"] : newStatuses;
        } else {
          return [...withoutAll, status];
        }
      });
    }
  };

  const isStatusSelected = (status) => {
    return selectedStatuses.includes(status);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getWeekDays = (date) => {
    const days = [];
    const currentDay = new Date(date);
    const dayOfWeek = currentDay.getDay();
    const monday = new Date(currentDay);
    monday.setDate(
      currentDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    );

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (view === "week") {
      const weekDays = getWeekDays(currentDate);
      return `${weekDays[0].toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${weekDays[6].toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }
  };

  const isLogInRange = (log, date) => {
    const logStart = new Date(log.startDate);
    const logEnd = new Date(log.endDate);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    logStart.setHours(0, 0, 0, 0);
    logEnd.setHours(0, 0, 0, 0);

    return checkDate >= logStart && checkDate <= logEnd;
  };

  const getLogsForDate = (date) => {
    return equipmentLogs.filter((log) => {
      const matchesStatus =
        selectedStatuses.includes("all") ||
        selectedStatuses.includes(log.status);
      return matchesStatus && isLogInRange(log, date);
    });
  };

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } =
      getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < startingDayOfWeek - 1; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-24 border-r border-b border-gray-700"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const logsForDay = getLogsForDate(date);
      const isToday =
        date.toDateString() === new Date(2025, 0, 9).toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border-r border-b border-gray-700 p-1 overflow-hidden ${
            isToday ? "bg-purple-500/20" : ""
          }`}
        >
          <div
            className={`text-xs font-medium mb-1 ${
              isToday ? "text-white" : "text-gray-400"
            }`}
          >
            {day}
          </div>
          <div className="space-y-0.5">
            {logsForDay.slice(0, 2).map((log, idx) => (
              <div
                key={idx}
                className={`${log.color} text-white text-xs px-1.5 py-0.5 rounded truncate`}
              >
                {log.equipment}
              </div>
            ))}
            {logsForDay.length > 2 && (
              <div className="text-xs text-gray-400">
                +{logsForDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
      return (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 border-l border-t border-gray-700">
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-gray-800 text-gray-300 text-sm font-medium p-2 border-r border-b border-gray-700 text-center"
              >
                {day}
              </div>
            ))}
            {days}
          </div>
        </div>
      );
    }
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-l border-t border-gray-700">
          {weekDays.map((day, idx) => {
            const logsForDay = getLogsForDate(day);
            const isToday =
              day.toDateString() === new Date(2025, 0, 9).toDateString();

            return (
              <div
                key={idx}
                className={`border-r border-b border-gray-700 ${
                  isToday ? "bg-purple-500/20" : ""
                }`}
              >
                <div className="bg-gray-800 p-2 border-b border-gray-700">
                  <div className="text-xs text-gray-400">
                    {weekDayNames[idx]}
                  </div>
                  <div
                    className={`text-lg font-medium ${
                      isToday ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
                <div className="p-2 space-y-2 min-h-[300px]">
                  {logsForDay.map((log, logIdx) => (
                    <div
                      key={logIdx}
                      className={`${log.color} text-white text-sm px-2 py-2 rounded`}
                    >
                      <div className="font-medium truncate">
                        {log.equipment}
                      </div>
                      <div className="text-xs opacity-90 truncate">
                        {log.officer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const logsForDay = getLogsForDate(currentDate);
    const hours = Array.from({ length: 23 }, (_, i) => i);

    // Calculate position and width for timeline bars based on time
    const getLogPosition = (log) => {
      let startDate = new Date(log.startDate);
      let endDate = new Date(log.endDate);
      
      // If date string doesn't have time, add default times (9 AM to 5 PM)
      if (log.startDate && !log.startDate.includes("T")) {
        startDate = new Date(`${log.startDate}T09:00:00`);
        endDate = new Date(`${log.endDate}T17:00:00`);
      }
      
      // Check if log is for the current day
      const logDay = new Date(startDate);
      logDay.setHours(0, 0, 0, 0);
      const currentDay = new Date(currentDate);
      currentDay.setHours(0, 0, 0, 0);
      
      if (logDay.getTime() !== currentDay.getTime()) {
        return null;
      }

      const startHour = startDate.getHours() + startDate.getMinutes() / 60;
      const endHour = endDate.getHours() + endDate.getMinutes() / 60;
      
      const left = (startHour / 24) * 100;
      const width = ((endHour - startHour) / 24) * 100;
      
      return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
    };

    return (
      <div className="flex-1 overflow-auto">
        <div className="border border-gray-700 rounded-lg">
          {/* Hour Header */}
          <div className="flex border-b border-gray-700 bg-gray-800">
            {/* <div className="w-40 p-2 text-sm font-medium text-gray-300 border-r border-gray-700">
              Equipment
            </div> */}
            <div className="flex-1 flex">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 p-2 text-xs text-gray-400 border-r border-gray-700 text-center"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="relative">
            {logsForDay.map((log, idx) => {
              const position = getLogPosition(log);
              if (!position) return null;

              return (
                <div
                  key={idx}
                  className="flex border-b border-gray-700 min-h-[80px] relative"
                >
                  {/* Timeline Bar Area */}
                  <div className="flex-1 relative p-2">
                    {/* Hour Grid Lines */}
                    <div className="absolute inset-0 flex">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="flex-1 border-r border-gray-700/50 rounded-full"
                        />
                      ))}
                    </div>

                    {/* Timeline Bar */}
                    <div
                      className={`group absolute top-2 bottom-2 ${log.color} text-white rounded-full flex items-center shadow-md z-10 cursor-pointer transition-all hover:shadow-lg hover:scale-105`}
                      style={{
                        left: position.left,
                        width: position.width,
                        minWidth: "80px",
                      }}
                    >
                      {/* Tooltip on Hover */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white rounded-lg shadow-xl p-3 min-w-[200px] border border-gray-700">
                          <div className="font-medium text-sm mb-1">
                            {log.equipment}
                          </div>
                          <div className="text-xs text-gray-300 mb-1">
                            Officer: {log.officer}
                          </div>
                          <div className="text-xs text-gray-400 mb-1">
                            Status: {log.status}
                          </div>
                          <div className="text-xs text-gray-400 border-t border-gray-700 pt-1 mt-1">
                            {new Date(log.startDate).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(log.endDate).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {/* Tooltip Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bar Content (minimal when not hovering) */}
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="text-xs font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {log.equipment}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {logsForDay.length === 0 && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <div className="text-lg mb-2">No equipment logs for this day</div>
                  <div className="text-sm">Try selecting a different date or adjusting filters</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Equipment Logs</h1>
            <div className="flex items-center gap-3">
              <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <Plus size={20} />
                New Log
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition">
                <Calendar size={20} />
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition">
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusToggle(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isStatusSelected(filter.value)
                    ? "bg-white text-gray-900"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                } ${filter.color ? "flex items-center gap-2" : ""}`}
              >
                {filter.color && (
                  <span
                    className={`w-2 h-2 rounded-full ${filter.color}`}
                  ></span>
                )}
                {filter.label}
              </button>
            ))}
            {selectedStatuses.length > 1 &&
              !selectedStatuses.includes("all") && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg text-sm">
                  <span className="text-gray-300">
                    {selectedStatuses.length} filters active
                  </span>
                  <button
                    onClick={() => setSelectedStatuses(["all"])}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
          </div>

          {/* Calendar Controls */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateDate(-1)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold min-w-[300px] text-center">
                  {formatDateHeader()}
                </h2>
                <button
                  onClick={() => navigateDate(1)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* View Selector */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                {["day", "week", "month"].map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType)}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                      view === viewType
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar View */}
            {view === "month" && renderMonthView()}
            {view === "week" && renderWeekView()}
            {view === "day" && renderDayView()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Accesslogs;
