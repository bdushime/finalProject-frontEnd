import { QRCodeSVG } from "qrcode.react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";

// AUCA Standard Asset Lifespans (Years)
const CATEGORY_LIFESPAN = {
    "Electronics": 3,
    "Furniture": 10,
    "Lab Equipment": 5,
    "Office Supplies": 2,
    "Vehicles": 7
};

function ViewDeviceDialog({
    isOpen,
    onOpenChange,
    device,
    onEdit,
    onDelete,
    getStatusColor,
    getConditionColor,
}) {
    if (!device) return null;

    // Straight-line Depreciation Logic
    const getDepreciation = () => {
        if (!device.purchasePrice || !device.purchaseDate) {
            return { currentValue: 0, percentLost: 0, annualRate: 0, yearsRemaining: 0 };
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

    const handlePrintQR = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${device.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: Arial, sans-serif; }
            .qr-container { text-align: center; padding: 20px; border: 2px solid #ccc; border-radius: 8px; }
            .device-name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .device-id { font-size: 14px; color: #666; margin-bottom: 20px; }
            .serial { font-size: 12px; color: #888; margin-top: 10px; }
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Device Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header with Name and QR Code */}
                    <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{device.name}</h2>
                            <p className="text-gray-500">{device.brand} {device.model}</p>
                            <div className="flex gap-2 mt-3">
                                <Badge variant="outline" className={getStatusColor?.(device.status) || "bg-gray-100"}>
                                    {device.status}
                                </Badge>
                                <Badge variant="outline" className={getConditionColor?.(device.condition) || "bg-gray-100"}>
                                    {device.condition}
                                </Badge>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-sm">
                                <QRCodeSVG value={device.qrCode || device.id} size={100} />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrintQR}
                                className="text-xs"
                            >
                                <Printer className="h-3 w-3 mr-1" />
                                Print QR
                            </Button>
                        </div>
                    </div>

                    {/* Depreciation Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Asset Depreciation</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500 uppercase font-medium">Original Cost</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {device.purchasePrice?.toLocaleString() || 0} RWF
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500 uppercase font-medium">Current Value</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {depreciation.currentValue} RWF
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500 uppercase font-medium">Annual Depreciation</p>
                                <p className="text-lg font-bold text-orange-600">
                                    {depreciation.annualRate} RWF
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border">
                                <p className="text-xs text-gray-500 uppercase font-medium">Years Remaining</p>
                                <p className="text-lg font-bold text-green-600">
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
                    </div>

                    {/* Device Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Device Information</h3>

                            <div className="flex items-center gap-3 text-sm">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Serial Number:</span>
                                <span className="font-medium">{device.serialNumber}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <Package className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Category:</span>
                                <span className="font-medium">{device.category}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <Package className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Availability:</span>
                                <span className="font-medium">{device.available} / {device.total} units</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Location:</span>
                                <span className="font-medium">{device.location}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Department:</span>
                                <span className="font-medium">{device.department}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Purchase & Warranty</h3>

                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Purchase Date:</span>
                                <span className="font-medium">
                                    {device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Purchase Price:</span>
                                <span className="font-medium">{device.purchasePrice?.toLocaleString() || 0} RWF</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-500">Warranty Expires:</span>
                                <span className="font-medium">
                                    {device.warrantyExpiry ? new Date(device.warrantyExpiry).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {device.description && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900">Description</h3>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {device.description}
                            </p>
                        </div>
                    )}

                    {/* Specifications */}
                    {device.specifications && device.specifications.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-900">Specifications</h3>
                            <div className="flex flex-wrap gap-2">
                                {(Array.isArray(device.specifications) ? device.specifications : [device.specifications]).map((spec, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
                                        {spec}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        {onEdit && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false);
                                    onEdit(device);
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    onOpenChange(false);
                                    onDelete(device);
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ViewDeviceDialog;
