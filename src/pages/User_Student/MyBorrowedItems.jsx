import { useMemo, useState } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import { StatusBadge } from "./components/StatusBadge";
import BackButton from "./components/BackButton";
import ExtendModal from "@/components/ui/ExtendModal";
import { borrowedItems } from "./data/mockData";
import { useNavigate } from "react-router-dom";

export default function MyBorrowedItems() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Extend modal state
    const [extendModalOpen, setExtendModalOpen] = useState(false);
    const [selectedItemForExtend, setSelectedItemForExtend] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredItems = borrowedItems.filter(item => {
        const matchesSearch =
            item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeItems = useMemo(
        () => filteredItems.filter((item) => item.status === 'active' || item.status === 'overdue'),
        [filteredItems]
    );
    const historyItems = useMemo(
        () => filteredItems.filter((item) => item.status !== 'active' && item.status !== 'overdue'),
        [filteredItems]
    );

    const scoreImpact = (status) => {
        switch (status) {
            case 'returned':
            case 'returned-early':
                return { value: +2, tone: 'text-emerald-700', badge: 'bg-emerald-50 border border-emerald-100 text-emerald-700' };
            case 'on-time':
                return { value: +1, tone: 'text-emerald-700', badge: 'bg-emerald-50 border border-emerald-100 text-emerald-700' };
            case 'pending':
                return { value: 0, tone: 'text-slate-600', badge: 'bg-slate-100 border border-slate-200 text-slate-600' };
            case 'overdue':
            case 'late':
                return { value: -3, tone: 'text-rose-700', badge: 'bg-rose-50 border border-rose-100 text-rose-700' };
            default:
                return { value: 0, tone: 'text-slate-600', badge: 'bg-slate-100 border border-slate-200 text-slate-600' };
        }
    };

    const getCountdown = (dueDate) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due - now;
        if (diffMs <= 0) return { hours: 0, mins: 0, overdue: true };
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return { hours, mins, overdue: false };
    };

    const handleReturn = (item) => {
        if (item.status === 'active' || item.status === 'overdue') {
            navigate(`/student/return?itemId=${item.id}`);
        }
    };

    const handleExtend = (item) => {
        setSelectedItemForExtend(item);
        setExtendModalOpen(true);
    };

    const handleExtendConfirm = (extensionData) => {
        console.log('Extension confirmed:', extensionData);
        // Here you would call your API to extend the borrowing time
        // After success, you might want to refresh the items list
        alert(`Successfully extended ${selectedItemForExtend?.equipmentName} until ${new Date(extensionData.newEndTime).toLocaleTimeString()}`);
    };

    return (
        <StudentLayout>
            <div className="min-h-screen bg-white p-6 lg:p-8 font-sans text-slate-600">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <BackButton to="/student/dashboard" className="mb-4" />
                        <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">My Borrowed Items</h1>
                        <p className="text-slate-500 mt-1">View and manage your borrowed equipment</p>
                    </div>

                    {/* Filters & Search - White/Clean */}
                    <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex flex-col md:flex-row gap-2 max-w-2xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search equipment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 bg-transparent border-none focus-visible:ring-0 text-[#0b1d3a] placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <div className="w-px bg-slate-200 my-2 hidden md:block"></div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl border-none shadow-none focus:ring-0 text-[#0b1d3a] font-medium bg-transparent">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="returned">Returned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Loans Section - Compact Cards Grid */}
                    {activeItems.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-[#0b1d3a]">Active Loans</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeItems.map((item) => {
                                    const countdown = getCountdown(item.dueDate);
                                    return (
                                        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#126dd5]/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-[#0b1d3a] text-base">{item.equipmentName}</h3>
                                                        <p className="text-xs text-slate-500 uppercase tracking-wide">{item.id}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {item.status === 'active' ? 'Active' : 'Overdue'}
                                                </Badge>
                                            </div>

                                            {/* Timer/Due Info */}
                                            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                                <div className="text-xs text-slate-500">
                                                    Due: <span className="font-semibold text-slate-700">{new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                {countdown && (
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-mono font-bold text-[#0b1d3a] text-lg">
                                                            {countdown.hours.toString().padStart(2, '0')}:{countdown.mins.toString().padStart(2, '0')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">left</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions - Subtle */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleExtend(item)}
                                                    className="h-9 rounded-lg text-slate-600 hover:text-[#0b1d3a] hover:bg-slate-50 text-xs font-semibold"
                                                >
                                                    Extend Time
                                                </Button>
                                                <Button
                                                    onClick={() => handleReturn(item)}
                                                    className="h-9 rounded-lg bg-[#0b1d3a] hover:bg-[#2c3e50] text-white text-xs font-semibold shadow-sm"
                                                >
                                                    Return Item
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* History Section - Clean Table */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#0b1d3a]">History</h2>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="border-b border-slate-200">
                                        <TableHead className="py-3 pl-6 font-semibold text-[#0b1d3a] text-xs uppercase tracking-wider">Equipment</TableHead>
                                        <TableHead className="py-3 font-semibold text-[#0b1d3a] text-xs uppercase tracking-wider">Checkout</TableHead>
                                        <TableHead className="py-3 font-semibold text-[#0b1d3a] text-xs uppercase tracking-wider">Return</TableHead>
                                        <TableHead className="py-3 font-semibold text-[#0b1d3a] text-xs uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="py-3 pr-6 font-semibold text-[#0b1d3a] text-xs uppercase tracking-wider text-right">Points</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                                                No history items found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        historyItems.map((item) => (
                                            <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="py-3 pl-6 font-medium text-[#0b1d3a] text-sm">{item.equipmentName}</TableCell>
                                                <TableCell className="py-3 text-slate-500 text-sm">{formatDate(item.borrowedDate)}</TableCell>
                                                <TableCell className="py-3 text-slate-500 text-sm">{item.returnDate ? formatDate(item.returnDate) : "—"}</TableCell>
                                                <TableCell className="py-3">
                                                    <StatusBadge status={item.status} />
                                                </TableCell>
                                                <TableCell className="py-3 pr-6 text-right">
                                                    {(() => {
                                                        const score = scoreImpact(item.status);
                                                        return (
                                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${score.tone} bg-opacity-10`}>
                                                                {score.value > 0 ? `+${score.value}` : score.value}
                                                            </span>
                                                        );
                                                    })()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500 text-sm">No items found matching your filters.</p>
                        </div>
                    )}
                </div>

                {/* Extend Modal */}
                <ExtendModal
                    isOpen={extendModalOpen}
                    onClose={() => {
                        setExtendModalOpen(false);
                        setSelectedItemForExtend(null);
                    }}
                    item={selectedItemForExtend}
                    onConfirm={handleExtendConfirm}
                />
            </div>
        </StudentLayout>
    );
}

