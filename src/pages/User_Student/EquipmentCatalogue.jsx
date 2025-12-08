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
import BackButton from "./components/BackButton";
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
                <BackButton to="/student/dashboard" />
                <PageHeader
                    title="Equipment Catalogue"
                    subtitle="Browse and request available IT equipment for your projects"
                />

                <Card className="mb-6 border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.25)] bg-white/95 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <Input
                                        placeholder="Search by name, brand, or description..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400"
                                    />
                                </div>
                                <Button type="submit" className="rounded-xl bg-[#0b69d4] hover:bg-[#0f7de5] text-white shadow-sm shadow-sky-200/50">
                                    Search
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                    onClick={() => navigate('/student/borrow-request?scan=true')}
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Scan QR
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-200 text-[#0b1d3a]">
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
                                    <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-slate-200 focus:ring-2 focus:ring-sky-200 text-[#0b1d3a]">
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
                                        className={`rounded-xl ${viewMode === 'grid'
                                            ? "bg-[#0b69d4] text-white shadow-sm shadow-sky-200/50"
                                            : "border-slate-200 text-[#0b1d3a] hover:border-sky-300 hover:bg-sky-50"
                                            }`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid3x3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="icon"
                                        className={`rounded-xl ${viewMode === 'list'
                                            ? "bg-[#0b69d4] text-white shadow-sm shadow-sky-200/50"
                                            : "border-slate-200 text-[#0b1d3a] hover:border-sky-300 hover:bg-sky-50"
                                            }`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mb-4 text-sm text-black">
                    Found {filteredEquipment.length} {filteredEquipment.length === 1 ? 'item' : 'items'}
                </div>

                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEquipment.map(equipment => (
                            <Card key={equipment.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white/95 hover:border-sky-200 hover:shadow-[0_18px_38px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between mb-2">
                                        <CategoryBadge category={equipment.category} />
                                        <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${equipment.available > 0
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-slate-100 text-slate-500 border-slate-200"
                                            }`}>
                                            {equipment.available > 0 ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-black">{equipment.name}</CardTitle>
                                    <CardDescription className="text-black">{equipment.brand} • {equipment.model}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <p className="text-sm text-black mb-4 line-clamp-2">
                                        {equipment.description}
                                    </p>
                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-black">Available:</span>
                                            <span className="font-semibold text-black">
                                                {equipment.available} / {equipment.total}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-black">
                                            <Package className="h-4 w-4 mr-2" />
                                            <span>{equipment.location}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                                onClick={() => handleViewDetails(equipment)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Details
                                            </Button>
                                            <Button
                                                className="flex-1 bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-bold rounded-xl shadow-sm shadow-sky-200/60 transition-all duration-300 disabled:bg-slate-300 disabled:shadow-none"
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
                            <Card key={equipment.id} className="border border-slate-200 rounded-2xl bg-white/95 hover:border-sky-200 hover:bg-sky-50 hover:shadow-[0_18px_38px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 mb-3">
                                                <CategoryBadge category={equipment.category} />
                                                <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-semibold ${equipment.available > 0
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                                    }`}>
                                                    {equipment.available > 0 ? 'Available' : 'Unavailable'}
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-bold text-black mb-1">
                                                {equipment.name}
                                            </h3>
                                            <p className="text-sm text-black mb-2">
                                                {equipment.brand} • {equipment.model}
                                            </p>
                                            <p className="text-sm text-black mb-3">
                                                {equipment.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center text-black">
                                                    <Package className="h-4 w-4 mr-2" />
                                                    <span>{equipment.location}</span>
                                                </div>
                                                <span className="text-black">
                                                    Available: <span className="font-semibold text-black">{equipment.available} / {equipment.total}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex sm:flex-col gap-2 sm:w-32">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-xl border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                                onClick={() => handleViewDetails(equipment)}
                                            >
                                                <Eye className="h-4 w-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Details</span>
                                            </Button>
                                            <Button
                                                className="flex-1 bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-bold rounded-xl shadow-sm shadow-sky-200/60 transition-all duration-300 disabled:bg-slate-300 disabled:shadow-none"
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
                    <Card className="border border-slate-200 rounded-2xl bg-white/95">
                        <CardContent className="py-12 text-center">
                            <div className="p-4 rounded-full bg-sky-50 w-20 h-20 mx-auto mb-4 flex items-center justify-center border border-sky-100">
                                <Package className="h-10 w-10 text-sky-700" />
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">
                                No equipment found
                            </h3>
                            <p className="text-black">
                                Try adjusting your search or filter criteria
                            </p>
                        </CardContent>
                    </Card>
                )}
            </PageContainer>
        </MainLayout>
    );
}

