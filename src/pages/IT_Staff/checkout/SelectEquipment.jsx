import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // Assuming you have a badge component, or standard tailwind
import { equipmentData } from "@/components/lib/equipmentData";
import { Search, Filter, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

// Improved Progress Component with visual connectors
function Progress({ currentStep = 1 }) {
    const steps = [
        { id: 1, label: "Select" },
        { id: 2, label: "Scan" },
        { id: 3, label: "Photo" },
        { id: 4, label: "Details" },
        { id: 5, label: "Sign" },
        { id: 6, label: "Done" },
    ];

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 -z-10 transform -translate-y-1/2" />
                
                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center px-2">
                            <div 
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-200 
                                ${isActive ? ' bg-[#0b1d3a]/90 text-white' : 
                                  isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white text-gray-400'}`}
                            >
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{step.id}</span>}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function SelectEquipment() {
    const [selectedItems, setSelectedItems] = useState([]);

    const toggleSelection = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <MainLayout>
            <div className="">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-2">
                    
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Checkout Equipment</h1>
                        <p className="text-gray-500 mt-1">Select items from the inventory to proceed with borrowing.</p>
                    </div>

                    <Progress currentStep={1} />

                    {/* Main Content Area */}
                    <div className="space-y-2">
                        {/* Search and Filter Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                    placeholder="Search by name, brand, or tag..." 
                                    className="pl-10 bg-gray-50 border-gray-200" 
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" className="gap-2 text-gray-600 w-full sm:w-auto">
                                    <Filter className="h-4 w-4" /> Filters
                                </Button>
                            </div>
                        </div>

                        {/* Equipment Grid */}
                        <div className="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                            {equipmentData.slice(0, 6).map((e) => {
                                const isSelected = selectedItems.includes(e.id);
                                const isOutOfStock = e.available === 0;

                                return (
                                    <Card 
                                        key={e.id} 
                                        className={`group relative overflow-hidden rounded-3xl transition-all duration-200 hover:shadow-lg border
                                        ${isSelected ? 'ring ring-gray-200' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        {/* Image Area */}
                                        <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
                                            {/* Placeholder Image - replace with real img tag if available */}
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <div className="absolute top-3 right-3">
                                                {isOutOfStock ? (
                                                    <Badge variant="destructive" className="bg-red-500">Out of Stock</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-white/90 backdrop-blur text-green-700 font-medium shadow-sm">
                                                        {e.available} Available
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <CardContent className="p-5">
                                            <div className="mb-1 text-xs font-semibold text-blue-600 uppercase tracking-wide">{e.category || "Equipment"}</div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{e.name}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{e.brand} • {e.model}</p>
                                            
                                            <Button 
                                                className={`w-full transition-all ${isSelected ? 'bg-[#0b1d3a]/50 hover:bg-[#0b1d3a]/90' : ''}`}
                                                variant={isSelected ? "default" : "outline"}
                                                disabled={isOutOfStock}
                                                onClick={() => toggleSelection(e.id)}
                                            >
                                                {isSelected ? "Selected" : "Select Item"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="sticky bottom-4 z-10 flex justify-end">
                        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex gap-4 items-center">
                            <span className="text-sm text-gray-600 font-medium hidden sm:block">
                                {selectedItems.length} items selected
                            </span>
                            <Button size="lg" className="bg-[#0b1d3a] text-gray-300  hover:bg-[#0b1d3a]/50 hover:text-black shadow-lg">
                                Continue to Scan <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}