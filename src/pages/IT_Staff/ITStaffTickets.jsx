import { useState, useEffect } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { PageContainer, PageHeader } from "@/components/common/Page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Ticket as TicketIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";
import api from "@/utils/api";
import Loader from "@/components/common/Loader";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PaginationControls from '@/components/common/PaginationControls';
import { usePagination } from '@/hooks/usePagination';

export default function ITStaffTickets() {
    const { t } = useTranslation("common");
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

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

    // Derived states
    const filteredTickets = tickets.filter(tkt => {
        const currentStatus = (tkt.status || "open").toUpperCase();

        // 1. Hide resolved tickets older than 24 hours
        if (currentStatus === 'RESOLVED' && tkt.updatedAt) {
            const updatedTime = new Date(tkt.updatedAt).getTime();
            if (Date.now() - updatedTime > 24 * 60 * 60 * 1000) {
                return false; // Skip this ticket
            }
        }

        const matchesSearch = 
            (tkt.ticketId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (tkt.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (tkt.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
            
        let matchesStatus = false;
        if (filterStatus === "ALL") {
            matchesStatus = currentStatus !== "RESOLVED"; // Hide resolved tickets from the ALL view
        } else {
            matchesStatus = currentStatus === filterStatus;
        }

        return matchesSearch && matchesStatus;
    });

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
            fetchTickets(); // Refresh list to get updated timestamp
        } catch (error) {
            console.error("Error resolving ticket:", error);
            toast.error("Failed to resolve ticket.");
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
                return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 font-bold border-0 animate-pulse">HIGH</Badge>;
            case 'MEDIUM':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-bold border-0">MEDIUM</Badge>;
            case 'LOW':
            default:
                return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-bold border-0">LOW</Badge>;
        }
    };

    const getStatusIcon = (status) => {
        if (status?.toLowerCase() === 'resolved') return <CheckCircle className="w-4 h-4 text-emerald-600" />;
        return <Clock className="w-4 h-4 text-amber-500" />;
    };

    return (
        <ITStaffLayout>
            <PageContainer>
                <PageHeader 
                    title="Student Help Desk" 
                    subtitle="Manage and respond to student support tickets and inquiries."
                    showBack={false}
                />

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 mb-6">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Ticket ID, Subject, or Email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-slate-200 rounded-full bg-slate-50 focus-visible:bg-white transition-colors"
                            />
                        </div>
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
                            {['ALL', 'OPEN', 'RESOLVED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setFilterStatus(status);
                                        setCurrentPageState(1); // Reset pagination on tab change
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                        filterStatus === status 
                                        ? 'bg-white text-[#0b1d3a] shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50 text-left border-none">
                                    <TableHead className="w-[120px] text-slate-500 font-bold bg-slate-50">Ticket ID</TableHead>
                                    <TableHead className="text-slate-500 font-bold bg-slate-50">Date</TableHead>
                                    <TableHead className="text-slate-500 font-bold bg-slate-50">Student Info</TableHead>
                                    <TableHead className="text-slate-500 font-bold bg-slate-50">Subject & Request</TableHead>
                                    <TableHead className="text-slate-500 font-bold bg-slate-50 text-center">Priority</TableHead>
                                    <TableHead className="text-slate-500 font-bold bg-slate-50 text-center">Status</TableHead>
                                    <TableHead className="text-slate-500 font-bold bg-slate-50 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center bg-white border-none">
                                            <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                                                <Loader variant="inline" />
                                                <span className="text-sm font-medium">Loading tickets...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentTickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center bg-white border-none">
                                            <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <TicketIcon className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-bold text-[#0b1d3a]">No tickets found</p>
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        {searchQuery ? "Try adjusting your search terms." : "There are currently no support tickets to display."}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentTickets.map((tkt) => (
                                        <TableRow key={tkt._id || tkt.ticketId} className="hover:bg-slate-50 bg-white transition-colors text-left border-b border-slate-100 last:border-0 group">
                                            <TableCell className="font-mono text-xs font-semibold text-slate-600">
                                                {tkt.ticketId}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                                                {tkt.date || new Date(tkt.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-[#0b1d3a]">{tkt.user?.username || "Guest User"}</span>
                                                    <span className="text-xs text-slate-500">{tkt.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="flex flex-col pr-4">
                                                    <span className="text-sm font-bold text-slate-800 line-clamp-1">{tkt.subject}</span>
                                                    <span className="text-xs text-slate-500 line-clamp-2 mt-0.5" title={tkt.message}>{tkt.message}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getPriorityBadge(tkt.priority)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {getStatusIcon(tkt.status || "open")}
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                                        {tkt.status || "open"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(tkt.status || '').toLowerCase() !== 'resolved' ? (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => handleResolve(tkt._id)}
                                                        className="text-xs h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                        Resolve
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">No action</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="mt-4">
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
