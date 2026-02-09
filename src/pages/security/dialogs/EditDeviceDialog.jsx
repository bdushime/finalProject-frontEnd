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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function EditDeviceDialog({
    isOpen,
    onOpenChange,
    formData,
    setFormData,
    categories,
    conditions,
    statuses,
    selectedDevice,
    onSubmit,
    onCancel,
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Device</DialogTitle>
                    <DialogDescription>
                        Update the details for {selectedDevice?.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Device Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-brand">Brand *</Label>
                            <Input
                                id="edit-brand"
                                value={formData.brand}
                                onChange={(e) =>
                                    setFormData({ ...formData, brand: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-model">Model *</Label>
                            <Input
                                id="edit-model"
                                value={formData.model}
                                onChange={(e) =>
                                    setFormData({ ...formData, model: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-serialNumber">Serial Number *</Label>
                            <Input
                                id="edit-serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, serialNumber: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-condition">Condition</Label>
                                <Select
                                    value={formData.condition}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, condition: value })
                                    }
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
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
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
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-location">Location *</Label>
                            <Input
                                id="edit-location"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-department">Department *</Label>
                            <Input
                                id="edit-department"
                                value={formData.department}
                                onChange={(e) =>
                                    setFormData({ ...formData, department: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-available">Available</Label>
                            <Input
                                id="edit-available"
                                type="number"
                                value={formData.available}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        available: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-total">Total Quantity</Label>
                            <Input
                                id="edit-total"
                                type="number"
                                value={formData.total}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        total: parseInt(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-purchasePrice">Purchase Price ($)</Label>
                            <Input
                                id="edit-purchasePrice"
                                type="number"
                                value={formData.purchasePrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        purchasePrice: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
                            <Input
                                id="edit-purchaseDate"
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, purchaseDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-warrantyExpiry">Warranty Expiry</Label>
                            <Input
                                id="edit-warrantyExpiry"
                                type="date"
                                value={formData.warrantyExpiry}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        warrantyExpiry: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-specifications">
                            Specifications (comma-separated)
                        </Label>
                        <Input
                            id="edit-specifications"
                            value={formData.specifications}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    specifications: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="bg-[#BEBEE0] hover:bg-[#a8a8d0] text-white"
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EditDeviceDialog;
