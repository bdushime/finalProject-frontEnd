import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    FileText, 
    Image as ImageIcon, 
    Package, 
    Trophy 
} from "lucide-react";

export default function CheckoutDetailsDialog({ isOpen, onOpenChange, selectedCheckout }) {
    if (!selectedCheckout) return null;

    // Helper to safely unpack data (handles both flat table data and nested API data)
    const data = {
        equipmentName: selectedCheckout.equipmentName || selectedCheckout.equipment?.name || "Unknown Item",
        checkedOutAt: selectedCheckout.checkedOutAt || "N/A",
        dueDate: selectedCheckout.dueDate || selectedCheckout.expectedReturnTime || "N/A",
        userName: selectedCheckout.userName || selectedCheckout.user?.username || "Unknown User",
        userEmail: selectedCheckout.userEmail || selectedCheckout.user?.email || "N/A",
        userPhone: selectedCheckout.userPhone || selectedCheckout.user?.phone || "N/A",
        
        // 👇 FIXED: Check 'responsibilityScore' correctly
        studentScore: selectedCheckout.studentScore !== undefined 
            ? selectedCheckout.studentScore 
            : (selectedCheckout.user?.responsibilityScore ?? 100), 

        destination: selectedCheckout.destination || "N/A",
        purpose: selectedCheckout.purpose || "N/A",
        checkoutPhoto: selectedCheckout.checkoutPhoto || "",
        status: selectedCheckout.status || "Unknown"
    };

    // Determine score color based on value
    const scoreColor = data.studentScore >= 80 ? "text-green-600" : data.studentScore >= 50 ? "text-yellow-600" : "text-red-600";
    const scoreBg = data.studentScore >= 80 ? "bg-green-50 border-green-200" : data.studentScore >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} >
            <DialogContent className="mx-4 m-auto bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Checkout Details</DialogTitle>
                    <DialogDescription>
                        Review details for this {data.status} request
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    
                    {/* 1. Borrower Information & Trust Score */}
                    <Card className="border-l-4 border-l-blue-600 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex justify-between items-center flex-wrap gap-2">
                                <span>Borrower Information</span>
                                
                                {/* Trust Score Badge */}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${scoreBg}`}>
                                    <Trophy className={`h-4 w-4 ${scoreColor}`} />
                                    <span className="text-sm font-medium text-gray-700">Trust Score:</span>
                                    <span className={`text-sm font-bold ${scoreColor}`}>{data.studentScore}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Name</div>
                                    <div className="font-semibold text-gray-900">{data.userName}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Email</div>
                                    <div className="font-semibold text-gray-900">{data.userEmail}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Phone</div>
                                    <div className="font-semibold text-gray-900">{data.userPhone}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Equipment Information */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Equipment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Equipment Name</div>
                                    <div className="font-semibold text-gray-900">{data.equipmentName}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Request / Checkout Date</div>
                                    <div className="font-semibold text-gray-900">{data.checkedOutAt}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Expected Return</div>
                                    <div className="font-semibold text-gray-900">{data.dueDate}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Logistics (Destination/Purpose) */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Checkout Logistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Destination / Location</div>
                                    <div className="font-semibold text-gray-900">{data.destination}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-600">Purpose</div>
                                    <div className="font-semibold text-gray-900">{data.purpose}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Condition Photo */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Equipment Condition Photo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Photo captured before checkout to document condition.
                                </p>
                                {data.checkoutPhoto ? (
                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        <img
                                            src={data.checkoutPhoto}
                                            alt="Equipment Condition"
                                            className="w-full h-auto object-cover max-h-[400px]"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/800x600?text=Image+Load+Error";
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-32 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                        No Photo Available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}