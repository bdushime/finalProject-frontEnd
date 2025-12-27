import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { borrowedItems } from "./data/mockData";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle, Clock, QrCode, Package } from "lucide-react";

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ReturnEquipment() {
    const query = useQuery();
    const navigate = useNavigate();
    const initialId = query.get("itemId");

    const activeItems = borrowedItems.filter((item) => item.status === "active" || item.status === "overdue");
    const [selectedId, setSelectedId] = useState(initialId || (activeItems[0]?.id ?? ""));

    const selectedItem = activeItems.find((item) => item.id === selectedId);

    const stepItems = [
        { label: "Select Item" },
        { label: "Scan QR" },
        { label: "Condition Photos" },
        { label: "Confirm" },
    ];

    const countdown = (() => {
        if (!selectedItem?.dueDate) return null;
        const now = new Date();
        const due = new Date(selectedItem.dueDate);
        const diffMs = due - now;
        const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
        return { days, hours };
    })();

    return (
        <MainLayout>
            <PageContainer>
                <BackButton to="/student/borrowed-items" />
                <PageHeader
                    title="Return Equipment"
                    subtitle="Start the equipment return process."
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2 border border-slate-200 rounded-2xl bg-white/95 shadow-[0_16px_38px_-22px_rgba(8,47,73,0.35)]">
                        <CardHeader>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {stepItems.map((step, idx) => (
                                    <div
                                        key={step.label}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[#0b1d3a]"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-[#0b69d4] text-white flex items-center justify-center font-semibold">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-semibold">{step.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm">
                                <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-[#0b1d3a] font-semibold">
                                    <Package className="h-4 w-4 text-slate-600" />
                                    Select Equipment to Return
                                </div>
                                <div className="space-y-3 p-4">
                                    {activeItems.map((item) => (
                                        <label
                                            key={item.id}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border cursor-pointer transition ${selectedId === item.id
                                                    ? "border-[#0b69d4] bg-sky-50 shadow-[0_12px_28px_-22px_rgba(8,47,73,0.3)]"
                                                    : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <input
                                                    type="radio"
                                                    name="return-item"
                                                    checked={selectedId === item.id}
                                                    onChange={() => setSelectedId(item.id)}
                                                    className="h-4 w-4 accent-[#0b69d4]"
                                                />
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-[#0b1d3a]">{item.equipmentName}</p>
                                                    <p className="text-xs text-slate-600">
                                                        Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "TBD"}
                                                    </p>
                                                    <p className="text-xs text-slate-600">{item.equipmentId}</p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "overdue"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                        : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    }`}
                                                variant="outline"
                                            >
                                                {item.status === "overdue" ? "Due Soon" : "On Time"}
                                            </Badge>
                                        </label>
                                    ))}
                                    {activeItems.length === 0 && (
                                        <p className="text-sm text-slate-600">No active items to return.</p>
                                    )}
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-2xl bg-white/95 shadow-sm p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <QrCode className="h-5 w-5 text-slate-600" />
                                    <p className="font-semibold text-[#0b1d3a]">Scan QR Code</p>
                                </div>
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-[#0b1d3a] space-y-2">
                                    <p className="font-semibold">Scan Equipment QR Code</p>
                                    <p className="text-sm text-slate-600">Point your camera at the QR code on the equipment</p>
                                    <Button className="bg-[#0b69d4] hover:bg-[#0f7de5] text-white rounded-xl shadow-sm shadow-sky-200/60">
                                        Open Camera
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 rounded-2xl bg-white/95 shadow-[0_16px_38px_-22px_rgba(8,47,73,0.35)]">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#0b1d3a]">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedItem ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-slate-600" />
                                        <div>
                                            <p className="font-semibold text-[#0b1d3a]">{selectedItem.equipmentName}</p>
                                            <p className="text-xs text-slate-600">ID: {selectedItem.equipmentId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-slate-600" />
                                        <div>
                                            <p className="text-xs text-slate-600">Due date</p>
                                            <p className="font-semibold text-[#0b1d3a]">
                                                {selectedItem.dueDate ? new Date(selectedItem.dueDate).toLocaleString() : "TBD"}
                                            </p>
                                        </div>
                                    </div>
                                    {countdown && (
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">DAYS</p>
                                                <p className="text-lg font-semibold text-[#0b1d3a]">{String(countdown.days).padStart(2, "0")}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-slate-500">HOURS</p>
                                                <p className="text-lg font-semibold text-[#0b1d3a]">{String(countdown.hours).padStart(2, "0")}</p>
                                            </div>
                                        </div>
                                    )}
                                    <Button
                                        className="w-full bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-semibold rounded-xl shadow-sm shadow-sky-200/60"
                                        onClick={() => navigate(`/student/borrowed-items`)}
                                    >
                                        Confirm Return
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-slate-600">Select an item to see summary.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6 border border-slate-200 rounded-2xl bg-white/95 shadow-[0_18px_38px_-22px_rgba(8,47,73,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-[#0b1d3a]">Condition Photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 mb-4">
                            Please take photos of the equipment from multiple angles to document its current condition.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {["Front View", "Back View", "Any Damage (Optional)"].map((label) => (
                                <div
                                    key={label}
                                    className="h-40 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-[#0b1d3a] hover:border-sky-200 hover:bg-sky-50 transition"
                                >
                                    <Camera className="h-8 w-8 text-slate-500" />
                                    <p className="font-semibold text-sm">{label}</p>
                                    <p className="text-xs text-slate-500">Click to upload</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3 justify-end">
                            <Button
                                variant="outline"
                                className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                onClick={() => navigate("/student/borrowed-items")}
                            >
                                Cancel
                            </Button>
                            <Button className="rounded-xl bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-semibold shadow-sm shadow-sky-200/60">
                                Submit Return
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </PageContainer>
        </MainLayout>
    );
}

