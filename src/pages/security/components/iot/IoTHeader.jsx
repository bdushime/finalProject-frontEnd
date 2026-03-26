import { useTranslation } from "react-i18next";

export default function IoTHeader() {
  const { t } = useTranslation(["itstaff"]);
  return (
    <div className="flex text-slate-100 flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="mt-4 pt-0">
        <h1 className="text-slate-100 mb-1 text-2xl font-bold">
          {t("iot.title")}
        </h1>
        <p className="text-slate-300 text-sm">{t("iot.subtitle")}</p>
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
          <span className="relative flex h-2.5 w-2.5 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          {t("iot.liveConnection")}
        </div>
      </div>
    </div>
  );
}

