import { useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { borrowedItems } from "./data/mockData";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function EquipmentCatalogue() {
    const [availability, setAvailability] = useState("all");

    const equipmentList = useMemo(() => ([
        { id: "P-001", name: "Projector 1", status: "available", location: "Room A - Library" },
        { id: "P-002", name: "Projector 2", status: "available", location: "Room B - Main Hall" },
        { id: "P-003", name: "Projector 3", status: "reserved", location: "Innovation Lab" },
        { id: "P-004", name: "Projector 4", status: "checked-out", location: "Electrical Lab" },
        { id: "P-005", name: "Projector 5", status: "available", location: "Auditorium" },
    ]), []);

    const filteredEquipment = equipmentList.filter((item) => {
        if (availability === "all") return true;
        if (availability === "available") return item.status === "available";
        if (availability === "available-now") return item.status === "available";
        if (availability === "reserved") return item.status === "reserved";
        if (availability === "checked-out") return item.status === "checked-out";
        return true;
    });

    return (
        <MainLayout>
            <PageContainer>
                <BackButton to="/student/dashboard" />
                <PageHeader
                    title="Available Equipment"
                    subtitle="Browse and request IT equipment for your class"
                />

                <Card className="mb-6 border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.25)] bg-white/95 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <Select value={availability} onValueChange={setAvailability}>
                                <SelectTrigger className="w-full md:w-[220px] rounded-xl border-slate-200 focus:ring-2 focus:ring-[#0b69d4]/30 focus:border-[#0b69d4] text-[#0b1d3a]">
                                    <SelectValue placeholder="Availability" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="available-now">Available Now</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="checked-out">Checked Out</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_18px_38px_-22px_rgba(8,47,73,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-[#0b1d3a]">Available Equipment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredEquipment.map((item) => (
                                <div
                                    key={item.id}
                                    className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_14px_32px_-22px_rgba(8,47,73,0.35)] hover:border-sky-200 hover:shadow-[0_18px_36px_-22px_rgba(8,47,73,0.4)] transition p-4"
                                >
                                    <div className="absolute top-3 right-3">
                                        <Badge
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "available"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                : item.status === "reserved"
                                                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                                }`}
                                            variant="outline"
                                        >
                                            {item.status === "available" ? "Available" : item.status === "reserved" ? "Reserved" : "Checked Out"}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-slate-600">{item.category || "Projector"}</div>
                                        <h3 className="text-lg font-semibold text-[#0b1d3a]">{item.name}</h3>
                                        <p className="text-sm text-slate-600">Location: {item.location}</p>
                                        <div className="flex items-center gap-1 text-amber-500 text-sm">
                                            {"★★★★★".slice(0, 4)}
                                            <span className="text-slate-500 text-xs">(4.0)</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                            onClick={() => window.location.assign(`/student/borrow-request?equipmentId=${item.id}`)}
                                            disabled={item.status !== "available"}
                                        >
                                            Request Borrow
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredEquipment.length === 0 && (
                            <p className="text-slate-600 text-sm text-center py-6">No equipment found for this availability.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_18px_38px_-22px_rgba(8,47,73,0.35)]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-[#0b1d3a]">My Checkouts</CardTitle>
                            <Button
                                variant="outline"
                                className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a] text-sm"
                                onClick={() => window.location.assign("/student/borrowed-items")}
                            >
                                View all
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {borrowedItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                                <div className="space-y-1">
                                    <p className="font-semibold text-[#0b1d3a]">{item.equipmentName}</p>
                                    <p className="text-xs text-slate-600">
                                        Due: {item.dueDate || "TBD"}
                                    </p>
                                </div>
                                <Badge
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "active"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : item.status === "overdue"
                                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                                            : "bg-slate-100 text-slate-600 border border-slate-200"
                                        }`}
                                    variant="outline"
                                >
                                    {item.status === "active" ? "Active" : item.status === "overdue" ? "Overdue" : "Pending"}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </PageContainer>
        </MainLayout>
    );
}

