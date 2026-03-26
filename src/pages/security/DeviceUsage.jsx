import React, { useMemo } from 'react';
import { useTranslation } from "react-i18next";

const DeviceUsage = ({ data: serverData }) => {
  const { t } = useTranslation(["security"]);

  const displayData = useMemo(() => {
    let processedList = [];

    if (serverData && serverData.length > 0) {
      // Sort by value (count) descending
      const sorted = [...serverData].sort((a, b) => b.value - a.value);
      const total = sorted.reduce((sum, item) => sum + item.value, 0);

      // Take top 3 for the bubble visualization
      processedList = sorted.slice(0, 3).map(item => ({
        name: item.name,
        percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
        color: item.color || "#1A2240"
      }));
    } else {
      // Default fallback if database is empty
      processedList = [
        { name: t('deviceUsage.projectors', 'Projectors'), percent: 56, color: "#1A2240" },
        { name: t('deviceUsage.extensionCables', 'Cables'), percent: 14, color: "#BEBEE0" },
        { name: t('deviceUsage.tablets', 'Tablets'), percent: 30, color: "#343264" },
      ];
    }

    // Safely pad to exactly 3 items to avoid UI crashes
    while (processedList.length < 3) {
      processedList.push({ name: "N/A", percent: 0, color: "#e2e8f0" });
    }

    return processedList;
  }, [serverData, t]);

  return (
    <div className="p-3 sm:p-6 w-full">
      <div className="relative h-56 sm:h-60 md:h-72 group flex items-center justify-center w-full mb-4 md:mb-0">
        {/* Double room - largest, back */}
        <div
          className="absolute left-[16%] sm:left-[20%] md:left-[18%] top-[-4%] sm:top-[-10%] md:top-[-8%] z-1 w-[150px] h-[150px] sm:w-[190px] sm:h-[190px] md:w-[210px] md:h-[210px] flex items-center justify-center rounded-full border-2 border-gray-200"
          style={{ backgroundColor: displayData[0].color }}
        >
          <div className="text-center text-white">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{displayData[0].percent}%</div>
            <div className="text-[10px] sm:text-sm mt-1">{displayData[0].name}</div>
          </div>
        </div>

        {/* Single room - medium, front left */}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 border-gray-200 w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[150px] md:h-[150px] left-[12%] bottom-[-12%] md:left-[14%] md:bottom-[-10%] z-2"
          style={{ backgroundColor: displayData[1].color }}
        >
          <div className="text-center text-white">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">{displayData[1].percent}%</div>
            <div className="text-[10px] sm:text-xs mt-1">{displayData[1].name}</div>
          </div>
        </div>

        {/* Deluxe room - smallest, front right */}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 border-gray-200 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] right-[12%] bottom-[-8%] md:right-[10%] md:bottom-[-6%] z-3"
          style={{ backgroundColor: displayData[2].color }}
        >
          <div className="text-center text-gray-200">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{displayData[2].percent}%</div>
            <div className="text-[10px] sm:text-xs mt-1 text-white">{displayData[2].name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceUsage;