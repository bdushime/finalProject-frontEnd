import React from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@components/ui/tooltip";

const Progressbar = () => {
  const stages = [
    { label: "Lost/Stolen", percentage: 15, bg: "bg-gray-900", text: "text-white" },
    { label: "Maintenance", percentage: 15, bg: "bg-amber-400", text: "text-gray-900" },
    { label: "Active", percentage: 60, striped: true },
    { label: "Inactive", percentage: 10, bordered: true },
  ];

  return (
    <div className="md:w-1/2 w-full max-w-3xl">
      
      {/* Labels aligned to segment start - hidden on small screens */}
      <div className="hidden sm:flex text-sm text-gray-600">
        {stages.map((stage, index) => (
          <div
            key={index}
            style={{ width: `${stage.percentage}%` }}
            className="flex justify-center"
          >
            <span className="whitespace-nowrap">
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative flex h-10 gap-1 rounded-full overflow-hidden">
        {stages.map((stage, index) => {
          const isFirst = index === 0;
          const isLast = index === stages.length - 1;

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  style={{ width: `${stage.percentage}%` }}
                  className={`relative flex items-center justify-center rounded-full overflow-hidden cursor-pointer
                    ${stage.bg || "bg-gray-200"}
                    
                  `}
                >
                  {/* Striped background */}
                  {stage.striped && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(0,0,0,0.08) 6px, rgba(0,0,0,0.08) 12px)",
                      }}
                    />
                  )}

                  {/* Percentage */}
                  <span className={`relative z-10 text-xs font-medium ${isFirst ? "text-white" : "text-gray-700"}`}>
                    {stage.percentage}%
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="sm:hidden">
                <p>{stage.label}: {stage.percentage}%</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default Progressbar;
