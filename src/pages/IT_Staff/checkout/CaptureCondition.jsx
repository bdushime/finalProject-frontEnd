import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

function Progress() {
    return (
        <ol className="flex items-center gap-2 text-xs mb-4">
            <li className="px-2 py-1 rounded-full bg-neutral-200">1. Select</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">2. Scan</li>
            <li className="px-2 py-1 rounded-full bg-blue-600 text-white">3. Photo</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">4. Details</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">5. Sign</li>
        </ol>
    );
}

export default function CaptureCondition() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [photoTaken, setPhotoTaken] = useState(false);

    const handleTakePhoto = () => {
        // In real app, access camera. Here we simulate.
        setPhotoTaken(true);
    };

    const handleNext = () => {
        // Pass dummy photo URL to next step
        navigate('/it/checkout/details', { 
            state: { 
                ...state, 
                checkoutPhotoUrl: "https://via.placeholder.com/300?text=Condition+Photo" 
            } 
        });
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Checkout – Condition</h2>
                <Progress />
                <Card>
                    <CardHeader>
                        <CardTitle>Capture Photo</CardTitle>
                        <CardDescription>Document condition of {state?.equipment?.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-video rounded-xl bg-neutral-100 grid place-items-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500" onClick={handleTakePhoto}>
                            {photoTaken ? (
                                <div className="text-green-600 flex flex-col items-center">
                                    <Check className="h-10 w-10" />
                                    <span>Photo Captured</span>
                                </div>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Camera className="h-14 w-14 mb-2" />
                                    <span>Click to take photo</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                            <Button onClick={handleNext} disabled={!photoTaken}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ITStaffLayout>
    );
}