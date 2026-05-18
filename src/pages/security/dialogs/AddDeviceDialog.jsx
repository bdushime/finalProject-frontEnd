import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Search, X } from "lucide-react";
import Loader from "@/components/common/Loader";
import { fetchPackages } from "@/services/packagesService";

import {
    isFieldHidden,
    isFieldRequired,
    getDefaultValues,
    validateDeviceData,
    UserRoles,
} from "@/config/roleConfig";

function PackageSearchSelect({ packages, value, onChange, inputClass }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const filtered = useMemo(() => {
        if (!query.trim()) return packages;
        const q = query.toLowerCase();
        return packages.filter((p) => p.name?.toLowerCase().includes(q));
    }, [packages, query]);

    const selected = packages.find((p) => p._id === value);

    return (
        <div className="relative">
            {selected && (
                <span className="inline-flex items-center gap-1 bg-[#126dd5]/10 text-[#126dd5] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                    {selected.name}
                    <button
                        type="button"
                        onClick={() => { onChange(""); setQuery(""); }}
                        className="hover:text-rose-600 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            )}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    value={selected ? selected.name : query}
                    onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search packages (optional)..."
                    className={`${inputClass} pl-9`}
                />
            </div>
            {open && (
                <div className="absolute z-[110] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    <button
                        type="button"
                        onClick={() => { onChange(""); setQuery(""); setOpen(false); }}
                        className="w-full flex items-center px-4 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-50"
                    >
                        None
                    </button>
                    {filtered.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No packages found</p>
                    ) : (
                        filtered.map((pkg) => (
                            <button
                                key={pkg._id}
                                type="button"
                                onClick={() => { onChange(pkg._id); setQuery(""); setOpen(false); }}
                                className={`w-full flex items-center px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${value === pkg._id ? "bg-[#126dd5]/5" : ""}`}
                            >
                                <span className="font-medium text-[#0b1d3a]">{pkg.name}</span>
                            </button>
                        ))
                    )}
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2 border-t border-slate-100"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

function AddDeviceDialog({
    isOpen,
    onOpenChange,
    formData,
    setFormData,
    categories = [],
    conditions = [],
    statuses = [],
    onSubmit,
    onCancel,
    userRole = UserRoles.SECURITY,
    isLoading = false,
}) {
    const [validationErrors, setValidationErrors] = useState({});
    const [packages, setPackages] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState("");

    useEffect(() => {
        if (isOpen) {
            const defaults = getDefaultValues(userRole);
            setFormData((prev) => ({
                ...prev,
                ...defaults,
            }));
            setValidationErrors({});
            setSelectedPackageId("");

            // Load active packages for the optional assignment dropdown
            fetchPackages()
                .then((data) => {
                    const list = Array.isArray(data) ? data : (data?.data || data?.packages || []);
                    setPackages(list.filter((p) => p.isActive !== false));
                })
                .catch(() => {
                    // Non-critical — silently ignore if packages endpoint is unavailable
                    setPackages([]);
                });
        }
    }, [isOpen, userRole, setFormData]);

    const handleSubmit = () => {
        setValidationErrors({});
        const errors = validateDeviceData(userRole, formData);

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Include packageId only when the user selected one
        const submitData = { ...formData };
        if (selectedPackageId) {
            submitData.packageId = selectedPackageId;
        }

        onSubmit(submitData);
    };

    const shouldShowField = (fieldName) => {
        return !isFieldHidden(userRole, fieldName);
    };

    const fieldRequired = (fieldName) => {
        return isFieldRequired(userRole, fieldName);
    };

    const inputClass = "w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Add New Device</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Enter the details for the new equipment device.
                        {userRole === UserRoles.SECURITY && (
                            <span className="block mt-1 text-[#8D8DC7] font-medium">
                                Status will be automatically set to "Available"
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {Object.keys(validationErrors).length > 0 && (
                    <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc pl-4 mt-2 text-sm">
                                {Object.entries(validationErrors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-5 py-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                                Device Name {fieldRequired("name") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder='e.g., Epson Projector X5'
                                className={`${inputClass} ${validationErrors.name ? "border-red-500 ring-red-100" : ""}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-semibold text-slate-700">
                                Category {fieldRequired("category") && <span className="text-red-500">*</span>}
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger className={`${inputClass} ${validationErrors.category ? "border-red-500 ring-red-100" : ""}`}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="z-[100] bg-white rounded-xl shadow-lg border-gray-100">
                                    {(categories || []).filter((c) => c !== "All").map((cat) => (
                                        <SelectItem key={cat} value={cat} className="rounded-lg focus:bg-gray-50">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="serialNumber" className="text-sm font-semibold text-slate-700">
                                Serial Number {fieldRequired("serialNumber") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="e.g., SN-PROJ-001"
                                className={`${inputClass} ${validationErrors.serialNumber ? "border-red-500 ring-red-100" : ""}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iotTag" className="text-sm font-semibold text-slate-700">
                                IoT Tracking Tag
                            </Label>
                            <Input
                                id="iotTag"
                                value={formData.iotTag}
                                onChange={(e) => setFormData({ ...formData, iotTag: e.target.value })}
                                placeholder="e.g., TAG-987654"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Row 3 — optional brand & model */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-sm font-semibold text-slate-700">
                                Brand <span className="text-slate-400 font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="brand"
                                value={formData.brand || ""}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="e.g., Epson"
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-sm font-semibold text-slate-700">
                                Model <span className="text-slate-400 font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="model"
                                value={formData.model || ""}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder="e.g., PowerLite X5"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-semibold text-slate-700">
                                Location {fieldRequired("location") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Main Storage"
                                className={`${inputClass} ${validationErrors.location ? "border-red-500 ring-red-100" : ""}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="condition" className="text-sm font-semibold text-slate-700">Condition</Label>
                            <Select
                                value={formData.condition}
                                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                            >
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent className="z-[100] bg-white rounded-xl shadow-lg border-gray-100">
                                    {(conditions || []).map((cond) => (
                                        <SelectItem key={cond} value={cond} className="rounded-lg focus:bg-gray-50">
                                            {cond.charAt(0).toUpperCase() + cond.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 5 — optional purchase info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="purchaseDate" className="text-sm font-semibold text-slate-700">
                                Purchase Date <span className="text-slate-400 font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="purchaseDate"
                                type="date"
                                value={formData.purchaseDate || ""}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                className={`${inputClass} ${validationErrors.purchaseDate ? "border-red-500 ring-red-100" : ""}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-semibold text-slate-700">
                                Purchase Price <span className="text-slate-400 font-normal">(optional)</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                step="any"
                                value={formData.amount || ""}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="e.g., 1500"
                                className={`${inputClass} ${validationErrors.amount ? "border-red-500 ring-red-100" : ""}`}
                            />
                        </div>
                    </div>

                    {/* Row 5 */}
                    <div className="grid grid-cols-1 gap-5">
                        {shouldShowField("status") && (
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold text-slate-700">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger className={inputClass}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] bg-white rounded-xl shadow-lg border-gray-100">
                                        {(statuses || []).map((status) => (
                                            <SelectItem key={status} value={status} className="rounded-lg focus:bg-gray-50">
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter device description..."
                                rows={3}
                                className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm"
                            />
                        </div>

                        {/* Assign to Package (optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="packageId" className="text-sm font-semibold text-slate-700">
                                Assign to Package{" "}
                                <span className="text-slate-400 font-normal">(optional)</span>
                            </Label>
                            <PackageSearchSelect
                                packages={packages}
                                value={selectedPackageId}
                                onChange={setSelectedPackageId}
                                inputClass={inputClass}
                            />
                            <p className="text-xs text-slate-400">
                                If selected, this device will be added to the chosen package after registration.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4 gap-3 flex-col sm:flex-row">
                    <Button variant="outline" onClick={onCancel} disabled={isLoading} className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-slate-900">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="h-12 px-8 rounded-xl bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold shadow-md shadow-[#8D8DC7]/20"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><Loader variant="inline" className="mr-2" /> Adding...</>
                        ) : (
                            "Add Device"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default AddDeviceDialog;