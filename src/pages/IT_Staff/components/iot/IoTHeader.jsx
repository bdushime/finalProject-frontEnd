export default function IoTHeader() {
  return (
    <div className="flex flex-col border-gray-200 shadow-sm p-4 rounded-lg sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">IoT Tracker Live View</h1>
        <p className="text-muted-foreground mt-1">
          Real-time monitoring of TTGO/ESP32 trackers across campus
        </p>
      </div>
    </div>
  );
}



