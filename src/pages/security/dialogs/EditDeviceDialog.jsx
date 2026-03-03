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
import { Loader2 } from "lucide-react";

function EditDeviceDialog({
    isOpen,
    onOpenChange,
    formData,
    setFormData,
    categories = [],
    conditions = [],
    statuses = [],
    selectedDevice,
    onSubmit,
    onCancel,
    isLoading = false
}) {
    const inputClass = "w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Edit Device</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Update the details for {selectedDevice?.name}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-5 py-4">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-semibold text-slate-700">Device Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-category" className="text-sm font-semibold text-slate-700">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger className={inputClass}>
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
                    
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-serialNumber" className="text-sm font-semibold text-slate-700">Serial Number *</Label>
                            <Input
                                id="edit-serialNumber"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-iotTag" className="text-sm font-semibold text-slate-700">IoT Tracking Tag</Label>
                            <Input
                                id="edit-iotTag"
                                value={formData.iotTag}
                                onChange={(e) => setFormData({ ...formData, iotTag: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-location" className="text-sm font-semibold text-slate-700">Location *</Label>
                            <Input
                                id="edit-location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-condition" className="text-sm font-semibold text-slate-700">Condition</Label>
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

                    <div className="space-y-2">
                        <Label htmlFor="edit-status" className="text-sm font-semibold text-slate-700">Status</Label>
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

                    <div className="space-y-2">
                        <Label htmlFor="edit-description" className="text-sm font-semibold text-slate-700">Description</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full p-4 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#8D8DC7]/50 focus:border-[#8D8DC7] transition-all shadow-sm"
                        />
                    </div>
                </div>
                
                <DialogFooter className="mt-4 gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={isLoading} className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
                        Cancel
                    </Button>
                    <Button 
                        onClick={onSubmit} 
                        className="h-12 px-8 rounded-xl bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold shadow-md shadow-[#8D8DC7]/20" 
                        disabled={isLoading}
                    >
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EditDeviceDialog;