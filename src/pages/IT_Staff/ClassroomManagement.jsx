import { useState, useEffect } from "react";
import ITStaffLayout from "@/components/layout/ITStaffLayout";
import api from "@/utils/api";
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
import { Trash2, Monitor, MonitorOff, Plus, School, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function ClassroomManagement() {
    const { t } = useTranslation(["itstaff", "common"]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomHasScreen, setNewRoomHasScreen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadClassrooms();
    }, []);

    const loadClassrooms = async () => {
        try {
            const res = await api.get('/classrooms');
            setClassrooms(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load classrooms");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClassroom = async () => {
        if (!newRoomName.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/classrooms', {
                name: newRoomName,
                hasScreen: newRoomHasScreen
            });
            toast.success(t('classrooms.messages.addSuccess'));
            setNewRoomName("");
            setNewRoomHasScreen(false);
            setIsAddDialogOpen(false);
            loadClassrooms();
        } catch (err) {
            toast.error(err.response?.data?.message || t('classrooms.messages.addError'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleScreen = async (id, currentStatus) => {
        setClassrooms(prev => prev.map(room =>
            room._id === id ? { ...room, hasScreen: !currentStatus } : room
        ));

        try {
            await api.put(`/classrooms/${id}`, { hasScreen: !currentStatus });
            toast.success(t('classrooms.messages.updateSuccess'));
        } catch (err) {
            toast.error(t('classrooms.messages.updateError'));
            loadClassrooms(); // Revert
        }
    };

    const handleDelete = async (id) => {
        if (confirm(t('classrooms.messages.confirmDelete'))) {
            try {
                await api.delete(`/classrooms/${id}`);
                toast.success(t('classrooms.messages.deleteSuccess'));
                setClassrooms(prev => prev.filter(room => room._id !== id));
            } catch (err) {
                toast.error(t('classrooms.messages.deleteError'));
            }
        }
    };

    return (
        <ITStaffLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('classrooms.pageTitle')}</h1>
                        <p className="text-slate-500 mt-1">{t('classrooms.description')}</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#0b1d3a] hover:bg-[#1a2f55] text-white shadow-md rounded-lg px-6">
                                <Plus className="mr-2 h-4 w-4" /> {t('classrooms.addClassroom')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{t('classrooms.addNewTitle')}</DialogTitle>
                                <DialogDescription>
                                    {t('classrooms.addNewDesc')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        {t('classrooms.roomName')}
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        placeholder={t('classrooms.roomNamePlaceholder')}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="screen" className="text-right">
                                        {t('classrooms.hasScreen')}
                                    </Label>
                                    <div className="flex items-center space-x-2 col-span-3">
                                        <Switch
                                            id="screen"
                                            checked={newRoomHasScreen}
                                            onCheckedChange={setNewRoomHasScreen}
                                        />
                                        <Label htmlFor="screen" className="font-normal text-slate-500">
                                            {newRoomHasScreen ? t('classrooms.screenYes') : t('classrooms.screenNo')}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('classrooms.cancel')}</Button>
                                <Button onClick={handleAddClassroom} disabled={submitting} className="bg-[#0b1d3a]">
                                    {submitting ? t('classrooms.saving') : t('classrooms.save')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                                <TableHead className="w-[40%] text-slate-900 font-bold text-base py-4 pl-6">{t('classrooms.table.classroom')}</TableHead>
                                <TableHead className="w-[30%] text-slate-900 font-bold text-base py-4">{t('classrooms.table.equipStatus')}</TableHead>
                                <TableHead className="w-[30%] text-slate-900 font-bold text-base text-right py-4 pr-6">{t('classrooms.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-48 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /></TableCell>
                                </TableRow>
                            ) : classrooms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-48 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <School className="h-8 w-8 text-slate-300 opacity-50" />
                                            <p>{t('classrooms.table.noClassrooms')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                classrooms.map((room) => (
                                    <TableRow key={room._id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                                        <TableCell className="py-4 pl-6">
                                            <div className="font-bold text-lg text-slate-900">{room.name}</div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${room.hasScreen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {room.hasScreen ? <Monitor className="h-4 w-4" /> : <MonitorOff className="h-4 w-4" />}
                                                {room.hasScreen ? t('classrooms.table.screenInstalled') : t('classrooms.table.standardRoom')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-6">
                                                <Switch
                                                    checked={room.hasScreen}
                                                    onCheckedChange={() => handleToggleScreen(room._id, room.hasScreen)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(room._id)}
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

