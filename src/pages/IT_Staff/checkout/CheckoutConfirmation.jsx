import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CheckoutConfirmation() {
    const navigate = useNavigate();

    return (
        <ITStaffLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg font-semibold mb-2">Checkout – Complete</h2>
                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="flex flex-col items-center gap-2 text-center py-10">
                        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
                        <CardTitle className="text-2xl text-emerald-800">Checkout Successful!</CardTitle>
                        <CardDescription className="text-emerald-700">The transaction has been logged.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center gap-4 pb-10">
                        <Button variant="outline" className="bg-white" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-2"/> Print Receipt
                        </Button>
                        <Button className="bg-[#0b1d3a]" onClick={() => navigate('/it/dashboard')}>
                            Go to Dashboard <ArrowRight className="h-4 w-4 ml-2"/>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </ITStaffLayout>
    );
}