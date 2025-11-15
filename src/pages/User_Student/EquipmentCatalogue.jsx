import { useState } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Grid3x3, List, Package, Eye, QrCode } from "lucide-react";
import { equipmentData, categories } from "@/components/lib/equipmentData";
import { PageContainer, PageHeader } from "@/components/common/Page";
import { CategoryBadge } from "./components/CategoryBadge";
import { useNavigate } from "react-router-dom";

export default function EquipmentCatalogue() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const filteredEquipment = equipmentData
        .filter(item =>
            (selectedCategory === 'All Categories' || item.category === selectedCategory) &&
            (searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'availability':
                    return b.available - a.available;
                default:
                    return 0;
            }
        });

    const handleBorrowRequest = (equipment) => {
        navigate(`/student/borrow-request?equipmentId=${equipment.id}`);
    };

    const handleViewDetails = (equipment) => {
        navigate(`/student/equipment/${equipment.id}`);
    };

    return (
        <MainLayout>
            <PageContainer>
                <PageHeader
                    title="Equipment Catalogue"
                    subtitle="Browse and request available IT equipment for your projects"
                />

                <Card className="mb-6 border-gray-300">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name, brand, or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit">Search</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/student/borrow-request?scan=true')}
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Scan QR
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name (A-Z)</SelectItem>
                                        <SelectItem value="category">Category</SelectItem>
                                        <SelectItem value="availability">Availability</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex gap-2 sm:ml-auto">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid3x3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Found {filteredEquipment.length} {filteredEquipment.length === 1 ? 'item' : 'items'}
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEquipment.map(equipment => (
                            <Card key={equipment.id} className="flex flex-col hover:shadow-lg transition-shadow border-gray-300">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <CategoryBadge category={equipment.category} />
                                        <Badge variant={equipment.available > 0 ? 'default' : 'secondary'}>
                                            {equipment.available > 0 ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{equipment.name}</CardTitle>
                                    <CardDescription>{equipment.brand} • {equipment.model}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {equipment.description}
                                    </p>
                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Available:</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {equipment.available} / {equipment.total}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <Package className="h-4 w-4 mr-2" />
                                            <span>{equipment.location}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => handleViewDetails(equipment)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Details
                                            </Button>
                                            <Button
                                                className="flex-1 bg-[#343264] hover:bg-[#2a2752] text-white"
                                                disabled={equipment.available === 0}
                                                onClick={() => handleBorrowRequest(equipment)}
                                            >
                                                Borrow
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEquipment.map(equipment => (
                            <Card key={equipment.id} className="border-gray-300">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 mb-3">
                                                <CategoryBadge category={equipment.category} />
                                                <Badge variant={equipment.available > 0 ? 'default' : 'secondary'}>
                                                    {equipment.available > 0 ? 'Available' : 'Unavailable'}
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                {equipment.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {equipment.brand} • {equipment.model}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                {equipment.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                    <Package className="h-4 w-4 mr-2" />
                                                    <span>{equipment.location}</span>
                                                </div>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Available: <span className="font-semibold">{equipment.available} / {equipment.total}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col gap-2 sm:w-32">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => handleViewDetails(equipment)}
                                            >
                                                <Eye className="h-4 w-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Details</span>
                                            </Button>
                                            <Button
                                                className="flex-1 bg-[#343264] hover:bg-[#2a2752] text-white"
                                                disabled={equipment.available === 0}
                                                onClick={() => handleBorrowRequest(equipment)}
                                            >
                                                Borrow
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {filteredEquipment.length === 0 && (
                    <Card className="border-gray-300">
                        <CardContent className="py-12 text-center">
                            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No equipment found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Try adjusting your search or filter criteria
                            </p>
                        </CardContent>
                    </Card>
                )}
            </PageContainer>
        </MainLayout>
    );
}

