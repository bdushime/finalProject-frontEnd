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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Package,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock device data
const mockDevices = [
  {
    id: "EQ-001",
    name: "MacBook Pro 16\"",
    category: "Laptop",
    brand: "Apple",
    model: "MacBook Pro 16\" M3 Pro",
    serialNumber: "SN-MBP-001",
    qrCode: "QR-MBP-001",
    condition: "excellent",
    status: "available",
    location: "Building A, Room 101",
    department: "IT Department",
    available: 3,
    total: 10,
    purchaseDate: "2024-01-15",
    purchasePrice: 2499,
    warrantyExpiry: "2027-01-15",
    description: "High-performance laptop perfect for video editing, software development, and intensive computing tasks.",
    specifications: ["Apple M3 Pro", "32GB RAM", "1TB SSD", "16.2\" Display"],
  },
  {
    id: "EQ-002",
    name: "Dell XPS 15",
    category: "Laptop",
    brand: "Dell",
    model: "XPS 15 9530",
    serialNumber: "SN-DELL-002",
    qrCode: "QR-DELL-002",
    condition: "excellent",
    status: "available",
    location: "Room 101",
    department: "IT Department",
    available: 5,
    total: 8,
    purchaseDate: "2024-02-20",
    purchasePrice: 1899,
    warrantyExpiry: "2027-02-20",
    description: "Premium Windows laptop with stunning OLED display and powerful performance.",
    specifications: ["Intel Core i7", "16GB RAM", "512GB SSD", "15.6\" OLED"],
  },
  {
    id: "EQ-003",
    name: "iPad Pro 12.9\"",
    category: "Tablet",
    brand: "Apple",
    model: "iPad Pro 12.9\" (6th Gen)",
    serialNumber: "SN-IPAD-003",
    qrCode: "QR-IPAD-003",
    condition: "good",
    status: "in-use",
    location: "Building A, Room 102",
    department: "Media Department",
    available: 8,
    total: 15,
    purchaseDate: "2024-03-10",
    purchasePrice: 1099,
    warrantyExpiry: "2027-03-10",
    description: "Versatile tablet with Apple Pencil support, perfect for digital art and presentations.",
    specifications: ["Apple M2", "8GB RAM", "256GB Storage", "12.9\" Display"],
  },
  {
    id: "EQ-004",
    name: "Canon EOS R5",
    category: "Camera",
    brand: "Canon",
    model: "EOS R5",
    serialNumber: "SN-CANON-004",
    qrCode: "QR-CANON-004",
    condition: "excellent",
    status: "available",
    location: "Building B, Media Lab",
    department: "Media Department",
    available: 2,
    total: 5,
    purchaseDate: "2024-01-05",
    purchasePrice: 3899,
    warrantyExpiry: "2027-01-05",
    description: "Professional mirrorless camera with 45MP sensor and 8K video recording.",
    specifications: ["45MP Sensor", "8K Video", "IBIS", "Dual Card Slots"],
  },
  {
    id: "EQ-005",
    name: "Sony A7III",
    category: "Camera",
    brand: "Sony",
    model: "Alpha 7 III",
    serialNumber: "SN-SONY-005",
    qrCode: "QR-SONY-005",
    condition: "good",
    status: "maintenance",
    location: "Building B, Media Lab",
    department: "Media Department",
    available: 1,
    total: 4,
    purchaseDate: "2023-11-20",
    purchasePrice: 1999,
    warrantyExpiry: "2026-11-20",
    description: "Full-frame mirrorless camera with exceptional low-light performance.",
    specifications: ["24MP Sensor", "4K Video", "5-axis IBIS", "693 AF Points"],
  },
];

const categories = ["All", "Laptop", "Tablet", "Camera", "Audio", "Video", "Projector", "Accessories"];
const conditions = ["excellent", "good", "fair", "poor", "damaged"];
const statuses = ["available", "in-use", "maintenance", "damaged", "lost"];

function BrowseDevices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState(mockDevices);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Listen for custom event from Topbar to open add dialog
  useEffect(() => {
    const handleOpenAddDialog = () => {
      resetForm();
      setIsAddDialogOpen(true);
    };

    window.addEventListener("openAddDeviceDialog", handleOpenAddDialog);
    return () => {
      window.removeEventListener("openAddDeviceDialog", handleOpenAddDialog);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    condition: "excellent",
    status: "available",
    location: "",
    department: "",
    available: 0,
    total: 0,
    purchaseDate: "",
    purchasePrice: 0,
    warrantyExpiry: "",
    description: "",
    specifications: "",
  });

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        searchQuery === "" ||
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "All" || device.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || device.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [devices, searchQuery, categoryFilter, statusFilter]);

  const handleAddDevice = () => {
    const newDevice = {
      id: `EQ-${String(devices.length + 1).padStart(3, "0")}`,
      qrCode: `QR-${String(devices.length + 1).padStart(3, "0")}`,
      ...formData,
      specifications: formData.specifications.split(",").map((s) => s.trim()),
    };
    setDevices([...devices, newDevice]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditDevice = () => {
    setDevices(
      devices.map((device) =>
        device.id === selectedDevice.id
          ? {
              ...selectedDevice,
              ...formData,
              specifications: formData.specifications.split(",").map((s) => s.trim()),
            }
          : device
      )
    );
    setIsEditDialogOpen(false);
    setSelectedDevice(null);
    resetForm();
  };

  const handleDeleteDevice = () => {
    setDevices(devices.filter((device) => device.id !== selectedDevice.id));
    setIsDeleteDialogOpen(false);
    setSelectedDevice(null);
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
      department: device.department,
      available: device.available,
      total: device.total,
      purchaseDate: device.purchaseDate,
      purchasePrice: device.purchasePrice,
      warrantyExpiry: device.warrantyExpiry || "",
      description: device.description,
      specifications: device.specifications.join(", "),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (device) => {
    setSelectedDevice(device);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      brand: "",
      model: "",
      serialNumber: "",
      condition: "excellent",
      status: "available",
      location: "",
      department: "",
      available: 0,
      total: 0,
      purchaseDate: "",
      purchasePrice: 0,
      warrantyExpiry: "",
      description: "",
      specifications: "",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800 border-green-200",
      "in-use": "bg-blue-100 text-blue-800 border-blue-200",
      maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
      damaged: "bg-red-100 text-red-800 border-red-200",
      lost: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || colors.available;
  };

  const getConditionColor = (condition) => {
    const colors = {
      excellent: "bg-[#BEBEE0] text-[#1A2240] border-[#BEBEE0]",
      good: "bg-green-100 text-green-800 border-green-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-orange-100 text-orange-800 border-orange-200",
      damaged: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[condition] || colors.good;
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, brand, model, serial number, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full border-gray-200 shadow-sm bg-white"
                />
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Devices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Card
              key={device.id}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {device.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{device.brand} {device.model}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/security/logs?device=${device.id}`)}
                      title="View Logs"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(device)}
                      title="Edit Device"
                    >
                      <Edit className="h-4 w-4 text-[#1A2240]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDeleteDialog(device)}
                      title="Delete Device"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                  <Badge variant="outline" className={getConditionColor(device.condition)}>
                    {device.condition}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>
                      {device.available} / {device.total} available
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{device.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>SN: {device.serialNumber}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {device.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <Card className="border border-gray-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No devices found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                  setStatusFilter("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Device Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Enter the details for the new equipment device
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Device Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='e.g., MacBook Pro 16"'
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="e.g., Apple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder='e.g., MacBook Pro 16" M3 Pro'
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    placeholder="e.g., SN-MBP-001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
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
                    <Label htmlFor="status">Status</Label>
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
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Building A, Room 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="e.g., IT Department"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="available">Available</Label>
                  <Input
                    id="available"
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
                  <Label htmlFor="total">Total Quantity</Label>
                  <Input
                    id="total"
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
                  <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
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
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                  <Input
                    id="warrantyExpiry"
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter device description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specifications">
                  Specifications (comma-separated)
                </Label>
                <Input
                  id="specifications"
                  value={formData.specifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specifications: e.target.value,
                    })
                  }
                  placeholder='e.g., 32GB RAM, 1TB SSD, 16.2" Display'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddDevice}
                className="bg-[#BEBEE0] hover:bg-[#a8a8d0] text-white"
              >
                Add Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Device Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
              <DialogDescription>
                Update the details for {selectedDevice?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Same form fields as Add Dialog */}
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
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedDevice(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditDevice}
                className="bg-[#BEBEE0] hover:bg-[#a8a8d0] text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                device <strong>{selectedDevice?.name}</strong> and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDevice}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}

export default BrowseDevices;
