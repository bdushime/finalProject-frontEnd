import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, MapPin, Calendar } from "lucide-react";
import { getEquipmentById } from "@/components/lib/equipmentData";
import { CategoryBadge } from "../components/CategoryBadge";
import PropTypes from "prop-types";

export default function BorrowRequestForm({ onSuccess }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const equipmentId = searchParams.get('equipmentId');
    const scanMode = searchParams.get('scan') === 'true';

    const [equipment, setEquipment] = useState(null);
    const [formData, setFormData] = useState({
        equipmentId: equipmentId || '',
        purpose: '',
        location: '',
        expectedReturnDate: '',
        notes: '',
    });
    const [isScanning, setIsScanning] = useState(scanMode);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (equipmentId) {
            const eq = getEquipmentById(equipmentId);
            setEquipment(eq);
            setFormData(prev => ({ ...prev, equipmentId: equipmentId }));
        }
    }, [equipmentId]);

    const handleScanQR = () => {
        setIsScanning(true);
        // Simulate QR code scanning
        setTimeout(() => {
            // Mock: Simulate scanning a QR code
            const mockScannedId = 'EQ-001';
            const scannedEquipment = getEquipmentById(mockScannedId);
            if (scannedEquipment) {
                setEquipment(scannedEquipment);
                setFormData(prev => ({ ...prev, equipmentId: mockScannedId }));
                setIsScanning(false);
            }
        }, 2000);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.equipmentId) {
            newErrors.equipmentId = 'Please select or scan equipment';
        }
        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Purpose is required';
        }
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!formData.expectedReturnDate) {
            newErrors.expectedReturnDate = 'Expected return date is required';
        } else {
            const returnDate = new Date(formData.expectedReturnDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (returnDate <= today) {
                newErrors.expectedReturnDate = 'Return date must be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Simulate API call
        console.log('Submitting borrow request:', formData);

        // Show success message
        if (onSuccess) {
            onSuccess(formData);
        } else {
            alert('Borrow request submitted successfully! You will be notified once it is reviewed.');
            navigate('/student/borrowed-items');
        }
    };

    const minDate = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            {isScanning ? (
                <Card className="border-gray-300">
                    <CardContent className="py-12 text-center">
                        <div className="mb-6">
                            <div className="relative w-64 h-64 mx-auto border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                <QrCode className="h-24 w-24 text-gray-400 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Scanning QR Code...</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Point your camera at the equipment QR code
                        </p>
                        <Button variant="outline" onClick={() => setIsScanning(false)}>
                            Cancel Scan
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {equipment && (
                        <Card className="border-gray-300">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <CategoryBadge category={equipment.category} />
                                        </div>
                                        <CardTitle>{equipment.name}</CardTitle>
                                        <CardDescription>{equipment.brand} • {equipment.model}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    )}

                    <Card className="border-gray-300">
                        <CardHeader>
                            <CardTitle>Borrow Request Form</CardTitle>
                            <CardDescription>
                                Fill in the details to request equipment borrowing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {!equipment && (
                                    <div className="space-y-2">
                                        <Label htmlFor="equipment">Select Equipment</Label>
                                        <div className="flex gap-2">
                                            <Select
                                                value={formData.equipmentId}
                                                onValueChange={(value) => {
                                                    handleInputChange('equipmentId', value);
                                                    const eq = getEquipmentById(value);
                                                    setEquipment(eq);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select equipment" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {/* This would be populated from available equipment */}
                                                    <SelectItem value="EQ-001">MacBook Pro 16"</SelectItem>
                                                    <SelectItem value="EQ-002">Dell XPS 15</SelectItem>
                                                    <SelectItem value="EQ-003">iPad Pro 12.9"</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleScanQR}
                                            >
                                                <QrCode className="h-4 w-4 mr-2" />
                                                Scan QR
                                            </Button>
                                        </div>
                                        {errors.equipmentId && (
                                            <p className="text-sm text-red-600">{errors.equipmentId}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="purpose">
                                        Purpose <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="purpose"
                                        placeholder="Describe the purpose of borrowing this equipment..."
                                        value={formData.purpose}
                                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                                        rows={4}
                                        className={errors.purpose ? 'border-red-500' : ''}
                                    />
                                    {errors.purpose && (
                                        <p className="text-sm text-red-600">{errors.purpose}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">
                                        Location/Pickup Location <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="location"
                                            placeholder="e.g., Building A, Room 101"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.location && (
                                        <p className="text-sm text-red-600">{errors.location}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expectedReturnDate">
                                        Expected Return Date <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="expectedReturnDate"
                                            type="date"
                                            min={minDate}
                                            max={maxDateStr}
                                            value={formData.expectedReturnDate}
                                            onChange={(e) => handleInputChange('expectedReturnDate', e.target.value)}
                                            className={`pl-10 ${errors.expectedReturnDate ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.expectedReturnDate && (
                                        <p className="text-sm text-red-600">{errors.expectedReturnDate}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Maximum borrowing period is 14 days
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any additional information..."
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/student/browse')}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#343264] hover:bg-[#2a2752] text-white"
                                    >
                                        Submit Request
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

BorrowRequestForm.propTypes = {
    onSuccess: PropTypes.func,
};

