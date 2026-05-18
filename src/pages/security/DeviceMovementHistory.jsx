import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import DeviceMovementTimeline from "./components/DeviceMovementTimeline";
import StatCard from "@/components/security/StatCard";
import {
  buildEquipmentMovementTimeline,
  computeMovementStats,
  filterTransactionsForEquipment,
  dedupeTransactions,
} from "@/components/lib/movementHistoryData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Activity, AlertTriangle, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "@/components/common/Loader";
import api from "@/utils/api";

export default function DeviceMovementHistory() {
  const { t } = useTranslation(["security", "common"]);
  const { deviceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceName, setDeviceName] = useState("");
  const [deviceMeta, setDeviceMeta] = useState(null);

  const effectiveDeviceId = deviceId || searchParams.get("device");

  const stats = useMemo(() => computeMovementStats(movements), [movements]);

  useEffect(() => {
    if (!effectiveDeviceId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [equipRes, historyRes, activeRes] = await Promise.all([
          api.get(`/equipment/${effectiveDeviceId}`),
          api.get("/transactions/all-history").catch(() => ({ data: [] })),
          api.get("/transactions/active").catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        const equipment = equipRes.data;
        const name =
          equipment?.name ||
          equipment?.equipmentName ||
          t("deviceMovementHistory.unknownDevice", "Equipment");
        setDeviceName(name);
        setDeviceMeta(equipment);

        const equipId = equipment?._id || equipment?.id || effectiveDeviceId;
        const allHistory = Array.isArray(historyRes.data) ? historyRes.data : [];
        const activeList = Array.isArray(activeRes.data)
          ? activeRes.data
          : activeRes.data?.data || [];

        const related = dedupeTransactions([
          ...filterTransactionsForEquipment(allHistory, equipId, name),
          ...filterTransactionsForEquipment(activeList, equipId, name),
        ]);

        const timeline = buildEquipmentMovementTimeline({
          transactions: related,
          deviceName: name,
          includeStorageBaseline: true,
        });

        setMovements(timeline);
      } catch (err) {
        console.error("Device movement history load failed:", err);
        if (!cancelled) {
          setDeviceName(t("deviceMovementHistory.unknownDevice", "Equipment"));
          setMovements(
            buildEquipmentMovementTimeline({
              transactions: [],
              deviceName: t("deviceMovementHistory.unknownDevice", "Equipment"),
              includeStorageBaseline: true,
            })
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveDeviceId, t]);

  const backToDevices = () => navigate("/security/devices");

  const HeroSection = (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        onClick={backToDevices}
        className="w-fit text-white/80 hover:text-white hover:bg-white/10 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("deviceMovementHistory.backToDevices")}
      </Button>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {t("deviceMovementHistory.title")}
        </h1>
        <p className="text-white/70 mt-1 text-sm sm:text-base">
          {deviceName}
          {deviceMeta?.serialNumber ? ` · ${deviceMeta.serialNumber}` : ""}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout heroContent={HeroSection}>
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (!effectiveDeviceId) {
    return (
      <MainLayout heroContent={HeroSection}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t("deviceMovementHistory.noDeviceSelected.title")}
          </h3>
          <p className="text-slate-600 mb-4">
            {t("deviceMovementHistory.noDeviceSelected.description")}
          </p>
          <Button onClick={backToDevices}>{t("deviceMovementHistory.noDeviceSelected.button")}</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout heroContent={HeroSection}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title={t("deviceMovementHistory.stats.totalMovements")}
            value={stats.totalMovements}
            icon={Activity}
          />
          <StatCard
            title={t("deviceMovementHistory.stats.checkouts")}
            value={stats.checkouts}
            icon={Package}
          />
          <StatCard
            title={t("deviceMovementHistory.stats.violations")}
            value={stats.violations}
            icon={AlertTriangle}
            isAlert={stats.violations > 0}
          />
          <StatCard
            title={t("deviceMovementHistory.stats.uniqueLocations")}
            value={stats.uniqueLocations}
            icon={MapPin}
          />
        </div>

        <DeviceMovementTimeline
          movements={movements}
          deviceName={deviceName}
          deviceId={effectiveDeviceId}
        />
      </div>
    </MainLayout>
  );
}
