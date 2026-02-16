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
import { AlertCircle, Loader2 } from "lucide-react";

// Import centralized role configuration
import {
    CategorySpecifications,
    isFieldHidden,
    isFieldRequired,
    getDefaultValues,
    getSpecsForCategory,
    validateDeviceData,
    UserRoles,
} from "@/config/roleConfig";

/**
 * AddDeviceDialog - REFACTORED
 * 
 * Key Changes:
 * 1. Role-aware form fields (hides status/department for Security Officers)
 * 2. Dynamic specifications based on category selection
 * 3. Price validation (required for Security Officers)
 * 4. Structured specifications stored as key-value pairs
 * 5. No more quantity/available/total fields
 */
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
    userRole = UserRoles.SECURITY, // Default to Security for backwards compatibility
    isLoading = false,
}) {
    const [validationErrors, setValidationErrors] = useState({});
    const [specifications, setSpecifications] = useState({});

    // Get role-specific defaults on mount
    useEffect(() => {
        if (isOpen) {
            const defaults = getDefaultValues(userRole);
            setFormData((prev) => ({
                ...prev,
                ...defaults,
            }));
            setValidationErrors({});
            setSpecifications({});
        }
    }, [isOpen, userRole]);

    // Get dynamic spec fields for selected category
    const specFields = useMemo(() => {
        return getSpecsForCategory(formData.category);
    }, [formData.category]);

    // Reset specifications when category changes
    useEffect(() => {
        if (formData.category) {
            setSpecifications({});
        }
    }, [formData.category]);

    // Handle specification field change
    const handleSpecChange = (key, value) => {
        setSpecifications((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Validate and submit
    const handleSubmit = () => {
        // Clear previous errors
        setValidationErrors({});

        // Build the complete form data with specifications
        const completeData = {
            ...formData,
            specifications: specifications,
        };

        // Validate using role configuration
        const errors = validateDeviceData(userRole, completeData);

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Call parent submit with specifications included
        onSubmit(completeData);
    };

    // Check if field should be shown
    const shouldShowField = (fieldName) => {
        return !isFieldHidden(userRole, fieldName);
    };

    // Check if field is required
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

                {/* Validation Errors Alert */}
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
                                placeholder='e.g., MacBook Pro 16"'
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
                                    {categories
                                        .filter((c) => c !== "All")
                                        .map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Brand & Model */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand">
                                Brand {fieldRequired("brand") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="brand"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                placeholder="e.g., Apple"
                                className={validationErrors.brand ? "border-red-500" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">
                                Model {fieldRequired("model") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="model"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                placeholder='e.g., MacBook Pro 16" M3 Pro'
                                className={validationErrors.model ? "border-red-500" : ""}
                            />
                        </div>
                    </div>

                    {/* Row 3: Serial Number & Condition */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="serialNumber">
                                Serial Number {fieldRequired("serialNumber") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                placeholder="e.g., SN-MBP-001"
                                className={validationErrors.serialNumber ? "border-red-500" : ""}
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

                    {/* Row 4: Location & Status (Status hidden for Security) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">
                                Location {fieldRequired("location") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Building A, Room 101"
                                className={validationErrors.location ? "border-red-500" : ""}
                            />
                        </div>

                        {/* Status field - HIDDEN for Security Officers */}
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

                        {/* Department field - HIDDEN for Security Officers */}
                        {shouldShowField("department") && (
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g., IT Department"
                                />
                            </div>
                        )}
                    </div>

                    {/* Row 5: Purchase Price & Dates */}
                    {/* REFACTORED: Removed available/total fields, purchasePrice is mandatory for Security */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purchasePrice">
                                Purchase Price ($) {fieldRequired("purchasePrice") && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.purchasePrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        purchasePrice: e.target.value,
                                    })
                                }
                                placeholder="e.g., 1299.99"
                                className={validationErrors.purchasePrice ? "border-red-500" : ""}
                            />
                            {validationErrors.purchasePrice && (
                                <p className="text-xs text-red-500">{validationErrors.purchasePrice}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purchaseDate">Purchase Date</Label>
                            <Input
                                id="purchaseDate"
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                            <Input
                                id="warrantyExpiry"
                                type="date"
                                value={formData.warrantyExpiry}
                                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter device description..."
                            rows={2}
                        />
                    </div>

                    {/* Dynamic Specifications Section */}
                    {formData.category && specFields.length > 0 && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <Label className="text-sm font-semibold text-gray-700">
                                {formData.category} Specifications
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                                {specFields.map((spec) => (
                                    <div key={spec.key} className="space-y-1">
                                        <Label htmlFor={spec.key} className="text-xs text-gray-600">
                                            {spec.label}
                                        </Label>
                                        <Input
                                            id={spec.key}
                                            type={spec.type}
                                            value={specifications[spec.key] || ""}
                                            onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                                            placeholder={spec.placeholder}
                                            className="text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
