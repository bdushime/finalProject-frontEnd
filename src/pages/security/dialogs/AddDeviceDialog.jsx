import { useState, useEffect } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";

import {
    isFieldHidden,
    isFieldRequired,
    getDefaultValues,
    validateDeviceData,
    UserRoles,
} from "@/config/roleConfig";

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

    useEffect(() => {
        if (isOpen) {
            const defaults = getDefaultValues(userRole);
            setFormData((prev) => ({
                ...prev,
                ...defaults,
            }));
            setValidationErrors({});
        }
    }, [isOpen, userRole, setFormData]);

    const handleSubmit = () => {
        setValidationErrors({});
        const errors = validateDeviceData(userRole, formData);

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        onSubmit(formData);
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
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
                    <div className="grid grid-cols-2 gap-5">
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
                    <div className="grid grid-cols-2 gap-5">
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

                    {/* Row 3 */}
                    <div className="grid grid-cols-2 gap-5">
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

                    {/* Row 4 */}
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
                    </div>
                </div>

                <DialogFooter className="mt-4 gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={isLoading} className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="h-12 px-8 rounded-xl bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold shadow-md shadow-[#8D8DC7]/20"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
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