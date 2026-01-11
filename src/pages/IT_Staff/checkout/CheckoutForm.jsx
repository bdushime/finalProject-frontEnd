import { useState } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";

function Progress() {
    return (
        <ol className="flex items-center gap-2 text-xs mb-4">
            <li className="px-2 py-1 rounded-full bg-neutral-200">1. Select</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">2. Scan</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">3. Photo</li>
            <li className="px-2 py-1 rounded-full bg-blue-600 text-white">4. Details</li>
            <li className="px-2 py-1 rounded-full bg-neutral-200">5. Sign</li>
        </ol>
    );
}

export default function CheckoutForm() {
    const navigate = useNavigate();
    const { state } = useLocation();
    
    const [form, setForm] = useState({
        userId: "", // In real app, maybe search user by name
        destination: "",
        purpose: "",
        returnDate: "",
        returnTime: "17:00"
    });

    const handleNext = () => {
        // Validate
        if(!form.userId || !form.returnDate) return alert("Please fill required fields");

        const expectedReturnTime = `${form.returnDate}T${form.returnTime}:00`;

        navigate('/it/checkout/sign', { 
            state: { 
                ...state, 
                formData: { ...form, expectedReturnTime } 
            } 
        });
    };

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Checkout – Details</h2>
                <Progress />
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Details</CardTitle>
                        <CardDescription>Enter borrower and return info</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Student ID / User ID</Label>
                            <Input 
                                placeholder="Enter User ID (from MongoDB)" 
                                value={form.userId}
                                onChange={e => setForm({...form, userId: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Destination / Class</Label>
                            <Input 
                                placeholder="e.g. Media Lab, Room 304" 
                                value={form.destination}
                                onChange={e => setForm({...form, destination: e.target.value})}
                            />
                        </div>
                         <div className="grid gap-2">
                            <Label>Purpose</Label>
                            <Input 
                                placeholder="e.g. Class Project" 
                                value={form.purpose}
                                onChange={e => setForm({...form, purpose: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Return Date</Label>
                                <Input 
                                    type="date" 
                                    value={form.returnDate}
                                    onChange={e => setForm({...form, returnDate: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Return Time</Label>
                                <Input 
                                    type="time" 
                                    value={form.returnTime}
                                    onChange={e => setForm({...form, returnTime: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-4">
                            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                            <Button onClick={handleNext}>Next</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ITStaffLayout>
    );
}