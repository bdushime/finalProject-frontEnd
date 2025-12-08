import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, CircleDot, ArrowLeft } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import BorrowingHistory from "./components/BorrowingHistory";

export default function EquipmentDetails() {
  const { id } = useParams(); // tracker / equipment ID from route
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trackersRes, historyRes] = await Promise.all([
          fetch("/trackers.json"),
          fetch("/borrow-history.json"),
        ]);

        const trackers = await trackersRes.json();
        const histories = await historyRes.json();

        const foundEquipment = trackers.find((t) => t.id === id);
        const historyEntry = histories.find((h) => h.id === id);

        setEquipment(foundEquipment || null);
        setHistory(historyEntry?.history || []);
      } catch (e) {
        console.error("Failed to load equipment details", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <p className="text-sm text-neutral-500">Loading equipment details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!equipment) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          <Button
            variant="ghost"
            className="mb-2"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-6 w-6 font-bold" />
          </Button>
          <p className="text-sm text-red-600">Equipment not found.</p>
        </div>
      </MainLayout>
    );
  }

  const statusLabel = equipment.status === "online" ? "Available (online)" : "Offline";

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <Button
          variant="ghost"
          className="mb-4"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-6 w-6 font-bold" />
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-lg bg-white p-5 lg:col-span-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{equipment.equipment}</h2>
                <p className="text-sm text-neutral-500">Tracker ID: {equipment.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-neutral-100 ${equipment.status === "online" ? "bg-emerald-100" : "bg-red-400"}`}>
                  <CircleDot className={`h-3.5 w-3.5 ${equipment.status === "online" ? "text-emerald-600" : "text-red-500"}`} />
                  {equipment.status === "online" ? "Available (online)" : "Offline"}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="aspect-video w-full rounded-xl bg-neutral-100" />
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Location:</span> {equipment.location}
                </p>
                <p>
                  <span className="font-medium">Last seen:</span>{" "}
                  {new Date(equipment.lastSeen).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Battery:</span> {equipment.battery}%
                </p>
                <p>
                  <span className="font-medium">Temperature:</span>{" "}
                  {equipment.temperature}°C
                </p>
                <p>
                  <span className="font-medium">Humidity:</span> {equipment.humidity}%
                </p>
              </div>
            </div>

            {/* Borrow history table - should enable sorting by borrower name, borrowed at, due date, returned at, and status */}
            <BorrowingHistory history={history} />

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl shadow-lg bg-white p-5"
          >
            <h3 className="font-semibold mb-4">QR Code</h3>
            <div className="aspect-square rounded-xl grid place-items-center bg-neutral-50">
              <QrCode className="h-28 w-28 text-neutral-400" />
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
