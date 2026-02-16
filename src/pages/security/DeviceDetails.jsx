import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import MainLayout from "./layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Package,
    MapPin,
    Calendar,
    TrendingDown,
    Building2,
    Tag,
    DollarSign,
    ShieldCheck,
    Printer,
    Edit,
    Trash2,
    ArrowLeft,
    QrCode,
} from "lucide-react";

import api from "@/utils/api";



const CATEGORY_LIFESPAN = {
    "Electronics": 3,
    "Furniture": 10,
    "Lab Equipment": 5,
    "Office Supplies": 2,
    "Vehicles": 7
};

function DeviceDetails() {
    const { deviceId } = useParams();
    const navigate = useNavigate();

    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [categories, setCategories] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [statuses, setStatuses] = useState([]);

    const [formData, setFormData] = useState({
        name: "", category: "", brand: "", model: "", serialNumber: "",
        condition: "excellent", status: "available", location: "",
        department: "", available: 0, total: 0, purchaseDate: "",
        purchasePrice: 0, warrantyExpiry: "", description: "", specifications: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const optionsRes = await api.get('/config/options');
                if (optionsRes.data) {
                    setCategories(optionsRes.data.categories || []);
                    setConditions(optionsRes.data.conditions || []);
                    setStatuses(optionsRes.data.statuses || []);
                }

                const deviceRes = await api.get(`/equipment/${deviceId}`);
                if (deviceRes.data) {
                    const d = deviceRes.data;
                    setDevice({
                        ...d,
                        id: d._id,
                        category: d.type || d.category,
                        available: d.available || 1,
                        total: d.total || 1,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch device:", err);
                setError("Failed to load device details");
            } finally {
                setLoading(false);
            }
        };

        if (deviceId) {
            fetchData();
        }
    }, [deviceId]);

    const getDepreciation = () => {
        if (!device?.purchasePrice || !device?.purchaseDate) {
            return { currentValue: 0, percentLost: 0, annualRate: 0, yearsRemaining: 0, lifespanYears: 5, ageInYears: 0 };
        }

        const cost = parseFloat(device.purchasePrice);
        const purchaseDate = new Date(device.purchaseDate);
        const today = new Date();
        const lifespanYears = CATEGORY_LIFESPAN[device.category] || 5;

        const ageInYears = (today - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);
        const annualDepreciation = cost / lifespanYears;
        const totalDepreciation = annualDepreciation * ageInYears;

        const currentValue = Math.max(0, cost - totalDepreciation);
        const percentLost = Math.min(100, (totalDepreciation / cost) * 100);
        const yearsRemaining = Math.max(0, lifespanYears - ageInYears);

        return {
            currentValue: currentValue.toLocaleString(),
            percentLost: percentLost.toFixed(1),
            annualRate: annualDepreciation.toLocaleString(),
            yearsRemaining: yearsRemaining.toFixed(1),
            lifespanYears,
            ageInYears: ageInYears.toFixed(1),
        };
    };

    const depreciation = getDepreciation();

    // Status and condition color helpers
    const getStatusColor = (status) => {
        if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
        const colors = {
            available: "bg-green-100 text-green-800 border-green-200",
            "checked out": "bg-blue-100 text-blue-800 border-blue-200",
            maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
            damaged: "bg-red-100 text-red-800 border-red-200",
        };
        return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getConditionColor = (condition) => {
        if (!condition) return "bg-green-100 text-green-800 border-green-200";
        const colors = {
            excellent: "bg-[#BEBEE0] text-[#1A2240] border-[#BEBEE0]",
            good: "bg-green-100 text-green-800 border-green-200",
            damaged: "bg-red-100 text-red-800 border-red-200",
        };
        return colors[condition.toLowerCase()] || "bg-green-100 text-green-800 border-green-200";
    };

    // Print QR Code
    const handlePrintQR = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${device.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: Arial, sans-serif; }
            .qr-container { text-align: center; padding: 40px; border: 2px solid #ccc; border-radius: 8px; }
            .device-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .device-id { font-size: 16px; color: #666; margin-bottom: 20px; }
            .serial { font-size: 14px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="device-name">${device.name}</div>
            <div class="device-id">ID: ${device.id}</div>
            <svg id="qr-placeholder"></svg>
            <div class="serial">SN: ${device.serialNumber}</div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${device.qrCode || device.id}', { width: 200 }, function(err, canvas) {
              if (!err) {
                document.getElementById('qr-placeholder').replaceWith(canvas);
                setTimeout(() => window.print(), 500);
              }
            });
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };


    const resetForm = () => {
        setFormData({
            name: "", category: "", brand: "", model: "", serialNumber: "",
            condition: "excellent", status: "available", location: "",
            department: "", available: 0, total: 0, purchaseDate: "",
            purchasePrice: 0, warrantyExpiry: "", description: "", specifications: "",
        });
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A2240]"></div>
                </div>
            </MainLayout>
        );
    }

    if (error || !device) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-gray-500">{error || "Device not found"}</p>
                    <Button variant="outline" onClick={() => navigate("/security/devices")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Devices
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/security/devices")}
                            className="h-10 w-10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
                            <p className="text-gray-500">{device.brand} {device.model}</p>
                        </div>
                    </div>

                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* Left Column - QR Code & Quick Info */}
                    <div className="lg:col-span-1 space-y-2">
                        {/* QR Code Card */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <QrCode className="h-5 w-5" />
                                    QR Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="bg-white p-4 border-2 border-gray-200 rounded-xl shadow-sm">
                                    <QRCodeSVG value={device.qrCode || device.id} size={180} />
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                    Scan to identify device
                                </p>
                                <Button variant="outline" onClick={handlePrintQR} className="w-full">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print QR Code
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Status Card */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-medium">Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <Badge variant="outline" className={getStatusColor(device.status)}>
                                        {device.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Condition</span>
                                    <Badge variant="outline" className={getConditionColor(device.condition)}>
                                        {device.condition}
                                    </Badge>
                                </div>
                                {/* <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Availability</span>
                                    <span className="font-medium">{device.available} / {device.total} units</span>
                                </div> */}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <Card className="border border-gray-200 shadow-sm bg-[#0A1128]/15">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                                    <TrendingDown className="h-5 w-5 text-blue-600" />
                                    Asset Depreciation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Original Cost</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {device.purchasePrice?.toLocaleString() || 0} RWF
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Current Value</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {depreciation.currentValue} RWF
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Annual Depreciation</p>
                                        <p className="text-xl font-bold text-orange-600">
                                            {depreciation.annualRate} RWF
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 uppercase font-medium mb-1">Years Remaining</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {depreciation.yearsRemaining} yrs
                                        </p>
                                    </div>
                                </div>

                                {/* Depreciation Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Value Lost: {depreciation.percentLost}%</span>
                                        <span className="text-gray-600">Age: {depreciation.ageInYears} / {depreciation.lifespanYears} years</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 rounded-full ${parseFloat(depreciation.percentLost) > 80
                                                ? 'bg-gradient-to-r from-red-400 to-red-600'
                                                : parseFloat(depreciation.percentLost) > 50
                                                    ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                                                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                }`}
                                            style={{ width: `${100 - parseFloat(depreciation.percentLost)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Device Information */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-medium">Device Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Tag className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Serial Number</p>
                                                <p className="font-medium">{device.serialNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Category</p>
                                                <p className="font-medium">{device.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Purchase Date</p>
                                                <p className="font-medium">
                                                    {device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Purchase Price</p>
                                                <p className="font-medium">{device.purchasePrice?.toLocaleString() || 0} RWF</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Warranty Expiry</p>
                                                <p className="font-medium">
                                                    {device.warrantyExpiry ? new Date(device.warrantyExpiry).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description & Specifications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Description */}
                            <Card className="border border-gray-200 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-medium">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        {device.description || "No description available"}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Specifications */}
                            <Card className="border border-gray-200 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg font-medium">Specifications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {device.specifications && device.specifications.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(device.specifications) ? device.specifications : [device.specifications]).map((spec, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
                                                    {spec}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No specifications listed</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}

export default DeviceDetails;
