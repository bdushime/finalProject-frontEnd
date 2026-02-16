import MainLayout from "./layout/MainLayout";
import ReportsContent from "@/components/reports/ReportsContent";
import { useTranslation } from "react-i18next";

export default function SecurityReports() {
  const { t } = useTranslation(["security"]);

  const SECURITY_REPORT_TYPES = [
    { value: "inventory", label: t('reports.types.inventory') },
    { value: "damaged", label: t('reports.types.damaged') },
    { value: "lost", label: t('reports.types.lost') },
    { value: "utilization", label: t('reports.types.utilization') },
    { value: "logs", label: t('reports.types.logs') },
  ];

  return (
    <MainLayout>
      <ReportsContent
        reportTypes={SECURITY_REPORT_TYPES}
        defaultReportType="inventory"
        showBorrowerFilter={false}
        exportFilenamePrefix="security-report"
      />
    </MainLayout>
  );
}

