import { useState, useMemo, useEffect } from "react";
import { cn } from "@/components/ui/utils";
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
  Plus,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

import AddDeviceDialog from "./dialogs/AddDeviceDialog";
import EditDeviceDialog from "./dialogs/EditDeviceDialog";
import DeleteDeviceDialog from "./dialogs/DeleteDeviceDialog";
import BulkUploadDialog from "./dialogs/BulkUploadDialog";

import api from "@/utils/api";
import { UserRoles } from "@/config/roleConfig";
import { toast } from "sonner";

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

    const handleOpenAddDialog = () => {
      setIsAddDialogOpen(true);
    };

    const handleOpenBulkUpload = () => {
      setIsBulkUploadOpen(true);
    };

    window.addEventListener("openAddDeviceDialog", handleOpenAddDialog);
    window.addEventListener("openBulkUploadDialog", handleOpenBulkUpload);

    return () => {
      window.removeEventListener("openAddDeviceDialog", handleOpenAddDialog);
      window.removeEventListener("openBulkUploadDialog", handleOpenBulkUpload);
    };
  }, []);

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
      toast.error(errorMessage);
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

  const HeroSection = (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-4 relative z-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('browseDevices.title')}</h1>
          <p className="text-gray-400 flex items-center gap-2 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></span>
            {t('browseDevices.showingDevices', { current: filteredDevices.length, total: deviceList.length })}
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-3">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#8D8DC7] hover:bg-[#7A7AB5] text-white font-bold py-6 px-6 rounded-2xl shadow-lg shadow-[#8D8DC7]/20 transition-transform active:scale-95 border-none"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('devices.addDevice')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBulkUploadOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md font-bold py-6 px-6 rounded-2xl transition-transform active:scale-95"
          >
            <Upload className="h-5 w-5 mr-2" />
            {t('browseDevices.bulkUpload')}
          </Button>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#8D8DC7] transition-colors" />
          <Input
            placeholder={t('browseDevices.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border-slate-700/50 text-white placeholder:text-gray-500 py-7 pl-12 rounded-2xl focus:ring-2 focus:ring-[#8D8DC7]/50 transition-all backdrop-blur-sm shadow-xl"
          />
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout heroContent={HeroSection}>
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex items-center gap-1">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] border-none focus:ring-0 shadow-none font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#8D8DC7]" />
                  <SelectValue placeholder={t('browseDevices.filters.category')} />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="rounded-xl focus:bg-slate-50">
                    {cat === "All" ? t('browseDevices.filters.allCategories') : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-[1px] h-6 bg-slate-100 mx-1"></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-none focus:ring-0 shadow-none font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#8D8DC7]" />
                  <SelectValue placeholder={t('browseDevices.filters.status')} />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                <SelectItem value="all" className="rounded-xl focus:bg-slate-50">{t('browseDevices.filters.allStatus')}</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status} className="rounded-xl focus:bg-slate-50">
                    {t(`browseDevices.labels.${status}`) || status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(categoryFilter !== "All" || statusFilter !== "all" || searchQuery !== "") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("All");
                setStatusFilter("all");
              }}
              className="text-[#8D8DC7] hover:text-[#7A7AB5] hover:bg-[#8D8DC7]/5 font-semibold rounded-2xl px-4"
            >
              {t('browseDevices.filters.clearFilters')}
            </Button>
          )}
        </div>

        {/* Device Grid */}
        < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" >
          {
            filteredDevices.map((device) => (
              <Card
                key={device.id}
                className="border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white rounded-[2rem] overflow-hidden"
                onClick={() => navigateToDevice(device)}
              >
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-[#8D8DC7] transition-colors leading-tight">
                        {device.name}
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{device.brand} {device.model}</p>
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
                      <Eye className="h-5 w-5 text-slate-400 group-hover:text-[#8D8DC7]" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-4">
                  {/* Status and Condition Badges */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border-none shadow-sm shadow-black/5", getStatusColor(device.status))}>
                      {device.status}
                    </Badge>
                    <Badge variant="outline" className={cn("rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest border-none shadow-sm shadow-black/5", getConditionColor(device.condition))}>
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
                      <span className="truncate">{device.location || t('common:notSpecified', 'Not specified')}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] uppercase">{t('common:browseDevices.labels.sn')}</span>
                        <span className="font-mono text-gray-700">{device.serialNumber || 'N/A'}</span>
                      </div>
                    </div>
                    {device.purchasePrice > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatPrice(device.purchasePrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-50 flex justify-end gap-2">
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
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-slate-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(device);
                      }}
                      title="Edit Device"
                    >
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(device);
                      }}
                      title="Delete Device"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div >

        {/* Empty State */}
        {
          filteredDevices.length === 0 && (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('browseDevices.emptyState.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('browseDevices.emptyState.description')}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("All");
                    setStatusFilter("all");
                  }}
                  variant="outline"
                >
                  {t('browseDevices.filters.clearFilters')}
                </Button>
              </CardContent>
            </Card>
          )
        }

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
      </div >
    </MainLayout >
  );
}

export default BrowseDevices;