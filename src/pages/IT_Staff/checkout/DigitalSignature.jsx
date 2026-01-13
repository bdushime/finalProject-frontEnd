import { useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "@/utils/api";

function Progress() {
    return (
        <ol className="flex items-center gap-2 text-xs mb-4">
            <li className="px-2 py-1 rounded-full bg-neutral-200">1. Select</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">2. Scan</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">3. Photo</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">4. Details</li>
            <li className="px-2 py-1 rounded-full bg-blue-600 text-white">5. Sign</li>
        </ol>
    );
}

export default function DigitalSignature() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [loading, setLoading] = useState(false);
    const [signed, setSigned] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Unpack all the data we collected across the steps
            const payload = {
                equipmentId: state.equipment._id,
                userId: state.formData.userId, // Must be valid ID from DB
                expectedReturnTime: state.formData.expectedReturnTime,
                destination: state.formData.destination,
                purpose: state.formData.purpose,
                checkoutPhotoUrl: state.checkoutPhotoUrl,
                signatureUrl: "signed_virtually" // In real app, upload canvas image
            };

            await api.post('/transactions/checkout', payload);
            
            navigate('/it/checkout/confirmation');
        } catch (err) {
            console.error("Checkout failed", err);
            alert("Checkout Failed: " + (err.response?.data?.message || "Server Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Checkout – Sign</h2>
                <Progress />
                <Card>
                    <CardHeader>
                        <CardTitle>Digital Signature</CardTitle>
                        <CardDescription>Borrower must sign below</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Simulation of a Canvas Pad */}
                        <div 
                            className="h-56 rounded-xl bg-neutral-100 border-2 border-dashed border-gray-300 grid place-items-center cursor-crosshair"
                            onClick={() => setSigned(true)}
                        >
                            {signed ? <span className="font-handwriting text-2xl text-blue-600">John Doe (Signed)</span> : <span className="text-gray-400">Click to Sign</span>}
                        </div>

                        <div className="mt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSigned(false)}>Clear</Button>
                            <Button onClick={handleSubmit} disabled={!signed || loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "Complete Checkout"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ITStaffLayout>
    );
}