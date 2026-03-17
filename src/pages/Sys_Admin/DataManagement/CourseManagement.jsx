import { useState, useEffect } from "react";
import AdminLayout from "@/pages/Sys_Admin/components/AdminLayout";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, BookOpen, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function CourseManagement() {
    const { t } = useTranslation(["admin", "common"]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingCourseId, setDeletingCourseId] = useState(null);
    const [deletingCourseName, setDeletingCourseName] = useState("");
    const [deletingCourseCode, setDeletingCourseCode] = useState("");
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    
    // New course state
    const [newCourseCode, setNewCourseCode] = useState("");
    const [newCourseName, setNewCourseName] = useState("");
    const [newCourseDescription, setNewCourseDescription] = useState("");
    
    const [submitting, setSubmitting] = useState(false);

    // Edit course state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editCourseCode, setEditCourseCode] = useState("");
    const [editCourseName, setEditCourseName] = useState("");
    const [editCourseDescription, setEditCourseDescription] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async () => {
        if (!newCourseCode.trim() || !newCourseName.trim()) {
            toast.error("Course code and name are required");
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/courses', {
                code: newCourseCode.toUpperCase(),
                name: newCourseName,
                description: newCourseDescription
            });
            toast.success("Course added successfully");
            setNewCourseCode("");
            setNewCourseName("");
            setNewCourseDescription("");
            setIsAddDialogOpen(false);
            loadCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error adding course");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (course) => {
        setEditingCourseId(course._id);
        setEditCourseCode(course.code);
        setEditCourseName(course.name);
        setEditCourseDescription(course.description || "");
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editCourseCode.trim() || !editCourseName.trim()) {
            toast.error("Course code and name are required");
            return;
        }
        setSavingEdit(true);
        try {
            await api.put(`/courses/${editingCourseId}`, {
                code: editCourseCode.toUpperCase(),
                name: editCourseName,
                description: editCourseDescription
            });
            toast.success("Course updated successfully");
            setIsEditDialogOpen(false);
            loadCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error updating course");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = (course) => {
        setDeletingCourseId(course._id);
        setDeletingCourseName(course.name || "");
        setDeletingCourseCode(course.code || "");
        setDeleteConfirmText("");
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingCourseId) return;
        setDeleting(true);
        try {
            await api.delete(`/courses/${deletingCourseId}`);
            toast.success("Course deleted successfully");
            setCourses(prev => prev.filter(course => course._id !== deletingCourseId));
            setIsDeleteDialogOpen(false);
            setDeletingCourseId(null);
            setDeletingCourseName("");
            setDeletingCourseCode("");
            setDeleteConfirmText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Error deleting course");
        } finally {
            setDeleting(false);
        }
    };

    const HeroContent = (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 px-2 pt-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Course Management</h1>
                <p className="text-gray-400">Manage all courses needed for the system</p>
            </div>
            <div className="mt-4 md:mt-0">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white shadow-lg rounded-xl px-6 py-5 flex items-center">
                            <Plus className="mr-2 h-5 w-5" /> Add New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white sm:max-w-[500px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-slate-800">Add New Course</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Enter the details of the new course below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-6">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="code" className="text-right font-semibold text-slate-700">
                                    Course Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={newCourseCode}
                                    onChange={(e) => setNewCourseCode(e.target.value)}
                                    placeholder="e.g. CS 101"
                                    className="col-span-3 rounded-lg border-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right font-semibold text-slate-700">
                                    Course Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={newCourseName}
                                    onChange={(e) => setNewCourseName(e.target.value)}
                                    placeholder="e.g. Intro to Computer Science"
                                    className="col-span-3 rounded-lg border-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="description" className="text-right font-semibold text-slate-700 mt-2">
                                    Description
                                </Label>
                                <textarea
                                    id="description"
                                    value={newCourseDescription}
                                    onChange={(e) => setNewCourseDescription(e.target.value)}
                                    placeholder="Optional description..."
                                    className="col-span-3 rounded-lg border border-slate-200 p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-[#8D8DC7]/20 focus:border-[#8D8DC7] text-sm"
                                ></textarea>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl border-slate-200 text-slate-600">Cancel</Button>
                            <Button onClick={handleAddCourse} disabled={submitting} className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white rounded-xl px-6">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {submitting ? "Saving..." : "Save Course"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Course Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="bg-white sm:max-w-[500px] rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-slate-800">Edit Course</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Modify the details of the course below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-6">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-code" className="text-right font-semibold text-slate-700">
                                    Course Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-code"
                                    value={editCourseCode}
                                    onChange={(e) => setEditCourseCode(e.target.value)}
                                    placeholder="e.g. CS 101"
                                    className="col-span-3 rounded-lg border-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right font-semibold text-slate-700">
                                    Course Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editCourseName}
                                    onChange={(e) => setEditCourseName(e.target.value)}
                                    placeholder="e.g. Intro to Computer Science"
                                    className="col-span-3 rounded-lg border-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="edit-description" className="text-right font-semibold text-slate-700 mt-2">
                                    Description
                                </Label>
                                <textarea
                                    id="edit-description"
                                    value={editCourseDescription}
                                    onChange={(e) => setEditCourseDescription(e.target.value)}
                                    placeholder="Optional description..."
                                    className="col-span-3 rounded-lg border border-slate-200 p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-[#8D8DC7]/20 focus:border-[#8D8DC7] text-sm"
                                ></textarea>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl border-slate-200 text-slate-600">Cancel</Button>
                            <Button onClick={handleSaveEdit} disabled={savingEdit} className="bg-[#8D8DC7] hover:bg-[#7b7bb5] text-white rounded-xl px-6">
                                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {savingEdit ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );

    return (
        <AdminLayout heroContent={HeroContent}>
            <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden p-6 mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                        <BookOpen className="w-6 h-6 text-slate-800" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">All Courses</h2>
                        <p className="text-sm text-slate-500">List of active courses in the system</p>
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-100">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="border-b border-slate-100">
                                <TableHead className=" text-slate-900 font-bold text-sm py-4 pl-6 uppercase tracking-wider">Course Code</TableHead>
                                <TableHead className=" text-slate-900 font-bold text-sm py-4 uppercase tracking-wider">Course Name</TableHead>
                                <TableHead className=" text-slate-900 font-bold text-sm py-4 uppercase tracking-wider">Description</TableHead>
                                <TableHead className=" text-slate-900 font-bold text-sm py-4 uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8D8DC7]" />
                                    </TableCell>
                                </TableRow>
                            ) : courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-64 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                                <BookOpen className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No courses available</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => (
                                    <TableRow key={course._id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors group">
                                        <TableCell className="py-5 pl-6">
                                            <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg border border-slate-200">
                                                {course.code}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-base">{course.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex flex-col">
                                                {course.description && <span className="text-sm text-slate-500 mt-1 line-clamp-1">{course.description}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 pr-6 gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-medium"
                                                onClick={() => handleEdit(course)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-medium"
                                                onClick={() => handleDelete(course)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setDeleteConfirmText("");
                }}
            >
                <DialogContent className="bg-white sm:max-w-[520px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">Delete course?</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            This action cannot be undone. This will permanently remove the course{" "}
                            <span className="font-semibold text-slate-800">
                                {deletingCourseCode ? `${deletingCourseCode} — ` : ""}
                                {deletingCourseName || "this course"}
                            </span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">
                            Type the course name to confirm
                        </Label>
                        <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="rounded-xl border-slate-200"
                            autoFocus
                        />
                    </div>

                    <DialogFooter className="sm:justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={deleting}
                            className="rounded-xl border-slate-200 text-slate-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={
                                deleting ||
                                !deletingCourseName ||
                                deleteConfirmText.trim() !== deletingCourseName.trim()
                            }
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
