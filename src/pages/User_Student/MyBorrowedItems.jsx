import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar, Package, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import { StatusBadge } from "./components/StatusBadge";
import { CategoryBadge } from "./components/CategoryBadge";
import BackButton from "./components/BackButton";
import { borrowedItems } from "./data/mockData";
import { useNavigate } from "react-router-dom";

export default function MyBorrowedItems() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysUntilDue = (dueDate) => {
        if (!dueDate) return null;
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredItems = borrowedItems.filter(item => {
        const matchesSearch =
            item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleReturn = (item) => {
        if (item.status === 'active' || item.status === 'overdue') {
            navigate(`/student/return?itemId=${item.id}`);
        }
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
                                <SelectTrigger className="w-full md:w-[200px] rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-200 text-[#0b1d3a]">
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
                                <Button onClick={() => navigate('/student/browse')}>
                                    Browse Equipment
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredItems.map((item) => {
                            const daysUntilDue = getDaysUntilDue(item.dueDate);
                            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

                            return (
                                <Card key={item.id} className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_16px_38px_-22px_rgba(8,47,73,0.3)] hover:border-sky-200 hover:shadow-[0_22px_40px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CategoryBadge category={item.category} />
                                                            <StatusBadge status={item.status} />
                                                        </div>
                                                        <h3 className="text-xl font-semibold text-black mb-1">
                                                            {item.equipmentName}
                                                        </h3>
                                                        <p className="text-sm text-black">
                                                            Request ID: {item.requestId} • Equipment ID: {item.equipmentId}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-5 w-5 text-slate-600" />
                                                        <div>
                                                            <div className="text-xs text-black">Borrowed Date</div>
                                                            <div className="font-medium text-black">
                                                                {item.borrowedDate ? formatDate(item.borrowedDate) : 'Not yet borrowed'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-5 w-5 text-slate-600" />
                                                        <div>
                                                            <div className="text-xs text-black">Due Date</div>
                                                            <div className={`font-medium ${isOverdue ? 'text-black' : 'text-black'}`}>
                                                                {item.dueDate ? formatDate(item.dueDate) : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Package className="h-5 w-5 text-slate-600" />
                                                        <div>
                                                            <div className="text-xs text-black">Location</div>
                                                            <div className="font-medium text-black">{item.location}</div>
                                                        </div>
                                                    </div>
                                                    {item.approvedBy && (
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle className="h-5 w-5 text-slate-600" />
                                                            <div>
                                                                <div className="text-xs text-black">Approved By</div>
                                                                <div className="font-medium text-black">{item.approvedBy}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {isOverdue && (
                                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg mb-4">
                                                        <div className="flex items-center gap-2 text-rose-700">
                                                            <AlertCircle className="h-5 w-5" />
                                                            <span className="font-semibold">
                                                                Overdue by {Math.abs(daysUntilDue)} day(s). Please return immediately.
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 3 && !isOverdue && (
                                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4">
                                                        <div className="flex items-center gap-2 text-amber-700">
                                                            <Clock className="h-5 w-5" />
                                                            <span className="font-semibold">
                                                                Due in {daysUntilDue} day(s). Please prepare for return.
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="lg:w-48 flex flex-col gap-2">
                                                {(item.status === 'active' || item.status === 'overdue') && (
                                                    <Button
                                                        className="w-full bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-bold rounded-xl shadow-sm shadow-sky-200/60 transition-all duration-300"
                                                        onClick={() => handleReturn(item)}
                                                    >
                                                        Return Item
                                                    </Button>
                                                )}
                                                {item.status === 'pending' && (
                                                    <div className="text-center text-sm text-black py-2">
                                                        Awaiting approval
                                                    </div>
                                                )}
                                                {item.status === 'returned' && (
                                                    <div className="text-center text-sm text-black font-bold py-2">
                                                        ✓ Returned
                                                    </div>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a] transition-all duration-300"
                                                    onClick={() => navigate(`/student/equipment/${item.equipmentId}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </PageContainer>
        </MainLayout>
    );
}

