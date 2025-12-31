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
            <div className="min-h-screen bg-white p-6 lg:p-8 font-sans text-slate-600">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <BackButton to="/student/dashboard" className="mb-4" />
                            <h1 className="text-3xl font-bold text-[#0b1d3a] tracking-tight">Available Equipment</h1>
                            <p className="text-slate-500 mt-1">Browse and request IT equipment for your class</p>
                        </div>

                        {/* Filters */}
                        <div className="w-full md:w-auto">
                            <Select value={availability} onValueChange={setAvailability}>
                                <SelectTrigger className="w-full md:w-[220px] h-11 rounded-2xl bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-[#126dd5]/20 text-[#0b1d3a] font-medium">
                                    <SelectValue placeholder="Availability" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="all">All Items</SelectItem>
                                    <SelectItem value="available">Available Now</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="checked-out">Checked Out</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEquipment.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#126dd5]/30 hover:shadow-md transition-all duration-300"
                            >
                                {/* Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#126dd5] transition-colors">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${item.status === "available"
                                        ? "bg-[#126dd5]/5 text-[#126dd5] border-[#126dd5]/10"
                                        : item.status === "reserved"
                                            ? "bg-amber-50 text-amber-600 border-amber-100"
                                            : "bg-rose-50 text-rose-600 border-rose-100"
                                        }`}>
                                        {item.status === "available" ? "Available" : item.status === "reserved" ? "Reserved" : "Checked Out"}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-base font-bold text-[#0b1d3a] leading-tight mb-1">{item.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{item.category || "Equip ID: " + item.id}</p>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-50 pt-3 mt-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                        {item.location}
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            variant={item.status === "available" ? "default" : "outline"}
                                            className={`w-full h-9 rounded-lg text-xs font-semibold shadow-none transition-all ${item.status === "available"
                                                ? "bg-[#0b1d3a] hover:bg-[#2c3e50] text-white"
                                                : "bg-slate-50 text-slate-400 border-slate-200"
                                                }`}
                                            onClick={() => item.status === "available" && window.location.assign(`/student/borrow-request?equipmentId=${item.id}`)}
                                            disabled={item.status !== "available"}
                                        >
                                            {item.status === "available" ? "Request Item" : "Unavailable"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredEquipment.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Package className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#0b1d3a]">No equipment found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

