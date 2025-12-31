import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, QrCode } from "lucide-react";
import { getEquipmentById } from "@/components/lib/equipmentData";
<<<<<<< HEAD
import CategoryBadge from "./components/CategoryBadge";
=======
import { CategoryBadge } from "./components/CategoryBadge";
import BackButton from "./components/BackButton";
>>>>>>> 0c4a4f5bc760ec1466c44da7987df7c5c93a8776
import { PageContainer } from "@/components/common/Page";

export default function EquipmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const equipment = getEquipmentById(id);

    if (!equipment) {
        return (
            <MainLayout>
                <PageContainer>
                    <Card className="border-2 border-[#468faf] rounded-xl">
                        <CardContent className="py-12 text-center">
                            <div className="p-4 rounded-full bg-[#a9d6e5] w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                <Package className="h-10 w-10 text-black" />
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">
                                Equipment not found
                            </h3>
                            <Button onClick={() => navigate('/student/browse')}>
                                Back to Catalogue
                            </Button>
                        </CardContent>
                    </Card>
                </PageContainer>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <PageContainer>
                <BackButton to="/student/browse" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-2 border-[#468faf] rounded-xl shadow-md hover:shadow-lg transition-all">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CategoryBadge category={equipment.category} />
                                            <Badge variant={equipment.available > 0 ? 'default' : 'secondary'}>
                                                {equipment.available > 0 ? 'Available' : 'Unavailable'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-black mb-2">{equipment.name}</CardTitle>
                                        <CardDescription className="text-base text-black">
                                            {equipment.brand} • {equipment.model}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-black">
                                            {equipment.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">Specifications</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {Object.entries(equipment.specs).map(([key, value]) => (
                                                <div key={key} className="p-3 bg-[#a9d6e5] rounded-xl border border-[#468faf] hover:bg-[#89c2d9] transition-colors">
                                                    <div className="text-sm text-black font-medium">{key}</div>
                                                    <div className="font-bold text-black">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-gray-300">
                            <CardHeader>
                                <CardTitle className="font-bold text-black">Equipment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-black" />
                                    <div>
                                        <div className="text-sm text-black">Availability</div>
                                        <div className="font-semibold text-black">
                                            {equipment.available} of {equipment.total} available
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-black" />
                                    <div>
                                        <div className="text-sm text-black">Location</div>
                                        <div className="font-semibold text-black">{equipment.location}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-black" />
                                    <div>
                                        <div className="text-sm text-black">Condition</div>
                                        <div className="font-semibold capitalize text-black">{equipment.condition}</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="text-sm text-black mb-2">Equipment ID</div>
                                    <div className="font-mono text-sm bg-[#a9d6e5] border border-[#468faf] p-3 rounded-xl text-black font-bold">
                                        {equipment.id}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-[#468faf] rounded-xl shadow-md hover:shadow-lg hover:bg-[#a9d6e5] transition-all duration-300">
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Button
                                        className="w-full bg-gradient-to-r from-[#013a63] to-[#01497c] hover:from-[#01497c] hover:to-[#014f86] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                                        disabled={equipment.available === 0}
                                        onClick={() => navigate(`/student/borrow-request?equipmentId=${equipment.id}`)}
                                    >
                                        Request to Borrow
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/student/borrow-request?equipmentId=${equipment.id}&scan=true`)}
                                    >
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Scan QR Code
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContainer>
        </MainLayout>
    );
}

