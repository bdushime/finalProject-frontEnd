import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, QrCode, Loader2 } from "lucide-react";
import api from "@/utils/api";
import PropTypes from "prop-types";

export default function DeviceDetailsDialog({ deviceId, open, onOpenChange }) {
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!deviceId || !open) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`/equipment/${deviceId}`);
                if (res.data) {
                    const d = res.data;
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

        fetchData();
    }, [deviceId, open]);

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
        if (!device) return;
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
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"><\/script>
          <script>
            QRCode.toCanvas(document.createElement('canvas'), '${device.qrCode || device.id}', { width: 200 }, function(err, canvas) {
              if (!err) {
                document.getElementById('qr-placeholder').replaceWith(canvas);
                setTimeout(() => window.print(), 500);
              }
            });
          <\/script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-[#1A2240]" />
                        <p className="text-sm text-gray-500">Loading device details...</p>
                    </div>
                ) : error || !device ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <p className="text-gray-500">{error || "Device not found"}</p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {device.name}
                            </DialogTitle>
                            <DialogDescription className="text-gray-500">
                                {device.brand} {device.model} &middot; SN: {device.serialNumber}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 pt-2">
                            {/* QR Code */}
                            <div className="flex flex-col items-center gap-3">
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
                            </div>

                            {/* Status & Condition */}
                            <div className="w-full border-t border-gray-100 pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Status</span>
                                    <Badge variant="outline" className={getStatusColor(device.status)}>
                                        {device.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-sm">Condition</span>
                                    <Badge variant="outline" className={getConditionColor(device.condition)}>
                                        {device.condition}
                                    </Badge>
                                </div>
                                {device.category && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-sm">Category</span>
                                        <span className="text-sm font-medium text-gray-800">{device.category}</span>
                                    </div>
                                )}
                                {device.location && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 text-sm">Location</span>
                                        <span className="text-sm font-medium text-gray-800">{device.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

DeviceDetailsDialog.propTypes = {
    deviceId: PropTypes.string,
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
};
