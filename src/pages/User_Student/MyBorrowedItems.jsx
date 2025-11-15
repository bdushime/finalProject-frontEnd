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
                <PageHeader
                    title="My Borrowed Items"
                    subtitle="View and manage your borrowed equipment"
                />

                <Card className="mb-6 border-gray-300">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by equipment name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[200px]">
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
                    <Card className="border-gray-300">
                        <CardContent className="py-12 text-center">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No items found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
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
                                <Card key={item.id} className="border-gray-300">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CategoryBadge category={item.category} />
                                                            <StatusBadge status={item.status} />
                                                        </div>
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                            {item.equipmentName}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Request ID: {item.requestId} • Equipment ID: {item.equipmentId}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <div className="text-xs text-gray-500">Borrowed Date</div>
                                                            <div className="font-medium">
                                                                {item.borrowedDate ? formatDate(item.borrowedDate) : 'Not yet borrowed'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <div className="text-xs text-gray-500">Due Date</div>
                                                            <div className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                                                                {item.dueDate ? formatDate(item.dueDate) : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Package className="h-5 w-5 text-gray-400" />
                                                        <div>
                                                            <div className="text-xs text-gray-500">Location</div>
                                                            <div className="font-medium">{item.location}</div>
                                                        </div>
                                                    </div>
                                                    {item.approvedBy && (
                                                        <div className="flex items-center gap-3">
                                                            <CheckCircle className="h-5 w-5 text-gray-400" />
                                                            <div>
                                                                <div className="text-xs text-gray-500">Approved By</div>
                                                                <div className="font-medium">{item.approvedBy}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {isOverdue && (
                                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                                                        <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                                                            <AlertCircle className="h-5 w-5" />
                                                            <span className="font-semibold">
                                                                Overdue by {Math.abs(daysUntilDue)} day(s). Please return immediately.
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 3 && !isOverdue && (
                                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                                                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
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
                                                        className="w-full bg-[#343264] hover:bg-[#2a2752] text-white"
                                                        onClick={() => handleReturn(item)}
                                                    >
                                                        Return Item
                                                    </Button>
                                                )}
                                                {item.status === 'pending' && (
                                                    <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-2">
                                                        Awaiting approval
                                                    </div>
                                                )}
                                                {item.status === 'returned' && (
                                                    <div className="text-center text-sm text-green-600 dark:text-green-400 py-2">
                                                        ✓ Returned
                                                    </div>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
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

