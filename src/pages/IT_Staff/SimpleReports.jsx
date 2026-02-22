import { useEffect, useState } from "react";
import api from "@/utils/api";
import { Loader2, Download, Search, AlertCircle, FileBarChart } from "lucide-react";
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

    // Get current user for the report header "Prepared By"
    const currentUser = JSON.parse(localStorage.getItem('user')) || { username: 'IT Staff', role: 'Staff' };

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions/all-history');
                setTransactions(res.data);
                setFilteredData(res.data);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(t('reports.error'));
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // --- 2. FILTER LOGIC ---
    useEffect(() => {
        let result = transactions;

        if (search) {
            result = result.filter(t =>
                t.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
                t.equipment?.name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (categoryFilter !== "All") {
            result = result.filter(t => t.equipment?.category === categoryFilter);
        }

        setFilteredData(result);
    }, [search, categoryFilter, transactions]);

    // --- 3. HANDLE PDF EXPORT ---
    const handleExportPDF = () => {
        if (filteredData.length === 0) return alert(t('reports.messages.noData'));
        // Call our utility function
        generatePDF(filteredData, currentUser);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Overdue': return 'bg-red-50 text-red-700 border-red-100';
            case 'Returned': return 'bg-green-50 text-green-700 border-green-100';
            case 'Checked Out': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
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
                        subtitle={t('reports.subtitle', { count: filteredData.length })}
                        className="mb-0"
                    />

                    {/* BUTTON NOW USES PDF GENERATOR */}
                    <button
                        onClick={handleExportPDF}
                        className="bg-green-100 hover:bg-green-200 text-black border border-green-200 px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-sm transition-all"
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

                {/* Main Data Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-[#0b1d3a] gap-3">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <p className="font-medium animate-pulse">{t('reports.loading')}</p>
                        </div>
                    ) : error ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-red-500 gap-2">
                            <AlertCircle className="w-10 h-10" />
                            <p className="font-medium">{error}</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <Search className="w-8 h-8" />
                            </div>
                            <p>{t('reports.noRecords')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
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
                                    {filteredData.map((t) => (
                                        <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-5">
                                                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">{t.user?.username || t('common:unknownUser')}</span>
                                                <div className="text-xs text-slate-500 mt-0.5">{t.user?.email}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm border
                                                    ${(t.user?.responsibilityScore ?? 100) >= 80 ? "bg-green-100 text-green-700 border-green-200" :
                                                        (t.user?.responsibilityScore ?? 100) >= 50 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                                            "bg-red-100 text-red-700 border-red-200"
                                                    }`}>
                                                    {t.user?.responsibilityScore ?? 100}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-sm font-medium text-slate-900">{t.equipment?.name || t('equipment.dialog.deletedItem', 'Deleted Item')}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {t.equipment?.serialNumber}
                                                    </span>
                                                    <span className="text-xs text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                                                        {t.equipment?.category || "General"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-sm text-slate-600">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs uppercase text-slate-400 font-semibold tracking-wide">{t('reports.table.borrowed')}</div>
                                                    <div>{new Date(t.createdAt).toLocaleDateString()}</div>
                                                    <div className="text-xs uppercase text-slate-400 font-semibold tracking-wide mt-1">{t('reports.table.due')}</div>
                                                    <div className={`${new Date() > new Date(t.expectedReturnTime) && t.status !== 'Returned' ? 'text-red-600 font-medium' : ''}`}>
                                                        {new Date(t.expectedReturnTime).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm ${getStatusColor(t.status)}`}>
                                                    {t(`equipment.status.${t.status.toLowerCase()}`, t.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ITStaffLayout>
    );
}