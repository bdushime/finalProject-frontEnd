import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Battery,
  Thermometer,
  Droplets,
  Loader2,
  Save,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import api from "@/utils/api";

export default function EquipmentDetailsDialog({
  equipment,
  open,
  onOpenChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State for Editing
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "",
    location: "",
    description: "",
    serialNumber: "",
  });

  // Reset data when opening the dialog
  useEffect(() => {
    if (open && equipment) {
      setIsEditing(false);
      setFormData({
        name: equipment.name || "",
        type: equipment.category || equipment.type || "",
        status: equipment.available > 0 ? "Available" : "Maintenance",
        location: equipment.location || "",
        description: equipment.description || "",
        serialNumber: equipment.serialNumber || "",
      });
    }
  }, [open, equipment]);

  if (!equipment) return null;

  // --- API HANDLERS ---
  const handleSave = async (e) => {
    // 1. STOP the default browser refresh
    if (e) e.preventDefault();

    console.log("🖱️ Save Button Clicked!");
    console.log("📦 Sending Data:", formData);

    setLoading(true);
    try {
      // 2. Send update to Backend
      const res = await api.put(`/equipment/${equipment.id}`, {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        location: formData.location,
        description: formData.description,
        serialNumber: formData.serialNumber,
      });

      console.log("✅ API Success:", res.data);

      // 3. Success! Close and Refresh
      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("❌ Request Failed:", err);
      // Alert user if something goes wrong so they know
      alert("Failed to save. Check F12 Console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this equipment? This cannot be undone."
      )
    )
      return;

    try {
      await api.delete(`/equipment/${equipment.id}`);
      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete equipment.");
    }
  };

  // --- RENDER HELPERS ---
  const isOnline = formData.status === "Available";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Added bg-white to prevent transparent background */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-bold">
            {isEditing ? "Edit Equipment" : equipment.name}

            {!isEditing && (
              <Badge
                className={
                  isOnline
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }
              >
                {formData.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the equipment details below."
              : "View detailed information and status for this item."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* --- VIEW MODE --- */}
          {!isEditing ? (
            <>
              {/* Main Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block text-xs uppercase">
                    Category
                  </span>
                  <span className="font-medium">{formData.type}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block text-xs uppercase">
                    Serial Number
                  </span>
                  <span className="font-medium font-mono">
                    {equipment.serialNumber || equipment.id?.substring(0, 8)}
                  </span>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="text-slate-500 block text-xs uppercase">
                      Location
                    </span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Description
                </h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {formData.description || "No description provided."}
                </p>
              </div>

              {/* Live Metrics (Placeholder for IoT Data) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 bg-green-50 rounded text-center">
                  <Battery className="h-4 w-4 text-green-600 mb-1" />
                  <span className="text-xs font-bold text-green-800">85%</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-orange-50 rounded text-center">
                  <Thermometer className="h-4 w-4 text-orange-600 mb-1" />
                  <span className="text-xs font-bold text-orange-800">
                    42°C
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-blue-50 rounded text-center">
                  <Droplets className="h-4 w-4 text-blue-600 mb-1" />
                  <span className="text-xs font-bold text-blue-800">12%</span>
                </div>
              </div>
            </>
          ) : (
            /* --- EDIT MODE --- */
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Category</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) =>
                      setFormData({ ...formData, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Projector">Projector</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Camera">Camera</SelectItem>
                      <SelectItem value="Audio">Audio</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({ ...formData, status: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="flex gap-2 sm:justify-between w-full pt-4 border-t mt-4">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                {/* FIX: Added type="button" and passed event (e) to handler */}
                <Button
                  type="button"
                  onClick={(e) => handleSave(e)}
                  disabled={loading}
                  className="bg-blue-600 text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#0b1d3a] text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

EquipmentDetailsDialog.propTypes = {
  equipment: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};
