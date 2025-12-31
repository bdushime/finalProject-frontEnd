import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, GraduationCap, Camera, Save, Edit2, ArrowRight } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { Link } from "react-router-dom";
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
                <div className="flex items-center justify-between mb-2">
                    <BackButton to="/student/dashboard" />
                </div>
                <PageHeader
                    title="My Profile"
                    subtitle="View and manage your account information."
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 pb-6 text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0b69d4] to-[#0f7de5] flex items-center justify-center text-white text-4xl font-bold shadow-lg mx-auto">
                                        {studentData.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {isEditing && (
                                        <Button
                                            size="icon"
                                            className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm"
                                            variant="ghost"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-[#0b1d3a] mb-1">
                                    {studentData.name}
                                </h2>
                                <p className="text-slate-500 font-medium mb-3">{studentData.email}</p>
                                <Badge className="rounded-full bg-sky-50 text-sky-700 border-sky-100 px-3 py-1 text-xs" variant="outline">
                                    {studentData.department}
                                </Badge>
                            </div>

                            <div className="p-6 pt-0 space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                                        <GraduationCap className="h-4 w-4 text-[#0b1d3a]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Student ID</div>
                                        <div className="font-bold text-[#0b1d3a] text-sm">{studentData.studentId}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                                        <Calendar className="h-4 w-4 text-[#0b1d3a]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Year</div>
                                        <div className="font-bold text-[#0b1d3a] text-sm">{studentData.year}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                                        <Calendar className="h-4 w-4 text-[#0b1d3a]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Member Since</div>
                                        <div className="font-bold text-[#0b1d3a] text-sm">{formatDate(studentData.joinDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="font-bold text-lg text-[#0b1d3a]">Personal Information</h3>
                                    <p className="text-sm text-slate-500">Update your personal details.</p>
                                </div>
                                {!isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-slate-200 hover:bg-slate-50 text-[#0b1d3a] h-9"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit2 className="h-3.5 w-3.5 mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="name"
                                                    value={studentData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-white border-slate-200 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-[#0b1d3a] disabled:bg-slate-50 disabled:text-slate-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={studentData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-white border-slate-200 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-[#0b1d3a] disabled:bg-slate-50 disabled:text-slate-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={studentData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10 bg-white border-slate-200 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-[#0b1d3a] disabled:bg-slate-50 disabled:text-slate-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department" className="text-sm font-semibold text-slate-700">Department</Label>
                                            <Input
                                                id="department"
                                                value={studentData.department}
                                                onChange={(e) => handleInputChange('department', e.target.value)}
                                                disabled={!isEditing}
                                                className="bg-white border-slate-200 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-[#0b1d3a] disabled:bg-slate-50 disabled:text-slate-500"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-3 pt-2 justify-end border-t border-slate-100 mt-4">
                                            <Button
                                                variant="ghost"
                                                className="rounded-xl text-slate-500 hover:text-slate-700"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setStudentData(studentMockData.student);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSave} className="bg-[#0b1d3a] hover:bg-[#126dd5] text-white font-bold rounded-xl h-10 shadow-sm px-6">
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Borrowing History Preview */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="font-bold text-lg text-[#0b1d3a]">Recent Activity</h3>
                                    <p className="text-sm text-slate-500">Your latest borrowing history.</p>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-slate-200 hover:bg-white text-slate-600 h-9 group"
                                >
                                    <Link to="/student/report">
                                        View Full Report
                                        <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="p-0">
                                {borrowHistory.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <p>No recent activity.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                                                    <TableHead className="font-bold text-slate-500 pl-6 h-12">Equipment</TableHead>
                                                    <TableHead className="font-bold text-slate-500 h-12">Date</TableHead>
                                                    <TableHead className="font-bold text-slate-500 h-12">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {borrowHistory.slice(0, 3).map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-slate-50 border-slate-50">
                                                        <TableCell className="pl-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <CategoryBadge category={item.category} />
                                                                <span className="font-medium text-[#0b1d3a]">{item.equipmentName}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600 font-medium text-sm">
                                                            {formatDate(item.borrowedDate)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={item.status} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                            {borrowHistory.length > 3 && (
                                <div className="p-3 border-t border-slate-50 bg-slate-50/30 text-center">
                                    <Link to="/student/report" className="text-xs font-bold text-[#0b1d3a] hover:underline">
                                        View all {borrowHistory.length} transactions
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageContainer>
        </MainLayout>
    );
}
