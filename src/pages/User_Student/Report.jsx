import { useState, useMemo, useEffect } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Filter,
    ChevronDown,
    FileText,
    Loader2
} from "lucide-react";
import api from "@/utils/api";
// import logo from "@/assets/images/logo8noback.png"; // Uncomment if you have the logo

const TIME_RANGES = ["View All Time", "Today", "This Week", "This Month", "This Year"];

export default function Report() {
    const [searchTerm, setSearchTerm] = useState("");
    const [timeRange, setTimeRange] = useState("View All Time");
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. FETCH REAL HISTORY ---
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // We reuse the existing endpoint. 
                // Ideally, the backend should support pagination or ?limit=all
                const res = await api.get('/transactions/my-history');
                setHistoryData(res.data);
            } catch (err) {
                console.error("Failed to load history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // --- 2. ENHANCE DATA (Calculate Impact) ---
    const enhancedData = useMemo(() => {
        return historyData.map(item => {
            let impact = 0;
            let impactLabel = "Neutral";

            // Calculate Impact based on Status
            // You can align these numbers with your Backend Logic
            if (item.status === 'Returned') {
                impact = 5; 
                impactLabel = "Standard Return";
                
                // Check if late (simple check)
                if (new Date(item.returnTime) > new Date(item.expectedReturnTime)) {
                    impact = -10;
                    impactLabel = "Late Return";
                }
            } else if (item.status === 'Overdue') {
                impact = -10;
                impactLabel = "Overdue Penalty";
            }

            // Calculate Duration
            const start = new Date(item.createdAt);
            const end = item.returnTime ? new Date(item.returnTime) : new Date();
            const durationMs = end - start;
            const daysBorrowed = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

            return { 
                ...item, 
                equipmentName: item.equipment?.name || "Unknown Item",
                category: item.equipment?.category || "General",
                daysBorrowed,
                impact, 
                impactLabel 
            };
        });
    }, [historyData]);

    // --- 3. FILTER LOGIC ---
    const filteredData = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return enhancedData.filter(item => {
            const dateOut = new Date(item.createdAt);

            // Time Filter
            let matchesTime = true;
            if (timeRange === "Today") matchesTime = dateOut >= startOfDay;
            else if (timeRange === "This Week") matchesTime = dateOut >= startOfWeek;
            else if (timeRange === "This Month") matchesTime = dateOut >= startOfMonth;
            else if (timeRange === "This Year") matchesTime = dateOut >= startOfYear;

            // Search Filter
            const matchesSearch =
                item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item._id.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesTime && matchesSearch;
        });
    }, [enhancedData, timeRange, searchTerm]);

    // CSV Export
    const handleExportCSV = () => {
        const headers = ["ID", "Equipment", "Category", "Borrowed Date", "Returned Date", "Duration", "Status", "Score Impact"];
        const rows = filteredData.map(item => [
            item._id,
            item.equipmentName,
            item.category,
            new Date(item.createdAt).toLocaleDateString(),
            item.returnTime ? new Date(item.returnTime).toLocaleDateString() : "Active",
            `${item.daysBorrowed} Days`,
            item.status,
            item.impact
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `tracknity_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getImpactColor = (impact) => {
        if (impact > 0) return "text-emerald-600 bg-emerald-50 border-emerald-100";
        if (impact < 0) return "text-rose-600 bg-rose-50 border-rose-100";
        return "text-slate-500 bg-slate-50 border-slate-100";
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="h-screen flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" /> Generating report...
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <PageContainer>
                {/* Header Actions - Hidden on Print */}
                <div className="print:hidden">
                    <BackButton to="/student/score" label="Back to Score" />
                    <PageHeader
                        title="My Reports"
                        subtitle="Detailed ledger of your equipment usage and reliability score impact."
                    />
                </div>

                {/* Print Only Header */}
                <div className="hidden print:block print:mb-8 print:border-b print:border-slate-300 print:pb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {/* <img src={logo} alt="Tracknity" className="h-10 w-10 object-contain" /> */}
                            <div>
                                <h1 className="text-2xl font-bold text-[#0b1d3a]">Tracknity Student Report</h1>
                                <p className="text-sm text-slate-500">Official Usage Record</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800">Generated On: {new Date().toLocaleDateString()}</p>
                            <p className="text-sm text-slate-500">Student Report</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] print:border-0 print:shadow-none print:rounded-none">

                    {/* Toolbar - Hidden on Print */}
                    <div className="print:hidden p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/50">
                        <div className="flex flex-1 gap-3 w-full lg:w-auto items-center">
                            <div className="relative flex-grow max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search history..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10 rounded-lg bg-white border-slate-200 focus:ring-1 focus:ring-[#0b1d3a] text-sm"
                                />
                            </div>

                            <div className="relative group">
                                <select
                                    className="appearance-none bg-white text-slate-700 py-2.5 pl-3 pr-8 rounded-lg text-sm border border-slate-200 hover:border-[#0b1d3a] focus:outline-none focus:ring-1 focus:ring-[#0b1d3a] cursor-pointer min-w-[140px] font-medium shadow-sm transition-all"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                >
                                    {TIME_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {(searchTerm || timeRange !== "View All Time") && (
                                <button
                                    onClick={() => { setSearchTerm(""); setTimeRange("View All Time"); }}
                                    className="text-slate-500 hover:text-rose-600 text-xs font-bold px-2 py-1 transition-colors whitespace-nowrap"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto justify-end">
                            <Button
                                onClick={() => window.print()}
                                variant="outline"
                                className="h-10 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0b1d3a] gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">PDF</span>
                            </Button>
                            <Button
                                onClick={handleExportCSV}
                                className="h-10 bg-[#0b1d3a] hover:bg-[#126dd5] text-white gap-2 shadow-sm"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto p-0 print:overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100 print:bg-gray-100 print:text-black">
                                    <th className="p-4 pl-6">Equipment</th>
                                    <th className="p-4">Period</th>
                                    <th className="p-4">Duration</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right pr-6">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50 transition-colors group print:break-inside-avoid">
                                            <td className="p-4 pl-6">
                                                <div className="font-bold text-[#0b1d3a] print:text-black">{item.equipmentName}</div>
                                                <div className="text-xs text-slate-500 print:text-gray-600">{item.category} • <span className="font-mono text-[10px]">{item._id.slice(-6)}</span></div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-slate-700 font-medium text-sm print:text-black">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-[11px] text-slate-400 print:text-gray-500">
                                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 font-medium">
                                                {item.daysBorrowed} Days
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className={`border-0 font-bold print:border print:border-gray-300 print:text-black ${
                                                    item.status === 'Returned' ? 'bg-emerald-50 text-emerald-700' :
                                                    item.status === 'Overdue' ? 'bg-rose-50 text-rose-700' :
                                                    'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border print:border-gray-300 print:text-black ${getImpactColor(item.impact)}`}>
                                                    {item.impact > 0 ? <ArrowUpRight className="h-3 w-3" /> : item.impact < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                                    {item.impact > 0 ? `+${item.impact}` : item.impact}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-slate-400">
                                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium">No records found matching your filters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                    <p>Tracknity System • Official Student Report</p>
                </div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .page-container, .page-container * { visibility: visible; }
                        .page-container { position: absolute; left: 0; top: 0; width: 100%; padding: 20px !important; margin: 0 !important; }
                        nav, aside, header { display: none !important; }
                    }
                `}</style>
            </PageContainer>
        </StudentLayout>
    );
}