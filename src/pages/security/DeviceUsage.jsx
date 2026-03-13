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
      <div className="relative h-48 sm:h-60 flex items-center justify-center w-full mb-4">
        {/* Double room - largest, back */}
        <div
          className="absolute left-[15%] sm:left-[20%] top-[-5%] sm:top-[-10%] z-1 w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] flex items-center justify-center rounded-full border-2 border-gray-200"
          style={{ backgroundColor: displayData[0].color }}
        >
          <div className="text-center text-white">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{displayData[0].percent}%</div>
            <div className="text-[10px] sm:text-sm mt-1">{displayData[0].name}</div>
          </div>
        </div>

        {/* Single room - medium, front left */}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 border-gray-200 w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px]"
          style={{ backgroundColor: displayData[1].color, left: '3%', bottom: '-5%', zIndex: 2 }}
        >
          <div className="text-center text-white">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">{displayData[1].percent}%</div>
            <div className="text-[10px] sm:text-xs mt-1">{displayData[1].name}</div>
          </div>
        </div>

        {/* Deluxe room - smallest, front right */}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 border-gray-200 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[110px] md:h-[110px]"
          style={{ backgroundColor: displayData[2].color, right: '5%', bottom: '0%', zIndex: 3 }}
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