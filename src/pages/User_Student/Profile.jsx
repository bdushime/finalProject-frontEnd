import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, GraduationCap, Camera, Save, Edit2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import { studentMockData, borrowHistory } from "./data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./components/StatusBadge";
import { CategoryBadge } from "./components/CategoryBadge";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [studentData, setStudentData] = useState(studentMockData.student);

    const handleInputChange = (field, value) => {
        setStudentData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Simulate saving
        console.log('Saving student data:', studentData);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <MainLayout>
            <PageContainer>
                <PageHeader
                    title="My Profile"
                    subtitle="View and manage your account information"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <Card className="border-gray-300">
                            <CardContent className="pt-6">
                                <div className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                                            {studentData.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        {isEditing && (
                                            <Button
                                                size="icon"
                                                className="absolute bottom-0 right-0 rounded-full"
                                                variant="outline"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {studentData.name}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">{studentData.email}</p>
                                    <Badge className="mt-2" variant="secondary">
                                        {studentData.department}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <GraduationCap className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Student ID</div>
                                            <div className="font-semibold">{studentData.studentId}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Year</div>
                                            <div className="font-semibold">{studentData.year}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-xs text-gray-500">Member Since</div>
                                            <div className="font-semibold">{formatDate(studentData.joinDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-gray-300">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>
                                            Update your personal details and contact information
                                        </CardDescription>
                                    </div>
                                    {!isEditing && (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="name"
                                                    value={studentData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={studentData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={studentData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input
                                                id="department"
                                                value={studentData.department}
                                                onChange={(e) => handleInputChange('department', e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setStudentData(studentMockData.student);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSave} className="bg-[#343264] hover:bg-[#2a2752] text-white">
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Borrowing History */}
                        <Card className="border-gray-300">
                            <CardHeader>
                                <CardTitle>Borrowing History</CardTitle>
                                <CardDescription>
                                    Your past equipment borrowing records
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {borrowHistory.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No borrowing history yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Equipment</TableHead>
                                                    <TableHead>Borrowed</TableHead>
                                                    <TableHead>Returned</TableHead>
                                                    <TableHead>Duration</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {borrowHistory.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <CategoryBadge category={item.category} />
                                                                <span className="font-medium">{item.equipmentName}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{formatDate(item.borrowedDate)}</TableCell>
                                                        <TableCell>{formatDate(item.returnedDate)}</TableCell>
                                                        <TableCell>{item.daysBorrowed} day(s)</TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={item.status} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContainer>
        </MainLayout>
    );
}

