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

  const HeroSection = (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 mt-4 relative z-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('reports.title')}</h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
            {t('reports.subtitle', 'Comprehensive activity and security analytics')}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout heroContent={HeroSection}>
      <div className="mt-4">
        <ReportsContent
          reportTypes={SECURITY_REPORT_TYPES}
          defaultReportType="inventory"
          showBorrowerFilter={false}
          exportFilenamePrefix="security-report"
        />
      </div>
    </MainLayout>
  );
}

