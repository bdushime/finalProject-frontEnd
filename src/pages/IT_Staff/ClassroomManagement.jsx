import { useState, useEffect } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Trash2, Monitor, MonitorOff, Plus, School } from "lucide-react";
import { getClassrooms, addClassroom, updateClassroom, deleteClassroom } from "@/utils/classroomStorage";
import { toast } from "sonner";

export default function ClassroomManagement() {
    const [classrooms, setClassrooms] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomHasScreen, setNewRoomHasScreen] = useState(false);

    useEffect(() => {
        loadClassrooms();
    }, []);

    const loadClassrooms = () => {
        setClassrooms(getClassrooms());
    };

    const handleAddClassroom = () => {
        if (!newRoomName.trim()) return;
        addClassroom({ name: newRoomName, hasScreen: newRoomHasScreen });
        setNewRoomName("");
        setNewRoomHasScreen(false);
        setIsAddDialogOpen(false);
        loadClassrooms();
        toast.success("Classroom added successfully");
    };

    const handleToggleScreen = (id, currentStatus) => {
        updateClassroom(id, { hasScreen: !currentStatus });
        loadClassrooms();
        toast.info("Classroom updated");
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this classroom?")) {
            deleteClassroom(id);
            loadClassrooms();
            toast.error("Classroom deleted");
        }
    };

    return (
        <ITStaffLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Classrooms</h1>
                        <p className="text-slate-500 mt-1">Manage room equipment and availability.</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#0b1d3a] hover:bg-[#1a2f55] text-white shadow-md rounded-lg px-6">
                                <Plus className="mr-2 h-4 w-4" /> Add Classroom
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Classroom</DialogTitle>
                                <DialogDescription>
                                    Add a classroom to the system and define its equipment.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Room Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        placeholder="e.g. Room 304"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="screen" className="text-right">
                                        Has Screen?
                                    </Label>
                                    <div className="flex items-center space-x-2 col-span-3">
                                        <Switch
                                            id="screen"
                                            checked={newRoomHasScreen}
                                            onCheckedChange={setNewRoomHasScreen}
                                        />
                                        <Label htmlFor="screen" className="font-normal text-slate-500">
                                            {newRoomHasScreen ? "Yes, TV/Screen installed" : "No screen available"}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddClassroom} className="bg-[#0b1d3a]">Save Classroom</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                                <TableHead className="w-[40%] text-slate-900 font-bold text-base py-4 pl-6">Classroom</TableHead>
                                <TableHead className="w-[30%] text-slate-900 font-bold text-base py-4">Equipment Status</TableHead>
                                <TableHead className="w-[30%] text-slate-900 font-bold text-base text-right py-4 pr-6">Quick Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classrooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-48 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <School className="h-8 w-8 text-slate-300 opacity-50" />
                                            <p>No classrooms found. Add one to get started.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classrooms.map((room) => (
                                    <TableRow key={room.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                                        <TableCell className="py-4 pl-6">
                                            <div className="font-bold text-lg text-slate-900">{room.name}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${room.hasScreen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {room.hasScreen ? <Monitor className="h-4 w-4" /> : <MonitorOff className="h-4 w-4" />}
                                                {room.hasScreen ? "Screen Installed" : "Standard Room"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-6">
                                                <Switch
                                                    checked={room.hasScreen}
                                                    onCheckedChange={() => handleToggleScreen(room.id, room.hasScreen)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(room.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </ITStaffLayout>
    );
}
