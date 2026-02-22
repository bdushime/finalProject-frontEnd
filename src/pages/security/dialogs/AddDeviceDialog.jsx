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
    categories,
    conditions,
    statuses,
    onSubmit,
    onCancel,
    userRole = UserRoles.SECURITY,
    isLoading = false,
}) {
    const [validationErrors, setValidationErrors] = useState({});

    // Get role-specific defaults on mount
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

    // Validate and submit
    const handleSubmit = () => {
        setValidationErrors({});

        // Validate using role configuration
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new equipment device.
                        {userRole === UserRoles.SECURITY && (
                            <span className="block mt-1 text-blue-600">
                                Status will be automatically set to "Available"
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {Object.keys(validationErrors).length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc pl-4 mt-2">
                                {Object.entries(validationErrors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 py-4">
                    {/* Row 1: Device Name & Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Device Name {fieldRequired("name") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder='e.g., Epson Projector X5'
                                className={validationErrors.name ? "border-red-500" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Category {fieldRequired("category") && <span className="text-red-500">*</span>}
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger className={validationErrors.category ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.filter((c) => c !== "All").map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Serial Number & IoT Tag */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="serialNumber">
                                Serial Number {fieldRequired("serialNumber") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="e.g., SN-PROJ-001"
                                className={validationErrors.serialNumber ? "border-red-500" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iotTag">
                                IoT Tracking Tag
                            </Label>
                            <Input
                                id="iotTag"
                                value={formData.iotTag}
                                onChange={(e) => setFormData({ ...formData, iotTag: e.target.value })}
                                placeholder="e.g., TAG-987654"
                            />
                        </div>
                    </div>

                    {/* Row 3: Location & Condition */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">
                                Location {fieldRequired("location") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Main Storage"
                                className={validationErrors.location ? "border-red-500" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="condition">Condition</Label>
                            <Select
                                value={formData.condition}
                                onValueChange={(value) => setFormData({ ...formData, condition: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditions.map((cond) => (
                                        <SelectItem key={cond} value={cond}>
                                            {cond.charAt(0).toUpperCase() + cond.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 4: Status (Hidden for Security by default) & Description */}
                    <div className="grid grid-cols-1 gap-4">
                        {shouldShowField("status") && (
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter device description..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-[#BEBEE0] hover:bg-[#a8a8d0] text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
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