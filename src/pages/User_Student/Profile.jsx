import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, GraduationCap, Camera, Save, Edit2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
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
                <BackButton to="/student/dashboard" />
                <PageHeader
                    title="My Profile"
                    subtitle="View and manage your account information"
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <Card className="border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.3)] bg-white/95 hover:border-sky-200 hover:shadow-[0_22px_42px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                            <CardContent className="pt-6">
                                <div className="text-center mb-6">
                                    <div className="relative inline-block mb-4">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0b69d4] to-[#0f7de5] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                            {studentData.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        {isEditing && (
                                            <Button
                                                size="icon"
                                                className="absolute bottom-0 right-0 rounded-full border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                                variant="outline"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#0b1d3a] mb-1">
                                        {studentData.name}
                                    </h2>
                                    <p className="text-slate-700">{studentData.email}</p>
                                    <Badge className="mt-2 rounded-full bg-sky-50 text-sky-700 border border-sky-200" variant="outline">
                                        {studentData.department}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-200 hover:bg-sky-50 transition-colors">
                                        <div className="p-2 rounded-lg bg-sky-100 border border-sky-200">
                                            <GraduationCap className="h-5 w-5 text-[#0b1d3a]" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-600 font-medium">Student ID</div>
                                            <div className="font-bold text-[#0b1d3a]">{studentData.studentId}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-200 hover:bg-sky-50 transition-colors">
                                        <div className="p-2 rounded-lg bg-sky-100 border border-sky-200">
                                            <Calendar className="h-5 w-5 text-[#0b1d3a]" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-600 font-medium">Year</div>
                                            <div className="font-bold text-[#0b1d3a]">{studentData.year}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-200 hover:bg-sky-50 transition-colors">
                                        <div className="p-2 rounded-lg bg-sky-100 border border-sky-200">
                                            <Calendar className="h-5 w-5 text-[#0b1d3a]" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-600 font-medium">Member Since</div>
                                            <div className="font-bold text-[#0b1d3a]">{formatDate(studentData.joinDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.3)] bg-white/95 hover:border-sky-200 hover:shadow-[0_22px_42px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="font-bold text-[#0b1d3a]">Personal Information</CardTitle>
                                        <CardDescription className="text-slate-600">
                                            Update your personal details and contact information
                                        </CardDescription>
                                    </div>
                                    {!isEditing && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-lg border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                            onClick={() => setIsEditing(true)}
                                        >
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
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    id="name"
                                                    value={studentData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400 disabled:bg-slate-50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={studentData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400 disabled:bg-slate-50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={studentData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400 disabled:bg-slate-50"
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
                                                className="bg-white border border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-300 text-[#0b1d3a] placeholder:text-slate-400 disabled:bg-slate-50"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                variant="outline"
                                                className="rounded-lg border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-[#0b1d3a]"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setStudentData(studentMockData.student);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSave} className="bg-[#0b69d4] hover:bg-[#0f7de5] text-white font-bold rounded-xl shadow-sm shadow-sky-200/60 transition-all duration-300">
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Borrowing History */}
                        <Card className="border border-slate-200 rounded-2xl shadow-[0_16px_38px_-22px_rgba(8,47,73,0.3)] bg-white/95 hover:border-sky-200 hover:shadow-[0_22px_42px_-22px_rgba(8,47,73,0.35)] transition-all duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="font-bold text-[#0b1d3a]">Borrowing History</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Your past equipment borrowing records
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {borrowHistory.length === 0 ? (
                                    <div className="text-center py-8 text-slate-600">
                                        <p>No borrowing history yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="font-bold text-[#0b1d3a]">Equipment</TableHead>
                                                    <TableHead className="font-bold text-[#0b1d3a]">Borrowed</TableHead>
                                                    <TableHead className="font-bold text-[#0b1d3a]">Returned</TableHead>
                                                    <TableHead className="font-bold text-[#0b1d3a]">Duration</TableHead>
                                                    <TableHead className="font-bold text-[#0b1d3a]">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {borrowHistory.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-sky-50 transition-colors">
                                                        <TableCell className="text-[#0b1d3a]">
                                                            <div className="flex items-center gap-2">
                                                                <CategoryBadge category={item.category} />
                                                                <span className="font-medium text-[#0b1d3a]">{item.equipmentName}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-700">{formatDate(item.borrowedDate)}</TableCell>
                                                        <TableCell className="text-slate-700">{formatDate(item.returnedDate)}</TableCell>
                                                        <TableCell className="text-slate-700">{item.daysBorrowed} day(s)</TableCell>
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

