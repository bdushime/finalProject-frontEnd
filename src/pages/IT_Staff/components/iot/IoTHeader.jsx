import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/Page";
import { Activity, RefreshCw } from "lucide-react";

export default function IoTHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <PageHeader
        title="IoT Tracker Live View"
        subtitle="Real-time monitoring of trackers"
        className="mb-0 pt-0"
      />
      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
          <span className="relative flex h-2.5 w-2.5 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Live Connection Active
        </div>
      </div>
    </div>
  );
}



