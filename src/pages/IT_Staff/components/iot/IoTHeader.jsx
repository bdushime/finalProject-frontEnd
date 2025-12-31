import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";

export default function IoTHeader({ isSimulating, onToggleSimulating, onSimulateUpdate }) {
  return (
    <div className="flex flex-col border-gray-200 shadow-sm p-4 rounded-lg sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">IoT Tracker Live View</h1>
        <p className="text-muted-foreground mt-1">
          Real-time monitoring of TTGO/ESP32 trackers across campus
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onToggleSimulating}
          className="flex items-center gap-2 text-gray-500 border-gray-300"
        >
          <Activity
            className={`h-4 w-4 text-gray-500 ${
              isSimulating ? "text-green-500 animate-pulse" : ""
            }`}
          />
          {isSimulating ? "Pause" : "Resume"}
        </Button>
        <Button
          onClick={onSimulateUpdate}
          className="flex items-center gap-2 bg-[#BEBEE0]"
        >
          <RefreshCw className="h-4 w-4" />
          Simulate Update
        </Button>
      </div>
    </div>
  );
}



