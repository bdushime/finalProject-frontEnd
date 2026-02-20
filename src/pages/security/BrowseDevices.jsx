import { useState, useMemo, useEffect } from "react";
import MainLayout from "./layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Hash,
  Tag,
  Upload,
  Activity,
  Battery
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AddDeviceDialog from "./dialogs/AddDeviceDialog";
import EditDeviceDialog from "./dialogs/EditDeviceDialog";
import DeleteDeviceDialog from "./dialogs/DeleteDeviceDialog";
import BulkUploadDialog from "./dialogs/BulkUploadDialog";

import api from "@/utils/api";
import { UserRoles } from "@/config/roleConfig";

// 👇 FIX: Added default fallback arrays so the dropdowns never break!
const DEFAULT_CATEGORIES = ['Laptop', 'Projector', 'Camera', 'Microphone', 'Tablet', 'Audio', 'Accessories', 'Electronics', 'Other'];
const DEFAULT_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];
const DEFAULT_STATUSES = ['Available', 'Checked Out', 'Maintenance', 'Lost'];

function BrowseDevices() {
  const { t } = useTranslation(["security", "common"]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [deviceList, setDeviceList] = useState([]);
  
  // 👇 FIX: Initialize state with the defaults
  const [categories, setCategories] = useState(["All", ...DEFAULT_CATEGORIES]);
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);

  // Get current user role from localStorage
  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : { role: UserRoles.SECURITY };
    } catch {
      return { role: UserRoles.SECURITY };
    }
  }, []);

  // Fetch devices
  const fetchDevices = async () => {
    try {
      const devicesRes = await api.get('/equipment');
      if (devicesRes.data) {
        const mappedDevices = devicesRes.data.map(d => ({
          ...d,
          id: d._id,
          category: d.type || d.category, // Map backend 'type' to frontend 'category'
        }));
        setDeviceList(mappedDevices);
      }
    } catch (err) {
      console.error("Failed to fetch equipment list:", err);
    }
  };

  useEffect(() => {
    const fetchOptionsAndDevices = async () => {
      try {
        const optionsRes = await api.get('/config/options');
        // Only overwrite defaults if the API actually returns arrays
        if (optionsRes.data && optionsRes.data.categories && optionsRes.data.categories.length > 0) {
          setCategories(["All", ...optionsRes.data.categories]);
          setConditions(optionsRes.data.conditions);
          setStatuses(optionsRes.data.statuses);
        }
      } catch (err) {
        console.warn("Failed to fetch config options, using defaults.", err);
      }

      await fetchDevices();
    };
    fetchOptionsAndDevices();

    // Listen for the Topbar buttons
    const handleOpenAddDialog = () => setIsAddDialogOpen(true);
    const handleOpenBulkUpload = () => setIsBulkUploadOpen(true);

    window.addEventListener("openAddDeviceDialog", handleOpenAddDialog);
    window.addEventListener("openBulkUploadDialog", handleOpenBulkUpload);

    return () => {
      window.removeEventListener("openAddDeviceDialog", handleOpenAddDialog);
      window.removeEventListener("openBulkUploadDialog", handleOpenBulkUpload);
    };
  }, []);

  // Form data matched to backend model exactly
  const [formData, setFormData] = useState({
    name: "",
    category: "", // Maps to DB `type`
    serialNumber: "",
    condition: "Good",
    status: "Available",
    location: "Main Storage",
    description: "",
    iotTag: "" 
  });

  const navigateToDevice = (device) => {
    navigate(`/security/device/${device.id}`);
  };

  const filteredDevices = useMemo(() => {
    if (!deviceList) return [];
    return deviceList.filter((device) => {
      const matchesSearch =
        searchQuery === "" ||
        device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (device.serialNumber && device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (device.iotTag && device.iotTag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "All" || device.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || device.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [deviceList, searchQuery, categoryFilter, statusFilter]);

  // Handle Add Device
  const handleAddDevice = async (completeData) => {
    setIsLoading(true);
    try {
      const newDeviceData = {
        name: completeData.name,
        type: completeData.category, 
        description: completeData.description,
        serialNumber: completeData.serialNumber,
        status: completeData.status || 'Available',
        condition: completeData.condition || 'Good',
        location: completeData.location || 'Main Storage',
        iotTag: completeData.iotTag || undefined 
      };

      const response = await api.post('/equipment', newDeviceData);

      if (response.data) {
        await fetchDevices();
        setIsAddDialogOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Failed to add device:", err);
      const errorMessage = err.response?.data?.errors?.join(", ") ||
        err.response?.data?.message ||
        "Failed to add device. Please check your input and try again.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDevice = () => {
    setDeviceList(
      deviceList.map((device) =>
        device.id === selectedDevice.id
          ? { ...selectedDevice, ...formData }
          : device
      )
    );
    setIsEditDialogOpen(false);
    setSelectedDevice(null);
    resetForm();
  };

  const handleDeleteDevice = async () => {
    try {
      await api.delete(`/equipment/${selectedDevice.id}`);
      setDeviceList(deviceList.filter((device) => device.id !== selectedDevice.id));
      setIsDeleteDialogOpen(false);
      setSelectedDevice(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete device");
    }
  };

  const handleBulkUploadComplete = (results) => {
    console.log("Bulk upload complete:", results);
    fetchDevices();
  };

  const openEditDialog = (device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      category: device.type || device.category,
      serialNumber: device.serialNumber,
      condition: device.condition || "Good",
      status: device.status || "Available",
      location: device.location || "Main Storage",
      description: device.description || "",
      iotTag: device.iotTag || ""
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (device) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "", category: "", serialNumber: "",
      condition: "Good", status: "Available", location: "Main Storage",
      description: "", iotTag: ""
    });
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    const colors = {
      available: "bg-green-100 text-green-800 border-green-200",
      "checked out": "bg-blue-100 text-blue-800 border-blue-200",
      maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
      damaged: "bg-red-100 text-red-800 border-red-200",
      lost: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getConditionColor = (condition) => {
    if (!condition) return "bg-green-100 text-green-800 border-green-200";
    const colors = {
      excellent: "bg-[#BEBEE0] text-[#1A2240] border-[#BEBEE0]",
      good: "bg-green-100 text-green-800 border-green-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-orange-100 text-orange-800 border-orange-200",
      damaged: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[condition.toLowerCase()] || "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-4">
        {/* Search and Filter Bar */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('browseDevices.searchPlaceholder', "Search by name, SN, or IoT Tag...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full border-gray-200 shadow-sm bg-white"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t('browseDevices.filters.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "All" ? t('browseDevices.filters.allCategories') : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select >
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t('browseDevices.filters.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('browseDevices.filters.allStatus')}</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`browseDevices.labels.${status}`) || status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Bulk Upload Button */}
                <Button
                  variant="outline"
                  onClick={() => setIsBulkUploadOpen(true)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Bulk Upload</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Count Summary */}
        <div className="text-sm text-gray-600 px-1">
          Showing {filteredDevices.length} of {deviceList.length} devices
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Card
              key={device.id}
              className="border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#BEBEE0] transition-all duration-200 cursor-pointer group flex flex-col h-full"
              onClick={() => navigateToDevice(device)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#1A2240]">
                      {device.name}
                    </CardTitle>
                    {/* Render IoT Tag if it exists */}
                    {device.iotTag ? (
                        <p className="text-xs text-blue-600 font-mono bg-blue-50 inline-block px-1.5 py-0.5 rounded">IoT: {device.iotTag}</p>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No IoT Tag</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToDevice(device);
                    }}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 text-[#1A2240]" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col">
                {/* Status and Condition Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                  <Badge variant="outline" className={getConditionColor(device.condition)}>
                    {device.condition}
                  </Badge>
                </div>

                <div className="space-y-2.5 text-sm flex-1 mt-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>{device.category || device.type}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono text-xs">{device.serialNumber}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{typeof device.location === 'string' ? device.location : "Coordinates mapped"}</span>
                  </div>

                  {/* Optional: Render IoT stats if the device has them */}
                  {device.trackingStatus && device.trackingStatus !== 'Unknown' && (
                     <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                       <Activity className={`h-4 w-4 ${device.trackingStatus === 'Safe' ? 'text-green-500' : 'text-red-500'}`} />
                       <span className="text-xs font-semibold">{device.trackingStatus}</span>
                       <span className="text-gray-300 mx-1">•</span>
                       <Battery className={`h-4 w-4 ${device.batteryLevel > 20 ? 'text-green-500' : 'text-red-500'}`} />
                       <span className="text-xs">{device.batteryLevel}%</span>
                     </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex justify-end gap-1 mt-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/security/device-movement/${device.id}`);
                    }}
                    title="View Movement History"
                  >
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(device);
                    }}
                    title="Edit Device"
                  >
                    <Edit className="h-4 w-4 text-[#1A2240]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(device);
                    }}
                    title="Delete Device"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDevices.length === 0 && (
          <Card className="border border-gray-200 shadow-sm mt-6">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('browseDevices.emptyState.title', 'No devices found')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('browseDevices.emptyState.description', 'Adjust your filters or add a new device.')}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setStatusFilter("all");
                }}
                variant="outline"
              >
                {t('browseDevices.filters.clearFilters', 'Clear Filters')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Device Dialog */}
        <AddDeviceDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          conditions={conditions}
          statuses={statuses}
          onSubmit={handleAddDevice}
          onCancel={() => {
            setIsAddDialogOpen(false);
            resetForm();
          }}
          userRole={currentUser.role}
          isLoading={isLoading}
        />

        {/* Edit Device Dialog */}
        <EditDeviceDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          conditions={conditions}
          statuses={statuses}
          selectedDevice={selectedDevice}
          onSubmit={handleEditDevice}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setSelectedDevice(null);
            resetForm();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteDeviceDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          selectedDevice={selectedDevice}
          onConfirm={handleDeleteDevice}
        />

        {/* Bulk Upload Dialog */}
        <BulkUploadDialog
          isOpen={isBulkUploadOpen}
          onOpenChange={setIsBulkUploadOpen}
          onUploadComplete={handleBulkUploadComplete}
          userRole={currentUser.role}
        />
      </div>
    </MainLayout>
  );
}

export default BrowseDevices;