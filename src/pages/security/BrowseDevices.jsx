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
  Calendar,
  DollarSign,
  Tag,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AddDeviceDialog from "./dialogs/AddDeviceDialog";
import EditDeviceDialog from "./dialogs/EditDeviceDialog";
import DeleteDeviceDialog from "./dialogs/DeleteDeviceDialog";
import BulkUploadDialog from "./dialogs/BulkUploadDialog";

import api from "@/utils/api";
import { UserRoles } from "@/config/roleConfig";

/**
 * BrowseDevices - REFACTORED
 * 
 * Key Changes:
 * 1. Removed quantity/available/total display (asset-level tracking)
 * 2. Added bulk upload integration
 * 3. Passes userRole to AddDeviceDialog for role-specific behavior
 * 4. Updated handleAddDevice to work with new form structure
 * 5. Each card now represents ONE physical device
 */
function BrowseDevices() {
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
  const [categories, setCategories] = useState(["All"]);
  const [conditions, setConditions] = useState([]);
  const [statuses, setStatuses] = useState([]);

  // Get current user role from localStorage
  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : { role: UserRoles.SECURITY };
    } catch {
      return { role: UserRoles.SECURITY };
    }
  }, []);

  // Function to fetch devices (extracted for reuse)
  const fetchDevices = async () => {
    try {
      const devicesRes = await api.get('/equipment');
      if (devicesRes.data) {
        // REFACTORED: Each device is one physical unit, no quantity mapping needed
        const mappedDevices = devicesRes.data.map(d => ({
          ...d,
          id: d._id,
          category: d.type || d.category,
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
        if (optionsRes.data) {
          setCategories(["All", ...optionsRes.data.categories]);
          setConditions(optionsRes.data.conditions);
          setStatuses(optionsRes.data.statuses);
        }
      } catch (err) {
        console.warn("Failed to fetch config options:", err);
      }

      await fetchDevices();
    };
    fetchOptionsAndDevices();

    // Listen for the "Add Device" button click from the Topbar
    const handleOpenAddDialog = () => {
      setIsAddDialogOpen(true);
    };

    // Listen for the "Bulk Upload" button click from the Topbar
    const handleOpenBulkUpload = () => {
      setIsBulkUploadOpen(true);
    };

    window.addEventListener("openAddDeviceDialog", handleOpenAddDialog);
    window.addEventListener("openBulkUploadDialog", handleOpenBulkUpload);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("openAddDeviceDialog", handleOpenAddDialog);
      window.removeEventListener("openBulkUploadDialog", handleOpenBulkUpload);
    };
  }, []);

  // REFACTORED: Initial form data without quantity fields
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    condition: "Good",
    status: "Available",
    location: "",
    department: "",
    purchaseDate: "",
    purchasePrice: "",
    warrantyExpiry: "",
    description: "",
    specifications: {},
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
        (device.brand && device.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (device.serialNumber && device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "All" || device.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || device.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [deviceList, searchQuery, categoryFilter, statusFilter]);

  // REFACTORED: handleAddDevice now works with structured specifications
  const handleAddDevice = async (completeData) => {
    setIsLoading(true);
    try {
      // Prepare the device data for the backend
      const newDeviceData = {
        name: completeData.name,
        type: completeData.category, // Backend uses 'type' for category
        description: completeData.description,
        serialNumber: completeData.serialNumber,
        status: completeData.status || 'Available',
        condition: completeData.condition || 'Good',
        location: completeData.location,
        brand: completeData.brand,
        model: completeData.model,
        purchaseDate: completeData.purchaseDate,
        purchasePrice: parseFloat(completeData.purchasePrice) || 0,
        warrantyExpiry: completeData.warrantyExpiry,
        specifications: completeData.specifications || {},
      };

      // REFACTORED: Don't send department for Security Officers (handled by backend)
      // REFACTORED: Don't send quantity/available/total (removed from model)

      // Call the backend API to create the device
      const response = await api.post('/equipment', newDeviceData);

      if (response.data) {
        // Refresh the device list to show the new device
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

  const handleDeleteDevice = () => {
    setDeviceList(deviceList.filter((device) => device.id !== selectedDevice.id));
    setIsDeleteDialogOpen(false);
    setSelectedDevice(null);
  };

  const handleBulkUploadComplete = (results) => {
    console.log("Bulk upload complete:", results);
    // Refresh the device list
    fetchDevices();
  };

  const openEditDialog = (device) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      category: device.category,
      brand: device.brand,
      model: device.model,
      serialNumber: device.serialNumber,
      condition: device.condition,
      status: device.status,
      location: device.location,
      department: device.department || "",
      purchaseDate: device.purchaseDate || "",
      purchasePrice: device.purchasePrice || "",
      warrantyExpiry: device.warrantyExpiry || "",
      description: device.description || "",
      specifications: device.specifications || {},
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (device) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };

  // REFACTORED: Reset form without quantity fields
  const resetForm = () => {
    setFormData({
      name: "", category: "", brand: "", model: "", serialNumber: "",
      condition: "Good", status: "Available", location: "",
      department: "", purchaseDate: "",
      purchasePrice: "", warrantyExpiry: "", description: "", specifications: {},
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

  // Format price for display
  const formatPrice = (price) => {
    if (!price && price !== 0) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Search and Filter Bar */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, brand, model, serial number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full border-gray-200 shadow-sm bg-white"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}
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
        <div className="text-sm text-gray-600">
          Showing {filteredDevices.length} of {deviceList.length} devices
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Card
              key={device.id}
              className="border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#BEBEE0] transition-all duration-200 cursor-pointer group"
              onClick={() => navigateToDevice(device)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#1A2240]">
                      {device.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{device.brand} {device.model}</p>
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
              <CardContent className="space-y-3">
                {/* Status and Condition Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                  <Badge variant="outline" className={getConditionColor(device.condition)}>
                    {device.condition}
                  </Badge>
                </div>

                {/* REFACTORED: Removed quantity display, show relevant info instead */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>{device.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{device.location || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>SN: {device.serialNumber}</span>
                  </div>
                  {device.purchasePrice > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatPrice(device.purchasePrice)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-gray-200 flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/security/device-movement/${device.id}`);
                    }}
                    title="View Movement"
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
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Devices Found
              </h3>
              <p className="text-gray-600 mb-4">
                {deviceList.length === 0
                  ? "No devices have been added yet. Add your first device!"
                  : "No devices match your current filters. Try adjusting your search."}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#343264]">
                Add New Device
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Device Dialog - REFACTORED: Now receives userRole */}
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

        {/* Bulk Upload Dialog - NEW */}
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