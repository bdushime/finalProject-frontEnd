import { useEffect, useState, useMemo } from "react";
import api from "@/utils/api";
import { Loader2, Download, Search, AlertCircle, FileBarChart, ChevronLeft, ChevronRight } from "lucide-react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { PageHeader } from "@/components/common/Page";
// 👇 IMPORT THE NEW GENERATOR
import { generatePDF } from "@/utils/pdfGenerator";
import { useTranslation } from "react-i18next";

export default function SimpleReports() {
    const { t } = useTranslation(["itstaff", "common"]);
    const [transactions, setTransactions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // 👇 NEW: Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get current user for the report header "Prepared By"
    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'IT Staff', role: 'Staff' };

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions/all-history');
                
                // 👇 SAFETY CHECK: Ensure we only save arrays!
                if (Array.isArray(res.data)) {
                    setTransactions(res.data);
                    setFilteredData(res.data);
                } else if (res.data && Array.isArray(res.data.data)) {
                    setTransactions(res.data.data);
                    setFilteredData(res.data.data);
                } else {
                    setTransactions([]);
                    setFilteredData([]);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(t('reports.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [t]);

    // --- 2. FILTER LOGIC ---
    useEffect(() => {
        if (!Array.isArray(transactions)) return; // Safety check

        let result = transactions;

        if (search) {
            result = result.filter(item =>
                item.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
                item.equipment?.name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (categoryFilter !== "All") {
            result = result.filter(item => item.equipment?.category === categoryFilter);
        }

        setFilteredData(result);
        setCurrentPage(1); // 👇 Reset to page 1 whenever filters change
    }, [search, categoryFilter, transactions]);

    // --- 3. PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    // --- 4. HANDLE PDF EXPORT ---
    const handleExportPDF = () => {
        if (!Array.isArray(filteredData) || filteredData.length === 0) {
            return alert(t('reports.messages.noData'));
        }
        // Call our utility function - Export ALL filtered data, not just the page
        generatePDF(filteredData, currentUser);
    };

    return (
        <ITStaffLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <PageHeader
                        title={
                            <span className="flex items-center gap-2">
                                <FileBarChart className="w-8 h-8" /> {t('reports.title')}
                            </span>
                        }
                        subtitle={t('reports.subtitle', { count: Array.isArray(filteredData) ? filteredData.length : 0 })}
                        className="mb-0"
                    />

                    {/* BUTTON NOW USES PDF GENERATOR */}
                    <button
                        onClick={handleExportPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all"
                    >
                        <Download className="w-4 h-4" /> {t('reports.downloadPdf')}
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('reports.searchPlaceholder')}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0b1d3a] focus:border-transparent outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{t('reports.filterBy')}</span>
                        <select
                            className="p-2.5 border border-slate-200 rounded-lg bg-white min-w-[180px] focus:ring-2 focus:ring-[#0b1d3a] outline-none cursor-pointer"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">{t('equipment.categories.all')}</option>
                            <option value="Laptop">{t('equipment.categories.Laptop')}</option>
                            <option value="Projector">{t('equipment.categories.Projector')}</option>
                            <option value="Camera">{t('equipment.categories.Camera')}</option>
                            <option value="Audio">{t('equipment.categories.Audio')}</option>
                        </select>
                    </div>
                </div>

                {/* Main Data Table Wrapper - changed to flex col so pagination stays at bottom */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    {loading ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-[#0b1d3a] gap-3 flex-1">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p className="font-medium animate-pulse">{t('reports.loading')}</p>
                        </div>
                    ) : error ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-red-500 gap-2 flex-1">
                            <AlertCircle className="w-10 h-10" />
                            <p className="font-medium">{error}</p>
                        </div>
                    ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-3 flex-1">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <Search className="w-8 h-8" />
                            </div>
                            <p>{t('reports.noRecords')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="p-5">{t('reports.table.student')}</th>
                                            <th className="p-5 text-center">{t('reports.table.score')}</th>
                                            <th className="p-5">{t('reports.table.equipment')}</th>
                                            <th className="p-5">{t('reports.table.dates')}</th>
                                            <th className="p-5">{t('reports.table.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* 👇 MAP OVER paginatedData HERE */}
                                        {paginatedData.map((item) => (
                                            <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-5">
                                                    <div className="font-medium text-[#0b1d3a]">{item.user?.username || "Unknown"}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{item.user?.email}</div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm border
                                                        ${(item.user?.responsibilityScore ?? 100) >= 80 ? "bg-green-100 text-green-700 border-green-200" :
                                                            (item.user?.responsibilityScore ?? 100) >= 50 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                                                "bg-red-100 text-red-700 border-red-200"
                                                        }`}>
                                                        {item.user?.responsibilityScore ?? 100}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-medium text-slate-900">{item.equipment?.name || "Deleted Item"}</div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {item.equipment?.serialNumber}
                                                        </span>
                                                        <span className="text-xs text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                                                            {item.equipment?.category || "General"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-sm text-slate-600">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-xs uppercase text-slate-400 font-semibold tracking-wide">{t('reports.table.borrowed')}</div>
                                                        <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-xs uppercase text-slate-400 font-semibold tracking-wide mt-1">{t('reports.table.due')}</div>
                                                        <div className={`${new Date() > new Date(item.expectedReturnTime) && item.status !== 'Returned' ? 'text-red-600 font-medium' : ''}`}>
                                                            {new Date(item.expectedReturnTime).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize border
                                                        ${item.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            item.status === 'Returned' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                item.status === 'Checked Out' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                    item.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                        'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 👇 NEW: PAGINATION CONTROLS */}
                            {totalPages > 1 && (
                                <div className="border-t border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between mt-auto">
                                    <p className="text-sm text-slate-600">
                                        Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-slate-900">{filteredData.length}</span> entries
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handlePrevPage} 
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center px-4 font-medium text-sm text-slate-700">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                        <button 
                                            onClick={handleNextPage} 
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ITStaffLayout>
    );
}