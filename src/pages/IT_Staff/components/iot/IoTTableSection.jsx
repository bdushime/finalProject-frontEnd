import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Wifi,
  WifiOff,
  Battery,
  Thermometer,
  Droplets,
  History,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getBatteryColor,
  getBatteryProgressColor,
  getTemperatureColor,
  formatLastSeen,
} from "./iotUtils";

export function IoTTableSection({
  viewMode,
  trackers,
  filteredTrackers,
  setSelectedTracker,
  historyData,
  page,
  setPage,
  // pageSize,
}) {
  if (viewMode !== "table") return null;

  const effectivePageSize = 10;

  const totalItems = filteredTrackers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * effectivePageSize;
  const endIndex = startIndex + effectivePageSize;
  const currentTrackers = filteredTrackers.slice(startIndex, endIndex);

  return (
    <>
      {/* Desktop table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Tracker Details</CardTitle>
          <CardDescription>
            Showing {currentTrackers.length} of {trackers.length} trackers
          </CardDescription>
          <CardDescription>
            Page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className=" font-bold text-gray-800">
                  <TableHead>Equipment</TableHead>
                  <TableHead>Tracker ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTrackers.map((tracker) => (
                  <TableRow
                    key={tracker.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTracker(tracker)}
                  >
                    <TableCell className="font-medium">
                      {tracker.equipment}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {tracker.id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-center">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {tracker.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tracker.status === "online"
                            ? "default"
                            : "destructive"
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {tracker.status === "online" ? (
                          <Wifi className="h-3 w-3" />
                        ) : (
                          <WifiOff className="h-3 w-3" />
                        )}
                        {tracker.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Battery
                          className={`h-4 w-4 ${getBatteryColor(
                            tracker.battery
                          )}`}
                        />
                        <div className="flex-1">
                          <Progress value={tracker.battery} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {tracker.battery}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Thermometer
                          className={`h-4 w-4 ${getTemperatureColor(
                            tracker.temperature
                          )}`}
                        />
                        <span>{tracker.temperature}°C</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>{tracker.humidity}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatLastSeen(tracker.lastSeen)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTracker(tracker);
                          }}
                        >
                          <History className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {currentTrackers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No trackers found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <div className="flex justify-center gap-4 items-center mt-4 p-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="border-gray-200 shadow-sm bg-background rounded-lg"
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </Card>

      {/* Mobile / card view */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden mt-4">
        {currentTrackers.map((tracker) => (
          <Card
            key={tracker.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedTracker(tracker)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{tracker.equipment}</CardTitle>
                  <CardDescription className="mt-1">
                    <code className="text-xs">{tracker.id}</code>
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    tracker.status === "online" ? "default" : "destructive"
                  }
                  className="flex items-center gap-1"
                >
                  {tracker.status === "online" ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                  {tracker.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {tracker.location}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Battery
                      className={`h-4 w-4 ${getBatteryColor(tracker.battery)}`}
                    />
                    <span>Battery</span>
                  </div>
                  <span className="font-medium">{tracker.battery}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                  <div
                    className={`h-full transition-all ${getBatteryProgressColor(
                      tracker.battery
                    )}`}
                    style={{ width: `${tracker.battery}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer
                    className={`h-4 w-4 ${getTemperatureColor(
                      tracker.temperature
                    )}`}
                  />
                  <div>
                    <div className="text-muted-foreground">Temp</div>
                    <div className="font-medium">{tracker.temperature}°C</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-muted-foreground">Humidity</div>
                    <div className="font-medium">{tracker.humidity}%</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">
                  Last seen: {formatLastSeen(tracker.lastSeen)}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTracker(tracker);
                      }}
                    >
                      <History className="h-3 w-3 mr-2" />
                      View History
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        Device History - {tracker.equipment}
                      </DialogTitle>
                      <DialogDescription>
                        {tracker.id} • {tracker.location}
                      </DialogDescription>
                    </DialogHeader>
                    <TrackerHistoryChart
                      data={historyData[tracker.id] || []}
                      tracker={tracker}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export function TrackerHistoryDialog({
  selectedTracker,
  onClose,
  historyData,
}) {
  if (!selectedTracker) return null;

  return (
    <Dialog
      open={!!selectedTracker}
      onOpenChange={(open) => !open && onClose()}
      className="border-gray-200 shadow-sm"
    >
      <DialogContent className="max-w-2xl border-gray-200 shadow-sm bg-[#8D8DC7] rounded-lg">
        <DialogHeader>
          <DialogTitle>
            Device History - {selectedTracker.equipment}
          </DialogTitle>
          <DialogDescription>
            {selectedTracker.id} • {selectedTracker.location}
          </DialogDescription>
        </DialogHeader>
        <TrackerHistoryChart
          data={historyData[selectedTracker.id] || []}
          tracker={selectedTracker}
        />
      </DialogContent>
    </Dialog>
  );
}

function TrackerHistoryChart({ data, tracker }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">
          Battery & Temperature Trends (Last Hour)
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: "currentColor" }}
            />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="battery"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Battery %"
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="temperature"
              stroke="#ef4444"
              strokeWidth={2}
              name="Temperature °C"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-sm text-muted-foreground">Current Battery</p>
          <p className="text-2xl font-bold">{tracker.battery}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Temperature</p>
          <p className="text-2xl font-bold">{tracker.temperature}°C</p>
        </div>
      </div>
    </div>
  );
}
