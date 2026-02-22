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
import { useTranslation } from "react-i18next";

export default function EquipmentDetailsDialog({
  equipment,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation(["itstaff", "common"]);
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
      alert(t('equipment.messages.saveError') + ". Check F12 Console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t('equipment.dialog.confirmDelete')
      )
    )
      return;

    try {
      await api.delete(`/equipment/${equipment.id}`);
      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      console.error("Delete failed", err);
      alert(t('equipment.messages.deleteError'));
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
            {isEditing ? t('equipment.dialog.editTitle') : equipment.name}

            {!isEditing && (
              <Badge
                className={
                  isOnline
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }
              >
                {t(`equipment.status.${formData.status.toLowerCase()}`, formData.status)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('equipment.dialog.updateDesc')
              : t('equipment.dialog.viewDesc')}
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
                    {t('equipment.category')}
                  </span>
                  <span className="font-medium">{formData.type}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block text-xs uppercase">
                    {t('equipment.dialog.serialNumber')}
                  </span>
                  <span className="font-medium font-mono">
                    {equipment.serialNumber || equipment.id?.substring(0, 8)}
                  </span>
                </div>
                <div className="col-span-2 p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <span className="text-slate-500 block text-xs uppercase">
                      {t('equipment.dialog.location')}
                    </span>
                    <span className="font-medium">{formData.location}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  {t('equipment.dialog.description')}
                </h4>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {formData.description || t('equipment.dialog.noDescription')}
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
                <Label htmlFor="name">{t('equipment.dialog.name')}</Label>
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
                  <Label htmlFor="type">{t('equipment.category')}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) =>
                      setFormData({ ...formData, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('equipment.dialog.selectType')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Laptop">{t('equipment.categories.laptop')}</SelectItem>
                      <SelectItem value="Projector">{t('equipment.categories.projector')}</SelectItem>
                      <SelectItem value="Tablet">{t('equipment.categories.tablet')}</SelectItem>
                      <SelectItem value="Camera">{t('equipment.categories.camera')}</SelectItem>
                      <SelectItem value="Audio">{t('equipment.categories.audio')}</SelectItem>
                      <SelectItem value="Accessories">{t('equipment.categories.accessories')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">{t('equipment.status.title')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({ ...formData, status: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('equipment.dialog.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Available">{t('equipment.status.available')}</SelectItem>
                      <SelectItem value="Maintenance">{t('equipment.status.maintenance')}</SelectItem>
                      <SelectItem value="Lost">{t('equipment.status.lost')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">{t('equipment.dialog.storageLocation')}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">{t('equipment.dialog.description')}</Label>
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
                  {t('equipment.dialog.cancel')}
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
                  {t('equipment.dialog.save')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  title={t('equipment.dialog.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    {t('equipment.dialog.close')}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#0b1d3a] text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('equipment.dialog.edit')}
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
