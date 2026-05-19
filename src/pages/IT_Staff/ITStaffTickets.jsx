import { useState, useEffect } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { PageContainer, PageHeader } from "@/components/common/Page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Ticket as TicketIcon, CheckCircle, Filter } from "lucide-react";
import api from "@/utils/api";
import Loader from "@/components/common/Loader";
import { toast } from "sonner";
import PaginationControls from '@/components/common/PaginationControls';
import { usePagination } from '@/hooks/usePagination';

const STATUS_FILTERS = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'RESOLVED', label: 'Resolved' },
];
const PRIORITY_FILTERS = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
];

const normalizePriority = (priority) => {
    const p = (priority || 'LOW').toUpperCase();
    if (p === 'MEDIUM') return 'MEDIUM';
    if (p === 'HIGH') return 'HIGH';
    return 'LOW';
};

const displayTicketId = (tkt) => {
    if (tkt.ticketId) return tkt.ticketId;
    if (tkt._id) return `TKT-${String(tkt._id).slice(-8).toUpperCase()}`;
    return '—';
};

export default function ITStaffTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterPriority, setFilterPriority] = useState("ALL");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/tickets');
            setTickets(res.data || []);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
            toast.error("Failed to load tickets. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(tkt => {
        const currentStatus = (tkt.status || "open").toUpperCase();

        if (currentStatus === 'RESOLVED' && tkt.updatedAt) {
            const updatedTime = new Date(tkt.updatedAt).getTime();
            if (Date.now() - updatedTime > 24 * 60 * 60 * 1000) {
                return false;
            }
        }

        const matchesSearch =
            displayTicketId(tkt).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tkt.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (tkt.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        let matchesStatus = false;
        if (filterStatus === "ALL") {
            matchesStatus = currentStatus !== "RESOLVED";
        } else {
            matchesStatus = currentStatus === filterStatus;
        }

        const ticketPriority = normalizePriority(tkt.priority);
        const matchesPriority =
            filterPriority === "ALL" || ticketPriority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const openCount = tickets.filter(t => (t.status || 'open').toLowerCase() !== 'resolved').length;
    const resolvedCount = tickets.filter(t => (t.status || '').toLowerCase() === 'resolved').length;

    const [currentPageState, setCurrentPageState] = useState(1);

    const {
        paginatedItems: currentTickets,
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        totalItems
    } = usePagination(filteredTickets, currentPageState, 10);

    const handleResolve = async (ticketId) => {
        try {
            await api.put(`/tickets/${ticketId}/resolve`);
            toast.success("Ticket marked as resolved!");
            fetchTickets();
        } catch (error) {
            console.error("Error resolving ticket:", error);
            toast.error("Failed to resolve ticket.");
        }
    };

    const formatPriority = (priority) => {
        const p = normalizePriority(priority);
        return p.charAt(0) + p.slice(1).toLowerCase();
    };

    const formatStatus = (status) => {
        const s = (status || 'open').toLowerCase();
        return s === 'resolved' ? 'Resolved' : 'Open';
    };

    const resetFiltersPage = () => setCurrentPageState(1);

    return (
        <ITStaffLayout>
            <PageContainer>
                <PageHeader
                    title="Student Help Desk"
                    subtitle="Manage and respond to student support tickets and inquiries."
                    showBack={false}
                />

                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Showing</p>
                        <p className="text-2xl font-bold text-[#0b1d3a] mt-1">{filteredTickets.length}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Open tickets</p>
                        <p className="text-2xl font-bold text-[#0b1d3a] mt-1">{openCount}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resolved</p>
                        <p className="text-2xl font-bold text-[#0b1d3a] mt-1">{resolvedCount}</p>
                    </div>
                </div>

                {/* Filters — separate from table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Search & filters</p>
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Ticket ID, subject, or email..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    resetFiltersPage();
                                }}
                                className="pl-10 border-slate-200 rounded-lg bg-white text-slate-900 h-10"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                                <select
                                    value={filterPriority}
                                    onChange={(e) => {
                                        setFilterPriority(e.target.value);
                                        resetFiltersPage();
                                    }}
                                    className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-[140px]"
                                    aria-label="Filter by priority"
                                >
                                    {PRIORITY_FILTERS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    resetFiltersPage();
                                }}
                                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 min-w-[140px]"
                                aria-label="Filter by status"
                            >
                                {STATUS_FILTERS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                        <h2 className="text-sm font-semibold text-slate-800">Tickets</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Student support requests</p>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
                                    <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600">Ticket ID</TableHead>
                                    <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600">Date</TableHead>
                                    <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600">Student</TableHead>
                                    <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600 min-w-[200px]">Subject & message</TableHead>
                                    <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600">Priority</TableHead>
                                    <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600">Status</TableHead>
                                    <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                                                <Loader variant="inline" />
                                                <span className="text-sm font-medium">Loading tickets...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentTickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center text-slate-500">
                                            <TicketIcon className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                                            <p className="font-medium text-slate-700">No tickets found</p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {searchQuery || filterPriority !== 'ALL' || filterStatus !== 'ALL'
                                                    ? "Try adjusting your filters or search."
                                                    : "There are no support tickets to display."}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentTickets.map((tkt) => (
                                        <TableRow
                                            key={tkt._id || tkt.ticketId}
                                            className="border-b border-slate-100 hover:bg-slate-50/80"
                                        >
                                            <TableCell className="px-4 py-3.5 align-middle">
                                                <span className="font-mono text-xs font-semibold text-slate-800">
                                                    {displayTicketId(tkt)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 align-middle text-sm text-slate-600 whitespace-nowrap">
                                                {tkt.date || (tkt.createdAt ? new Date(tkt.createdAt).toLocaleDateString() : '—')}
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 align-middle">
                                                <p className="text-sm font-medium text-slate-800">{tkt.user?.username || "Guest"}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{tkt.email}</p>
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 align-middle max-w-sm">
                                                <p className="text-sm font-medium text-slate-800 line-clamp-1">{tkt.subject}</p>
                                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5" title={tkt.message}>{tkt.message}</p>
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 align-middle text-sm text-slate-700">
                                                {formatPriority(tkt.priority)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 align-middle text-sm text-slate-700">
                                                {formatStatus(tkt.status)}
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 align-middle text-right">
                                                {(tkt.status || '').toLowerCase() !== 'resolved' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleResolve(tkt._id)}
                                                        className="h-8 px-3 text-xs font-medium border-slate-300 text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                        Resolve
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="p-4 border-t border-slate-200">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPageState}
                                startIndex={startIndex}
                                endIndex={endIndex}
                                totalItems={totalItems}
                            />
                        </div>
                    )}
                </div>
            </PageContainer>
        </ITStaffLayout>
    );
}
