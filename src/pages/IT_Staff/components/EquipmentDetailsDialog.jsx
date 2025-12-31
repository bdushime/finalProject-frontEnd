import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CircleDot,
    MapPin,
    Battery,
    Thermometer,
    Droplets,
    Clock,
    Package,
    X,
} from "lucide-react";
import BorrowingHistory from "./BorrowingHistory";

export default function EquipmentDetailsDialog({ equipment, open, onOpenChange }) {
    const [fullEquipment, setFullEquipment] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch full equipment details and borrowing history when dialog opens
    useEffect(() => {
        if (open && equipment?.id) {
            setLoading(true);
            Promise.all([
                fetch("/trackers.json").then((res) => res.json()),
                fetch("/borrow-history.json").then((res) => res.json()).catch(() => []),
            ])
                .then(([trackers, histories]) => {
                    const found = trackers.find((t) => t.id === equipment.id);
                    const historyEntry = histories.find((h) => h.id === equipment.id);
                    setFullEquipment(found || equipment);
                    setHistory(historyEntry?.history || []);
                })
                .catch((err) => {
                    console.error("Failed to load equipment details", err);
                    setFullEquipment(equipment);
                    setHistory([]);
                })
                .finally(() => setLoading(false));
        }
    }, [open, equipment?.id]);

    if (!equipment) return null;

    const data = fullEquipment || equipment;
    const isOnline = data.status === "online" || data.condition === "online";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-100 overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold">
                                {data.equipment || data.name}
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">ID: {data.id}</p>
                        </div>
                        <Badge
                            className={
                                isOnline
                                    ? "bg-yellow-400 text-yellow-900"
                                    : "bg-gray-200 text-gray-600"
                            }
                        >
                            {isOnline ? "Available" : "Unavailable"}
                        </Badge>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-gray-500">
                        Loading details...
                    </div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {/* Status Indicator */}
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${isOnline
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-600"
                                    }`}
                            >
                                <CircleDot
                                    className={`h-4 w-4 ${isOnline ? "text-emerald-600" : "text-red-500"
                                        }`}
                                />
                                {isOnline ? "Online" : "Offline"}
                            </span>
                        </div>

                        {/* Equipment Image Placeholder */}
                        <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Location */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Location
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {data.location || "Unknown"}
                                    </p>
                                </div>
                            </div>

                            {/* Last Seen */}
                            {data.lastSeen && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Last Seen
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(data.lastSeen).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Battery */}
                            {data.battery !== undefined && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Battery className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Battery
                                        </p>
                                        <p className="font-medium text-gray-900">{data.battery}%</p>
                                    </div>
                                </div>
                            )}

                            {/* Temperature */}
                            {data.temperature !== undefined && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Thermometer className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Temperature
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {data.temperature}°C
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Humidity */}
                            {data.humidity !== undefined && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <div className="p-2 bg-cyan-100 rounded-lg">
                                        <Droplets className="h-5 w-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Humidity
                                        </p>
                                        <p className="font-medium text-gray-900">{data.humidity}%</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Borrowing History */}
                        <BorrowingHistory history={history} />

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                className="flex-1 bg-[#0b1d3a] hover:bg-[#0b1d3a]/90 text-white rounded-full"
                                onClick={() => onOpenChange(false)}
                            >
                                Start Checkout
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full"
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

EquipmentDetailsDialog.propTypes = {
    equipment: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        equipment: PropTypes.string,
        category: PropTypes.string,
        location: PropTypes.string,
        status: PropTypes.string,
        condition: PropTypes.string,
        battery: PropTypes.number,
        temperature: PropTypes.number,
        humidity: PropTypes.number,
        lastSeen: PropTypes.string,
    }),
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
};
