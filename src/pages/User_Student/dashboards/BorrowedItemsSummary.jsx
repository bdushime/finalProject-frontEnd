import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function BorrowedItemsSummary({ items = [] }) {
    const navigate = useNavigate();
    const activeItems = items.filter(item => item.status === 'active' || item.status === 'overdue');
    const overdueItems = items.filter(item => item.status === 'overdue');

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

    return (
        <Card className="border-gray-300">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">My Borrowed Items</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/student/borrowed-items')}
                    >
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {overdueItems.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-semibold">You have {overdueItems.length} overdue item(s)</span>
                        </div>
                    </div>
                )}

                {activeItems.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-2">No active borrows</p>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/student/browse')}
                        >
                            Browse Equipment
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeItems.slice(0, 3).map((item) => {
                            const daysUntilDue = getDaysUntilDue(item.dueDate);
                            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

                            return (
                                <div
                                    key={item.id}
                                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                {item.equipmentName}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.category} • {item.location}
                                            </p>
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Calendar className="h-4 w-4" />
                                            <span>Due: {formatDate(item.dueDate)}</span>
                                        </div>
                                        {daysUntilDue !== null && (
                                            <div className={`flex items-center gap-2 ${isOverdue
                                                    ? 'text-red-600 dark:text-red-400 font-semibold'
                                                    : daysUntilDue <= 3
                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {isOverdue ? (
                                                    <>
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>Overdue by {Math.abs(daysUntilDue)} day(s)</span>
                                                    </>
                                                ) : (
                                                    <span>{daysUntilDue} day(s) remaining</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

BorrowedItemsSummary.propTypes = {
    items: PropTypes.array,
};

