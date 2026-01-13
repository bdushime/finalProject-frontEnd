import MainLayout from "./layout/MainLayout";
import ReportsContent from "@/components/reports/ReportsContent";

const SECURITY_REPORT_TYPES = [
  { value: "inventory", label: "Equipment Inventory Report" },
  { value: "damaged", label: "Damaged Equipment Report" },
  { value: "lost", label: "Lost Equipment Report" },
  { value: "utilization", label: "Equipment Utilization Report" },
  { value: "logs", label: "Device Movement Logs Report" },
];

export default function SecurityReports() {
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

