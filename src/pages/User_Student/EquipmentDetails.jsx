import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, Calendar, QrCode } from "lucide-react";
import { getEquipmentById } from "@/components/lib/equipmentData";
import { CategoryBadge } from "./components/CategoryBadge";
import { PageContainer } from "@/components/common/Page";

export default function EquipmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const equipment = getEquipmentById(id);

    if (!equipment) {
        return (
            <MainLayout>
                <PageContainer>
                    <Card className="border-gray-300">
                        <CardContent className="py-12 text-center">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
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
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/student/browse')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Catalogue
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-gray-300">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CategoryBadge category={equipment.category} />
                                            <Badge variant={equipment.available > 0 ? 'default' : 'secondary'}>
                                                {equipment.available > 0 ? 'Available' : 'Unavailable'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl mb-2">{equipment.name}</CardTitle>
                                        <CardDescription className="text-base">
                                            {equipment.brand} • {equipment.model}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {equipment.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">Specifications</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {Object.entries(equipment.specs).map(([key, value]) => (
                                                <div key={key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">{key}</div>
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{value}</div>
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
                                <CardTitle>Equipment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Package className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Availability</div>
                                        <div className="font-semibold">
                                            {equipment.available} of {equipment.total} available
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                                        <div className="font-semibold">{equipment.location}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Condition</div>
                                        <div className="font-semibold capitalize">{equipment.condition}</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Equipment ID</div>
                                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                        {equipment.id}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-300">
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Button
                                        className="w-full bg-[#343264] hover:bg-[#2a2752] text-white"
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

