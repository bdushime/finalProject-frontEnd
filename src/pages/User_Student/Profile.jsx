import { useState, useEffect } from "react";
import StudentLayout from "@/components/layout/StudentLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, GraduationCap, Camera, Save, Edit2, ArrowRight, Hash } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common/Page";
import BackButton from "./components/BackButton";
import { Link } from "react-router-dom";
import { borrowHistory } from "./data/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./components/StatusBadge";
import CategoryBadge from "./components/CategoryBadge";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [studentData, setStudentData] = useState({
        name: "Student",
        email: "student@auca.ac.rw",
        department: "Information Technology",
        phone: "+250 788 888 888",
        studentId: "25000",
        year: "Year 3",
        joinDate: new Date().toISOString()
    });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setStudentData({
                    name: user.fullName || user.username || "Student",
                    email: user.email || "student@auca.ac.rw",
                    department: user.department || "Information Technology",
                    phone: user.phoneNumber || user.phone || "+250 788 888 888",
                    studentId: user.studentId || user.matricule || "25000",
                    year: user.year || user.level || "Year 3",
                    joinDate: user.createdAt || new Date().toISOString()
                });
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    const handleInputChange = (field, value) => {
        setStudentData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Here you would typically make an API call to update the user
        // await api.put('/users/profile', studentData);
        console.log('Saving student data:', studentData);

        // Update local storage to reflect changes immediately (optional, better to re-fetch)
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            const updatedUser = { ...user, phoneNumber: studentData.phone, email: studentData.email };
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setIsEditing(false);
        // Assuming a toast library exists or just alert
        // alert('Profile updated successfully!'); 
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <StudentLayout>
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
                                        <Hash className="h-4 w-4 text-[#0b1d3a]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Student ID</div>
                                        <div className="font-bold text-[#0b1d3a] text-sm">{studentData.studentId}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                                        <GraduationCap className="h-4 w-4 text-[#0b1d3a]" />
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
                                        {/* Full Name - Read Only */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="name"
                                                    value={studentData.name}
                                                    disabled={true}
                                                    className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Student ID - Read Only */}
                                        <div className="space-y-2">
                                            <Label htmlFor="studentId" className="text-sm font-semibold text-slate-700">Student ID</Label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="studentId"
                                                    value={studentData.studentId}
                                                    disabled={true}
                                                    className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Email - Editable */}
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
                                                    className={`pl-10 rounded-xl h-11 ${isEditing ? 'bg-white border-slate-200 focus-visible:ring-[#0b1d3a]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number - Editable */}
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
                                                    className={`pl-10 rounded-xl h-11 ${isEditing ? 'bg-white border-slate-200 focus-visible:ring-[#0b1d3a]' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Department - Read Only */}
                                        <div className="space-y-2">
                                            <Label htmlFor="department" className="text-sm font-semibold text-slate-700">Department</Label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="department"
                                                    value={studentData.department}
                                                    disabled={true}
                                                    className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        {/* Year - Read Only */}
                                        <div className="space-y-2">
                                            <Label htmlFor="year" className="text-sm font-semibold text-slate-700">Year</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="year"
                                                    value={studentData.year}
                                                    disabled={true}
                                                    className="pl-10 bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="flex gap-3 pt-2 justify-end border-t border-slate-100 mt-4">
                                            <Button
                                                variant="ghost"
                                                className="rounded-xl text-slate-500 hover:text-slate-700"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    // Re-load initial data to reset form
                                                    const userStr = localStorage.getItem("user");
                                                    if (userStr) {
                                                        const user = JSON.parse(userStr);
                                                        setStudentData(prev => ({
                                                            ...prev,
                                                            email: user.email || prev.email,
                                                            phone: user.phoneNumber || prev.phone
                                                        }));
                                                    }
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
                                <div className="text-center py-12 text-slate-400">
                                    <p>No recent activity.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        </StudentLayout>
    );
}
