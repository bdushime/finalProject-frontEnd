import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Calendar, AlertCircle, ArrowRight } from "lucide-react";
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
        <Card className="border border-slate-100/80 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.4)] bg-white/95 backdrop-blur-sm text-[#0b1d3a]">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-[#0b1d3a] tracking-tight">
                        My Borrowed Items
                    </CardTitle>
                    <Button
                        size="sm"
                        className="bg-[#0b69d4] hover:bg-[#0f7de5] text-white shadow-sm shadow-sky-200/40"
                        onClick={() => navigate('/student/borrowed-items')}
                    >
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {overdueItems.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-sky-50 text-[#0b1d3a] flex items-center gap-2 border border-sky-100">
                        <AlertCircle className="h-5 w-5 text-sky-600" />
                        <span className="font-semibold">You have {overdueItems.length} overdue item(s)</span>
                    </div>
                )}

                {activeItems.length === 0 ? (
                    <div className="text-center py-8">
                        <Server className="h-12 w-12 mx-auto mb-4 text-sky-600" />
                        <p className="text-slate-600 mb-3">No active borrows</p>
                        <Button
                            className="bg-[#0b69d4] hover:bg-[#0f7de5] text-white shadow-sm shadow-sky-200/40"
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
                                    className="p-4 rounded-xl bg-slate-50 hover:bg-sky-50 transition-all duration-300 shadow-[0_14px_30px_-20px_rgba(8,47,73,0.35)] hover:-translate-y-0.5"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-[#0b1d3a] mb-1">
                                                {item.equipmentName}
                                            </h4>
                                            <p className="text-sm text-slate-600">
                                                {item.category} • {item.location}
                                            </p>
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-sky-600" />
                                            <span>Due: {formatDate(item.dueDate)}</span>
                                        </div>
                                        {daysUntilDue !== null && (
                                            <div className={`flex items-center gap-2 ${isOverdue ? 'font-semibold text-rose-600' : ''}`}>
                                                {isOverdue ? (
                                                    <>
                                                        <AlertCircle className="h-4 w-4 text-rose-500" />
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


