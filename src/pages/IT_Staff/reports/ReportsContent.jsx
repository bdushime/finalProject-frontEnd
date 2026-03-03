import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Search, Filter, RefreshCw, Loader2, FileBarChart2 } from "lucide-react";
import { generateReportData, exportToCSV, exportToPDF } from "./reportService";
import { toast } from "sonner";

export default function ReportsContent({
  reportTypes = [],
  defaultReportType = "lending",
  exportFilenamePrefix = "report"
}) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]); // Initialize as empty array [] to prevent crashes
  const [hasGenerated, setHasGenerated] = useState(false); // Track if we have tried to generate yet

  // Filter States
  const defaultFilters = {
    reportType: defaultReportType,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0],
    category: "all",
    status: "all",
    borrower: ""
  };

  const [filters, setFilters] = useState(defaultFilters);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData([]);

    try {
      const data = await generateReportData(filters);

      // Safety check: Ensure data is an array
      if (Array.isArray(data)) {
        setReportData(data);
      } else {
        setReportData([]);
        console.error("Data received was not an array:", data);
      }
      setHasGenerated(true);
    } catch (error) {
      console.error("Report generation failed:", error);
      toast.error("Failed to generate report. Please try again.");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setReportData([]);
    setHasGenerated(false);
  };

  // --- 2. EXPORT HANDLERS ---
  const getTableHeaders = () => {
    // Dynamic headers based on report type
    switch (filters.reportType) {
      case "lending": return ["Equipment", "Serial #", "Borrower", "Borrowed", "Due", "Status"];
      case "reservation": return ["Equipment", "Borrower", "Start", "End", "Status"];
      case "utilization": return ["Equipment", "Category", "Total Checkouts", "Utilization"];
      default: return ["Details"];
    }
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = getTableHeaders();
    // Use the first item keys to map data
    const keys = Object.keys(reportData[0] || {}).filter(k => k !== 'id');

    exportToCSV(reportData, headers, (item) => keys.map(k => item[k]), `${exportFilenamePrefix}-csv`);
  };

  const handleExportPDF = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = getTableHeaders();
    const keys = Object.keys(reportData[0] || {}).filter(k => k !== 'id');

    exportToPDF(reportData, headers, (item) => keys.map(k => item[k]), filters.reportType, filters.startDate, filters.endDate, `${exportFilenamePrefix}-pdf`);
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-slate-50/50">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1d3a]">Reports</h1>
          <p className="text-slate-500">Generate and view detailed reports on equipment usage and activity.</p>
        </div>

        {/* Export Buttons */}
        {reportData.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} className="bg-white">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="bg-white">
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* FILTERS CARD */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-[#0b1d3a] flex items-center gap-2">
            <Filter className="h-5 w-5" /> Report Filters
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type <span className="text-red-500">*</span></Label>
              <Select
                value={filters.reportType}
                onValueChange={(val) => setFilters(prev => ({ ...prev, reportType: val }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Report" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category}
                onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Laptop">Laptops</SelectItem>
                  <SelectItem value="Projector">Projectors</SelectItem>
                  <SelectItem value="Camera">Cameras</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Borrower Search */}
            <div className="space-y-2">
              <Label>Borrower (Name)</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search name..."
                  className="pl-9 bg-white"
                  value={filters.borrower}
                  onChange={(e) => setFilters(prev => ({ ...prev, borrower: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-50">
            <Button variant="outline" onClick={handleResetFilters} className="bg-white">
              <RefreshCw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
            <Button onClick={handleGenerateReport} disabled={loading} className="bg-[#0b1d3a] hover:bg-[#1a2f55] min-w-[140px]">
              {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RESULTS SECTION */}
      <div className="min-h-[300px] transition-all">
        {!hasGenerated ? (
          // EMPTY STATE (Default)
          <div className="bg-[#fff9e6] border border-yellow-100 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <FileBarChart2 className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No Report Generated</h3>
            <p className="text-slate-500 max-w-md">
              Use the filters above to generate a report. Click "Generate Report" to see the data.
            </p>
          </div>
        ) : (
          // DATA TABLE STATE
          <Card className="border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-[#0b1d3a]">Report Results</h3>
              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                {reportData.length} Records Found
              </span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    {/* Dynamic Headers */}
                    {Object.keys(reportData[0] || {}).filter(k => k !== 'id').map((key) => (
                      <TableHead key={key} className="font-semibold text-[#0b1d3a] capitalize whitespace-nowrap">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-slate-500">
                        No records found matching these criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.map((row, idx) => (
                      <TableRow key={row.id || idx} className="hover:bg-slate-50">
                        {Object.entries(row).filter(([k]) => k !== 'id').map(([key, value], i) => (
                          <TableCell key={i} className="whitespace-nowrap text-sm text-slate-600">
                            {key === 'status' ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                 ${value === 'Overdue' ? 'bg-red-100 text-red-800' :
                                  value === 'Checked Out' ? 'bg-blue-100 text-blue-800' :
                                    value === 'Returned' ? 'bg-green-100 text-green-800' :
                                      'bg-slate-100 text-slate-800'}`}>
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}