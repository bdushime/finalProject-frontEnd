import { useState, useEffect, useMemo, useRef } from "react";
import MainLayout from "./layout/MainLayout";
import AdminLayout from "@/pages/Sys_Admin/components/AdminLayout";
import { useAuth } from "@/pages/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Settings, Search, X, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import Loader from "@/components/common/Loader";
import api from "@/utils/api";
import {
    fetchPackages,
    fetchPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    addDevicesToPackage,
    removeDeviceFromPackage,
} from "@/services/packagesService";

// ── Searchable multi-select dropdown ─────────────────────────────────────────
function DeviceMultiSelect({ allDevices, selectedIds, onChange, placeholder = "Search devices..." }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const filtered = useMemo(() => {
        if (!query.trim()) return allDevices;
        const q = query.toLowerCase();
        return allDevices.filter(
            (d) =>
                d.name?.toLowerCase().includes(q) ||
                d.serialNumber?.toLowerCase().includes(q)
        );
    }, [allDevices, query]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const toggle = (id) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((x) => x !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const selectedDevices = allDevices.filter((d) => selectedIds.includes(d._id || d.id));

    return (
        <div ref={containerRef} className="relative">
            {/* Selected chips */}
            {selectedDevices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedDevices.map((d) => (
                        <span
                            key={d._id || d.id}
                            className="inline-flex items-center gap-1 bg-[#126dd5]/10 text-[#126dd5] text-xs font-semibold px-2.5 py-1 rounded-full"
                        >
                            {d.name}
                            <button
                                type="button"
                                onClick={() => toggle(d._id || d.id)}
                                className="hover:text-rose-600 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                    placeholder={placeholder}
                    className="pl-9 h-10 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7]"
                />
            </div>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute z-[200] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {filtered.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No devices found</p>
                    ) : (
                        filtered.map((d) => {
                            const id = d._id || d.id;
                            const checked = selectedIds.includes(id);
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => toggle(id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${checked ? "bg-[#126dd5]/5" : ""}`}
                                >
                                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? "bg-[#126dd5] border-[#126dd5]" : "border-gray-300"}`}>
                                        {checked && <span className="text-white text-[10px] font-bold">✓</span>}
                                    </span>
                                    <span className="font-medium text-[#0b1d3a]">{d.name}</span>
                                    {d.serialNumber && (
                                        <span className="text-slate-400 text-xs ml-auto">{d.serialNumber}</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

const emptyCreateForm = { name: "", description: "", deviceIds: [] };

// ── Main component ────────────────────────────────────────────────────────────
export default function PackageManagement() {
    const { user } = useAuth();
    const isAdmin = (user?.role || "").toString().toLowerCase() === "admin";
    const Layout = isAdmin ? AdminLayout : MainLayout;

    const [packages, setPackages] = useState([]);
    const [allDevices, setAllDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // ── Create modal ──────────────────────────────────────────────────────────
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", description: "", deviceIds: [] });

    // ── Edit modal ────────────────────────────────────────────────────────────
    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", description: "", isActive: true });

    // ── Manage Devices modal ──────────────────────────────────────────────────
    const [manageOpen, setManageOpen] = useState(false);
    const [manageTarget, setManageTarget] = useState(null);
    const [addDeviceIds, setAddDeviceIds] = useState([]);
    const [manageLoading, setManageLoading] = useState(false);

    // ── Deactivate confirm ────────────────────────────────────────────────────
    const [deactivateTarget, setDeactivateTarget] = useState(null);
    const [deactivateOpen, setDeactivateOpen] = useState(false);

    // ── Data loading ──────────────────────────────────────────────────────────
    const loadData = async () => {
        setLoading(true);
        try {
            const [pkgData, devRes] = await Promise.all([
                fetchPackages(),
                api.get('/equipment'),
            ]);
            const pkgList = Array.isArray(pkgData) ? pkgData : (pkgData?.data || pkgData?.packages || []);
            setPackages(pkgList);

            const devPayload = devRes?.data;
            const devList = Array.isArray(devPayload)
                ? devPayload
                : (devPayload?.items || devPayload?.equipment || devPayload?.data || []);
            setAllDevices(devList.map((d) => ({ ...d, id: d._id || d.id })));
        } catch (err) {
            console.error("Failed to load package data:", err);
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ── Create package ────────────────────────────────────────────────────────
    const handleCreate = async () => {
        if (!createForm.name.trim()) {
            toast.error("Package name is required.");
            return;
        }
        setActionLoading(true);
        try {
            await createPackage({
                name: createForm.name.trim(),
                description: createForm.description.trim(),
                deviceIds: createForm.deviceIds,
            });
            toast.success("Package created successfully.");
            setCreateOpen(false);
            setCreateForm(emptyCreateForm);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create package.");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Edit package ──────────────────────────────────────────────────────────
    const openEdit = (pkg) => {
        setEditTarget(pkg);
        setEditForm({ name: pkg.name, description: pkg.description || "", isActive: pkg.isActive !== false });
        setEditOpen(true);
    };

    const handleEdit = async () => {
        if (!editForm.name.trim()) {
            toast.error("Package name is required.");
            return;
        }
        setActionLoading(true);
        try {
            await updatePackage(editTarget._id, {
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                isActive: editForm.isActive,
            });
            toast.success("Package updated successfully.");
            setEditOpen(false);
            setEditTarget(null);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update package.");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Deactivate package ────────────────────────────────────────────────────
    const openDeactivate = (pkg) => {
        setDeactivateTarget(pkg);
        setDeactivateOpen(true);
    };

    const handleDeactivate = async () => {
        setActionLoading(true);
        try {
            await deletePackage(deactivateTarget._id);
            toast.success("Package deactivated.");
            setDeactivateOpen(false);
            setDeactivateTarget(null);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to deactivate package.");
        } finally {
            setActionLoading(false);
        }
    };

    // ── Manage devices ────────────────────────────────────────────────────────
    const openManage = (pkg) => {
        setManageTarget(pkg);
        setAddDeviceIds([]);
        setManageOpen(true);
    };

    const handleRemoveDevice = async (deviceId) => {
        setManageLoading(true);
        try {
            await removeDeviceFromPackage(manageTarget._id, deviceId);
            toast.success("Device removed from package.");
            // Optimistically update manageTarget devices
            setManageTarget((prev) => ({
                ...prev,
                devices: (prev.devices || []).filter((d) => (d._id || d.id) !== deviceId),
            }));
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove device.");
        } finally {
            setManageLoading(false);
        }
    };

    const handleAddDevices = async () => {
        if (addDeviceIds.length === 0) {
            toast.error("Select at least one device to add.");
            return;
        }
        setManageLoading(true);
        try {
            await addDevicesToPackage(manageTarget._id, addDeviceIds);
            toast.success("Devices added to package.");
            setAddDeviceIds([]);
            // Refresh manageTarget from server
            const updated = await fetchPackageById(manageTarget._id);
            const pkg = updated?.data || updated;
            setManageTarget(pkg);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add devices.");
        } finally {
            setManageLoading(false);
        }
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getStatusBadge = (isActive) =>
        isActive !== false ? (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200">
                Inactive
            </span>
        );

    // Devices already in the package (for the manage modal)
    const manageCurrentDevices = manageTarget?.devices || [];
    // Devices not yet in the package (for the add dropdown)
    const currentDeviceIds = manageCurrentDevices.map((d) => d._id || d.id);
    const availableToAdd = allDevices.filter((d) => !currentDeviceIds.includes(d._id || d.id));

    const HeroSection = (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 mt-2 relative z-10">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                        Package Management
                    </h1>
                    <p className="text-gray-400 flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]" />
                        {loading ? "Loading..." : `${packages.length} package${packages.length !== 1 ? "s" : ""} total`}
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold py-5 sm:py-6 px-5 sm:px-6 rounded-2xl shadow-lg shadow-[#8D8DC7]/20 transition-transform active:scale-95 border-none"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Package
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <Layout heroContent={HeroSection}>
            {/* ── Package table ─────────────────────────────────────────────── */}
            <div className="rounded-2xl shadow-sm bg-white overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader />
                    </div>
                ) : packages.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No packages yet. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="w-full text-sm">
                            <TableHeader className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-black">
                                    <th className="px-6 py-4 font-semibold text-left">Name</th>
                                    <th className="px-6 py-4 font-semibold text-left">Description</th>
                                    <th className="px-6 py-4 font-semibold text-center">Devices</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold text-left">Created</th>
                                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {packages.map((pkg) => (
                                    <TableRow key={pkg._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                                        <TableCell className="px-6 py-4 font-semibold text-[#0b1d3a] text-left">
                                            {pkg.name}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-slate-500 text-left max-w-xs">
                                            <span className="line-clamp-2">{pkg.description || "—"}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#126dd5]/10 text-[#126dd5] font-bold text-sm">
                                                {(pkg.devices || []).length}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            {getStatusBadge(pkg.isActive)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-slate-500 text-left text-xs">
                                            {pkg.createdAt ? format(new Date(pkg.createdAt), "MMM d, yyyy") : "—"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 text-slate-600 hover:bg-slate-100 rounded-lg"
                                                    onClick={() => openEdit(pkg)}
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 text-[#126dd5] hover:bg-blue-50 rounded-lg"
                                                    onClick={() => openManage(pkg)}
                                                    title="Manage Devices"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                                {pkg.isActive !== false && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-3 text-red-500 hover:bg-red-50 rounded-lg"
                                                        onClick={() => openDeactivate(pkg)}
                                                        title="Deactivate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* ── Create Package Modal ──────────────────────────────────────── */}
            <Dialog
                open={createOpen}
                onOpenChange={(open) => {
                    setCreateOpen(open);
                    if (!open) setCreateForm(emptyCreateForm);
                }}
            >
                <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden bg-white p-0 gap-0">
                    <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle className="text-2xl font-bold text-slate-900">Create Package</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Define a new equipment bundle that students can book.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4 px-6 overflow-y-auto flex-1 min-h-0">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                Package Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={createForm.name}
                                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="e.g., Classroom Presentation Kit"
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Description</Label>
                            <Textarea
                                value={createForm.description}
                                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                                placeholder="Describe what this package is for..."
                                rows={3}
                                className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2 overflow-visible relative z-10 pb-40">
                            <Label className="text-sm font-semibold text-slate-700">Add Devices</Label>
                            <DeviceMultiSelect
                                allDevices={allDevices}
                                selectedIds={createForm.deviceIds}
                                onChange={(ids) => setCreateForm((p) => ({ ...p, deviceIds: ids }))}
                                placeholder="Search and select devices..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="px-6 pb-6 pt-2 gap-3 flex-col sm:flex-row shrink-0 border-t border-slate-100 bg-white">
                        <Button
                            variant="outline"
                            onClick={() => { setCreateOpen(false); setCreateForm(emptyCreateForm); }}
                            disabled={actionLoading}
                            className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={actionLoading}
                            className="h-12 px-8 rounded-xl bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold shadow-md shadow-[#8D8DC7]/20"
                        >
                            {actionLoading ? <><Loader variant="inline" className="mr-2" /> Creating...</> : "Create Package"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Package Modal ────────────────────────────────────────── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Edit Package</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Update the details for <strong>{editTarget?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">
                                Package Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Description</Label>
                            <Textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                                rows={3}
                                className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Status</Label>
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setEditForm((p) => ({ ...p, isActive: !p.isActive }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isActive ? "bg-[#126dd5]" : "bg-gray-300"}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editForm.isActive ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                                <span className="text-sm font-medium text-slate-700">
                                    {editForm.isActive ? "Active — visible to students" : "Inactive — hidden from students"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4 gap-3 flex-col sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => { setEditOpen(false); setEditTarget(null); }}
                            disabled={actionLoading}
                            className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEdit}
                            disabled={actionLoading}
                            className="h-12 px-8 rounded-xl bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold shadow-md shadow-[#8D8DC7]/20"
                        >
                            {actionLoading ? <><Loader variant="inline" className="mr-2" /> Saving...</> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Manage Devices Modal ──────────────────────────────────────── */}
            <Dialog open={manageOpen} onOpenChange={setManageOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Manage Devices</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Add or remove devices in <strong>{manageTarget?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-6">
                        {/* Current devices */}
                        <div>
                            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                                Current Devices ({manageCurrentDevices.length})
                            </Label>
                            {manageCurrentDevices.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">No devices in this package yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {manageCurrentDevices.map((device) => {
                                        const id = device._id || device.id;
                                        return (
                                            <li
                                                key={id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-[#0b1d3a]">{device.name}</p>
                                                    {device.serialNumber && (
                                                        <p className="text-xs text-slate-400">{device.serialNumber}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-lg"
                                                    onClick={() => handleRemoveDevice(id)}
                                                    disabled={manageLoading}
                                                    title="Remove device"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Add more devices */}
                        <div className="border-t border-slate-100 pt-5 overflow-visible relative z-10 pb-40">
                            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                                Add More Devices
                            </Label>
                            <DeviceMultiSelect
                                allDevices={availableToAdd}
                                selectedIds={addDeviceIds}
                                onChange={setAddDeviceIds}
                                placeholder="Search available devices..."
                            />
                            <Button
                                onClick={handleAddDevices}
                                disabled={manageLoading || addDeviceIds.length === 0}
                                className="mt-3 w-full h-10 rounded-xl bg-[#126dd5] hover:bg-[#0f5ab1] text-white font-semibold"
                            >
                                {manageLoading ? <><Loader variant="inline" className="mr-2" /> Adding...</> : `Add ${addDeviceIds.length > 0 ? addDeviceIds.length : ""} Device${addDeviceIds.length !== 1 ? "s" : ""}`}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => { setManageOpen(false); setManageTarget(null); setAddDeviceIds([]); }}
                            className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Deactivate Confirm Modal ──────────────────────────────────── */}
            <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                <DialogContent className="bg-white sm:max-w-md border border-gray-200 shadow-xl rounded-3xl p-6">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4 bg-rose-100 text-rose-600">
                            <Trash2 className="h-7 w-7" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-[#0b1d3a]">Deactivate Package</DialogTitle>
                        <DialogDescription className="text-slate-500 mt-2">
                            Are you sure you want to deactivate <strong>{deactivateTarget?.name}</strong>? It will no longer be visible to students.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:justify-center mt-6">
                        <Button
                            variant="ghost"
                            onClick={() => { setDeactivateOpen(false); setDeactivateTarget(null); }}
                            disabled={actionLoading}
                            className="flex-1 rounded-xl text-slate-500 hover:text-[#0b1d3a] hover:bg-slate-50 h-11 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeactivate}
                            disabled={actionLoading}
                            className="flex-1 rounded-xl h-11 font-bold shadow-lg bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/10"
                        >
                            {actionLoading ? <><Loader variant="inline" className="mr-2" /> Deactivating...</> : "Deactivate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
