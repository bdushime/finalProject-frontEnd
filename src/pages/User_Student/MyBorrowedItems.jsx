import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
        <MainLayout>
            <PageContainer>
                <BackButton to="/student/dashboard" />
                <PageHeader
                    title="My Borrowed Items"
                    subtitle="View and manage your borrowed equipment"
                />

                <Card className="mb-6 border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.25)] bg-white/95 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by equipment name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[200px] rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0b69d4]/30 focus:border-[#0b69d4] text-[#0b1d3a]">
                                    <SelectValue placeholder="Filter by status" />
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
                    </CardContent>
                </Card>

                {filteredItems.length === 0 ? (
                    <Card className="border border-slate-200 rounded-2xl bg-white/95">
                        <CardContent className="py-12 text-center">
                            <div className="p-4 rounded-full bg-sky-50 w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-sky-100">
                                <Package className="h-10 w-10 text-sky-700" />
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">
                                No items found
                            </h3>
                            <p className="text-black mb-4">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filter'
                                    : 'You haven\'t borrowed any equipment yet'}
                            </p>
                            {!searchQuery && statusFilter === 'all' && (
                                <Button onClick={() => navigate('/student/equipment')}>
                                    Browse Equipment
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_18px_38px_-22px_rgba(8,47,73,0.35)] mb-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl font-bold text-[#0b1d3a]">Active Checkouts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activeItems.length === 0 && (
                                    <p className="text-sm text-slate-600">No active checkouts.</p>
                                )}
                                {activeItems.map((item) => {
                                    const countdown = getCountdown(item.dueDate);
                                    const overdue = countdown?.overdue;
                                    return (
                                        <div key={item.id} className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-sky-200 hover:bg-sky-50 transition">
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm text-slate-600">{item.category} • ID: {item.equipmentId}</p>
                                                <h3 className="text-lg font-semibold text-[#0b1d3a]">{item.equipmentName}</h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                        {item.status === 'active' ? 'On Time' : 'Overdue'}
                                                    </Badge>
                                                    <span className="text-xs text-slate-600">Condition: {item.condition || 'Good'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-center">
                                                <div>
                                                    <p className="text-xs text-slate-500">HOURS</p>
                                                    <p className="text-lg font-semibold text-[#0b1d3a]">{countdown ? countdown.hours.toString().padStart(2, '0') : '--'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">MIN</p>
                                                    <p className="text-lg font-semibold text-[#0b1d3a]">{countdown ? countdown.mins.toString().padStart(2, '0') : '--'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full lg:w-auto">
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                                    onClick={() => handleExtend(item)}
                                                >
                                                    Extend
                                                </Button>
                                                <Button
                                                    className="rounded-xl bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-semibold shadow-sm shadow-sky-200/60"
                                                    onClick={() => handleReturn(item)}
                                                >
                                                    Return Now
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_18px_38px_-22px_rgba(8,47,73,0.35)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl font-bold text-[#0b1d3a]">Checkout History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-[#0b1d3a]">Equipment</TableHead>
                                                <TableHead className="text-[#0b1d3a]">Checkout Date</TableHead>
                                                <TableHead className="text-[#0b1d3a]">Return Date</TableHead>
                                                <TableHead className="text-[#0b1d3a]">Status</TableHead>
                                                <TableHead className="text-[#0b1d3a]">Score Impact</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {historyItems.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-slate-600 py-6">
                                                        No history items.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {historyItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="text-[#0b1d3a] font-semibold">{item.equipmentName}</TableCell>
                                                    <TableCell className="text-slate-700">{formatDate(item.borrowedDate)}</TableCell>
                                                    <TableCell className="text-slate-700">{item.returnDate ? formatDate(item.returnDate) : "—"}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={item.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        {(() => {
                                                            const score = scoreImpact(item.status);
                                                            return (
                                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${score.badge}`}>
                                                                    {score.value > 0 ? `+${score.value}` : score.value}
                                                                </span>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

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
            </PageContainer>
        </MainLayout>
    );
}
