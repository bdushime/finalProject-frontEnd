import MainLayout from "@/components/layout/MainLayout";
import ReportsContent from "@/components/reports/ReportsContent";

const IT_REPORT_TYPES = [
  { value: "lending", label: "Equipment Lending Report" },
  { value: "reservation", label: "Equipment Reservation Report" },
  { value: "damaged", label: "Damaged Equipment Report" },
  { value: "lost", label: "Lost Equipment Report" },
  { value: "utilization", label: "Equipment Utilization Report" },
];

export default function ReportsPage() {

  return (
    <MainLayout>
      <ReportsContent
        reportTypes={IT_REPORT_TYPES}
        defaultReportType="lending"
        showBorrowerFilter={true}
        exportFilenamePrefix="equipment-report"
      />
    </MainLayout>
  );
}
