import React from 'react';

const DeviceUsage = ({ data: serverData }) => {
  // Use server data if available, otherwise use default
  const displayData = React.useMemo(() => {
    if (serverData && serverData.length > 0) {
      // Sort by value (count) descending
      const sorted = [...serverData].sort((a, b) => b.value - a.value);
      const total = sorted.reduce((sum, item) => sum + item.value, 0);

      // Take top 3 for the bubble visualization
      const top3 = sorted.slice(0, 3);

      return top3.map(item => ({
        name: item.name,
        percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
        color: item.color || "#1A2240"
      }));
    }

    // Default fallback
    return [
      { name: "Projectors", percent: 56, color: "#1A2240" },
      { name: "Accessries", percent: 14, color: "#BEBEE0" },
      { name: "Tablets", percent: 30, color: "#343264" },
    ];
  }, [serverData]);

  const data = displayData;

  // Ensure we have at least 3 items to avoid crash
  if (data.length < 3) {
    while (data.length < 3) {
      data.push({ name: "", percent: 0, color: "#eee" });
    }
  }

  return (
    <div className="p-6 w-full">

      <div className="relative h-60 flex items-center justify-center w-full mb-4">
        {/* Double room - largest, back */}
        <div
          className="absolute left-[20%] top-[-10%] z-1 w-[200px] h-[200px] flex items-center justify-center rounded-full border-2 border-gray-200"
          style={{
            backgroundColor: data[0].color,
            // zIndex: 1
          }}
        >
          <div className="text-center text-white">
            <div className="text-4xl font-bold">{data[0].percent}%</div>
            <div className="text-sm mt-1">{data[0].name}</div>
          </div>
        </div>

        {/* Single room - medium, front left */}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 border-gray-200"
          style={{
            width: '150px',
            height: '150px',
            backgroundColor: data[1].color,
            left: '5%',
            bottom: '-5%',
            zIndex: 2
          }}
        >
          <div className="text-center text-white">
            <div className="text-3xl font-bold">{data[1].percent}%</div>
            <div className="text-xs mt-1">{data[1].name}</div>
          </div>
        </div>

        {/* Deluxe room - smallest, front right */}
        <div
          className="absolute flex items-center justify-center rounded-full border-2 border-gray-200"
          style={{
            width: '110px',
            height: '110px',
            backgroundColor: data[2].color,
            right: '10%',
            bottom: '0%',
            zIndex: 3
          }}
        >
          <div className="text-center text-gray-200">
            <div className="text-2xl font-bold ">{data[2].percent}%</div>
            <div className="text-xs mt-1">{data[2].name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceUsage;