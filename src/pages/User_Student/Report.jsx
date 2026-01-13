import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageContainer } from "@/components/common/Page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Search,
    Download,
    FileText,
    Filter,
    Loader2,
    ChevronDown,
    ArrowLeft
} from "lucide-react";
import api from "@/utils/api";
import logo from "@/assets/logo_tracknity.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Report() {
    // --- STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [timeRange, setTimeRange] = useState("View All Time");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch real history
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

    // --- FILTER LOGIC ---
    const filteredData = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return historyData.filter(item => {
            const dateOut = new Date(item.createdAt);

            // 1. Time Range
            let matchesTime = true;
            if (timeRange === "Today") matchesTime = dateOut >= startOfDay;
            else if (timeRange === "This Week") matchesTime = dateOut >= startOfWeek;
            else if (timeRange === "This Month") matchesTime = dateOut >= startOfMonth;
            else if (timeRange === "This Year") matchesTime = dateOut >= startOfYear;

            // 2. Status
            let matchesStatus = true;
            if (statusFilter !== "All Status") {
                matchesStatus = item.status === statusFilter;
            }

            // 3. Search
            const searchLower = searchTerm.toLowerCase();
            const equipmentName = (item.equipment?.name || "Unknown").toLowerCase();
            const category = (item.equipment?.category || "General").toLowerCase();
            const matchesSearch = equipmentName.includes(searchLower) || category.includes(searchLower);

            return matchesTime && matchesStatus && matchesSearch;
        }).map((item, index) => {
            // Calculate Display Values
            const start = new Date(item.createdAt);
            const displayDate = start.toLocaleDateString();

            const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTimeStr = item.returnTime ?
                new Date(item.returnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                "Active";

            // "09:00 AM - 05:00 PM"
            const displayDuration = `${startTimeStr} - ${endTimeStr}`;

            return {
                ...item,
                no: index + 1,
                equipmentName: item.equipment?.name || "Unknown",
                // Mock Serial if missing
                serialNumber: item.equipment?.serialNumber || `SN-00${index + 1}`,
                category: item.equipment?.category || "General",
                displayDate,
                displayDuration,
                // Hardcoded Location for "University" feel
                location: "Building C, Room 201",
                status: item.status ? item.status.toUpperCase() : "UNKNOWN"
            };
        });
    }, [historyData, timeRange, statusFilter, searchTerm]);

    // --- PDF EXPORT (EXACT REFERENCE MATCH) ---
    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // 1. HEADER LOGO
        try {
            const imgProps = doc.getImageProperties(logo);
            const imgWidth = 22; // Slightly smaller logo
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            doc.addImage(logo, 'PNG', 20, 10, imgWidth, imgHeight);
        } catch (e) {
            console.warn("Logo error", e);
        }

        // 2. HEADER TEXT (Centers aligned)
        // Main University Name
        doc.setFontSize(16);
        doc.setTextColor(11, 29, 58); // Dark Blue #0b1d3a
        doc.setFont("helvetica", "bold");
        doc.text("ADVENTIST UNIVERSITY", 70, 18);
        doc.text("OF CENTRAL AFRICA", 70, 25);

        // Address Lines
        doc.setFontSize(9);
        doc.setTextColor(100); // Gray
        doc.setFont("helvetica", "normal");
        // Centered below title
        doc.text("Gishushu Campus | P.O. Box 2461 Remera, Kigali, Rwanda", 105, 33, { align: "center" });
        doc.text("Phone: +250 788 888 888 | Email: info@auca.ac.rw", 105, 38, { align: "center" });

        // Report Title
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246); // Bright Blue (like reference)
        doc.setFont("helvetica", "bold");
        doc.text("EQUIPMENT REPORT", 105, 50, { align: "center" });

        // 3. METADATA BOX
        // Draw Rounded Rectangle
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setFillColor(248, 250, 252); // slate-50 (Very light gray)
        doc.roundedRect(14, 55, 182, 32, 2, 2, 'FD');

        // Fields inside the box
        doc.setFontSize(9);
        doc.setTextColor(0);

        // Col 1 Labels
        doc.setFont("helvetica", "bold");
        doc.text("Report ID:", 20, 63);
        doc.text("Prepared By:", 20, 70);
        doc.text("Generated On:", 20, 77);

        // Col 1 Values
        doc.setFont("helvetica", "normal");
        doc.text(`RPT-${Math.floor(10000000 + Math.random() * 90000000)}`, 50, 63);
        doc.text("Juls (Student)", 50, 70); // Placeholder or dynamic if user context exists
        doc.text(new Date().toLocaleDateString(), 50, 77);

        // Col 2 Labels (Right aligned roughly)
        doc.setFont("helvetica", "bold");
        doc.text("Period:", 120, 63);
        doc.text("Total Records:", 120, 70);
        doc.text("Status:", 120, 77);

        // Col 2 Values
        doc.setFont("helvetica", "normal");
        doc.text(timeRange, 150, 63); // "View All Time"
        doc.text(filteredData.length.toString(), 150, 70);

        // Status "VERIFIED" Badge simulated
        doc.setFillColor(220, 252, 231); // Green-100
        doc.rect(148, 73, 22, 6, 'F');
        doc.setTextColor(22, 163, 74); // Green-600
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("VERIFIED", 151, 77);

        // 4. TABLE
        const tableColumn = [
            "No.",
            "Equipment Name",
            "Serial Number",
            "Category",
            "Borrowed Date",
            "Duration",
            "Last Known Location",
            "Status"
        ];

        const tableRows = filteredData.map(item => [
            item.no,
            item.equipmentName,
            item.serialNumber, // added
            item.category,
            item.displayDate,
            item.displayDuration.replace(" - ", "\nto\n"), // Stack times: "9:00 AM" newline "5:00 PM"
            item.location, // added
            item.status
        ]);

        autoTable(doc, {
            startY: 92,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid', // Required for Reference Look
            headStyles: {
                fillColor: [11, 29, 58], // Dark Blue Header
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                fontSize: 8,
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 8,
                textColor: 50,
                cellPadding: 3,
                halign: 'center',
                valign: 'middle',
                lineColor: 220
            },
            columnStyles: {
                0: { cellWidth: 10 },               // No
                1: { cellWidth: 35, halign: 'left' }, // Name
                2: { cellWidth: 20 },               // Serial
                3: { cellWidth: 18 },               // Category
                4: { cellWidth: 22 },               // Date
                5: { cellWidth: 25 },               // Duration
                6: { cellWidth: 30 },               // Location
                7: { cellWidth: 22, fontStyle: 'bold' } // Status
            },
            alternateRowStyles: { fillColor: [255, 255, 255] }, // Keeps white background
        });

        // 5. SIGNATURES
        const finalY = doc.lastAutoTable.finalY + 20;

        // Ensure space
        if (finalY > 250) {
            doc.addPage();
        }

        doc.setFontSize(10);
        doc.setTextColor(0);

        // Left: Reviewed By
        let yPos = finalY;
        doc.setFont("helvetica", "bold"); doc.text("Reviewed By:", 20, yPos);
        yPos += 12;
        doc.setFont("helvetica", "normal"); doc.text("Name: ______________________", 20, yPos);
        yPos += 10;
        doc.text("Signature: __________________", 20, yPos);
        yPos += 10;
        doc.text("Date: _______________________", 20, yPos);

        // Right: Approved By
        yPos = finalY;
        doc.setFont("helvetica", "bold"); doc.text("Approved By:", 120, yPos);
        yPos += 12;
        doc.setFont("helvetica", "normal"); doc.text("Name: ______________________", 120, yPos);
        yPos += 10;
        doc.text("Signature: __________________", 120, yPos);
        yPos += 10;
        doc.text("Date: _______________________", 120, yPos);

        // 6. BOTTOM FOOTER (Tracking System)
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Tracknity System • Automated Report • Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
        }

        doc.save("Tracknity_Student_Report.pdf");
    };

    // --- CSV EXPORT ---
    const handleExportCSV = () => {
        const headers = ["No.", "Equipment", "Serial Number", "Category", "Borrowed Date", "Duration", "Location", "Status"];
        const rows = filteredData.map(item => [
            item.no,
            item.equipmentName,
            item.serialNumber,
            item.category,
            item.displayDate,
            item.displayDuration,
            item.location,
            item.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <StudentLayout><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div></StudentLayout>;

    return (
        <StudentLayout>
            <PageContainer>
                {/* HEADER + BACK BUTTON (Aligned with EquipmentCatalogue) */}
                <div className="mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 hover:bg-transparent text-slate-500 hover:text-[#0b1d3a] mb-4 -ml-2"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">My Reports</h1>
                        <p className="text-slate-500 mt-1">Detailed ledger of your equipment usage.</p>
                    </div>
                </div>

                {/* FILTERS (Constrained width to match header) */}
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs tracking-wider min-w-[80px]">
                            <Filter className="w-4 h-4" /> Filters
                        </div>

                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Report..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#126dd5] transition-colors"
                            />
                        </div>

                        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 px-1">
                            {/* Time Range */}
                            <div className="relative">
                                <select
                                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg py-2.5 pl-3 pr-8 focus:border-[#126dd5] outline-none cursor-pointer min-w-[130px]"
                                    value={timeRange}
                                    onChange={e => setTimeRange(e.target.value)}
                                >
                                    <option>View All Time</option>
                                    <option>Today</option>
                                    <option>This Week</option>
                                    <option>This Month</option>
                                    <option>This Year</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Status */}
                            <div className="relative">
                                <select
                                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg py-2.5 pl-3 pr-8 focus:border-[#126dd5] outline-none cursor-pointer min-w-[130px]"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    <option>All Status</option>
                                    <option>Returned</option>
                                    <option>Active</option>
                                    <option>Overdue</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Disabled Filters */}
                            <div className="relative">
                                <select className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg py-2.5 pl-3 pr-8 outline-none cursor-not-allowed opacity-60 min-w-[130px]" disabled>
                                    <option>All Conditions</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[#126dd5] font-bold uppercase text-xs tracking-wider">
                            <FileText className="w-4 h-4" /> Actions
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                onClick={handleDownloadPDF}
                                className="bg-[#126dd5] hover:bg-[#0b1d3a] text-white flex-1 sm:flex-none font-semibold shadow-md rounded-lg"
                            >
                                <FileText className="w-4 h-4 mr-2" /> Generate PDF Report
                            </Button>
                            <Button
                                onClick={handleExportCSV}
                                variant="outline"
                                className="border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex-1 sm:flex-none rounded-lg focus:ring-0 active:text-slate-900"
                            >
                                <Download className="w-4 h-4 mr-2" /> Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* UI TABLE (WEB VIEW - SIMPLIFIED) */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <h2 className="font-bold text-[#0b1d3a]">Report Data Preview</h2>
                            <span className="text-xs font-medium text-slate-400">{filteredData.length} Records Found</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="p-4 pl-6 w-16">No.</th>
                                        <th className="p-4">Equipment</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Borrowed Date</th>
                                        <th className="p-4">Duration</th>
                                        <th className="p-4 text-right pr-6">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, idx) => (
                                            <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 pl-6 text-slate-400 text-sm font-mono">{idx + 1}</td>
                                                <td className="p-4 font-bold text-[#0b1d3a]">
                                                    <div className="flex flex-col">
                                                        <span>{item.equipmentName}</span>
                                                        <span className="text-[10px] text-slate-400 font-normal font-mono uppercase tracking-wide">ID: {item._id.slice(-8)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium border border-slate-200 shadow-none hover:bg-slate-200">
                                                        {item.category}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 font-medium">
                                                    {item.displayDate}
                                                </td>
                                                <td className="p-4 text-sm text-slate-500 font-mono">
                                                    {item.displayDuration}
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <Badge className={`font-bold border-0 shadow-sm ${item.status === 'RETURNED' || item.status === 'Returned' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                                                        item.status === 'OVERDUE' || item.status === 'Overdue' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' :
                                                            'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                        }`}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                        <FileText className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <p className="font-medium">No records found matching your filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </StudentLayout>
    );
}