import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Button } from "@components/ui/button";
import { Search, Download, ArrowUpRight, Eye } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Mock data - replace with actual API call
const mockAccessLogs = [
  {
    id: "LOG-001",
    timestamp: "Jan 21, 2025",
    user: "Alex Trie",
    userId: "STU001",
    email: "alex.trie@university.edu",
    action: "Checkout",
    equipment: "Projector 1",
    equipmentId: "EQ-001",
    location: "Room 108",
    status: "success",
    ipAddress: "192.168.1.100",
  },
  {
    id: "LOG-002",
    timestamp: "Jan 20, 2025",
    user: "Annette Black",
    userId: "STU002",
    email: "annette.black@university.edu",
    action: "Checkout",
    equipment: "Projector 2",
    equipmentId: "EQ-002",
    location: "Room 104",
    status: "success",
    ipAddress: "192.168.1.101",
  },
  {
    id: "LOG-003",
    timestamp: "Jan 19, 2025",
    user: "Jerome Bell",
    userId: "STU003",
    email: "jerome.bell@university.edu",
    action: "Return",
    equipment: "TV Remote 2",
    equipmentId: "EQ-003",
    location: "Room 101",
    status: "success",
    ipAddress: "192.168.1.102",
  },
  {
    id: "LOG-004",
    timestamp: "Jan 18, 2025",
    user: "Jenny Wilson",
    userId: "STU004",
    email: "jenny.wilson@university.edu",
    action: "Checkout",
    equipment: "Extension Cable 1",
    equipmentId: "EQ-004",
    location: "Room 308",
    status: "failed",
    ipAddress: "192.168.1.103",
  },
  {
    id: "LOG-005",
    timestamp: "Jan 17, 2025",
    user: "Promise Izere",
    userId: "STU005",
    email: "promise.izere@auca.ac.rw",
    action: "Overdue",
    equipment: "TV Remote 1",
    equipmentId: "EQ-005",
    location: "Room 205",
    status: "success",
    ipAddress: "192.168.1.104",
  },
];

const statusConfig = {
  success: { label: "Success", className: "bg-[#BEBEE0] text-[#1A2240] border-none rounded-full" },
  failed: { label: "Failed", className: "bg-red-500 text-white border-none rounded-full" },
  pending: { label: "Pending", className: "bg-yellow-500 text-white border-none rounded-full" },
  suspicious: { label: "Suspicious", className: "bg-[#1A2240] text-white border-none rounded-full" },
};

const actionConfig = {
  Checkout: { label: "Checkout", className: "bg-[#BEBEE0] text-[#1A2240] border-none rounded-full" },
  Return: { label: "Return", className: "bg-green-500 text-white border-none rounded-full" },
};

export default function AccessLogsTable({ data, loading = false }) {
  const { t } = useTranslation(["security", "common"]);
  const displayData = data && data.length > 0 ? data : (loading ? [] : mockAccessLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");

  const filteredData = useMemo(() => {
    return displayData.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      const matchesAction = actionFilter === "all" || log.action === actionFilter;

      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [displayData, searchQuery, statusFilter, actionFilter]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border border-gray-100 shadow-sm bg-white rounded-[2rem] overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 leading-none mb-2">
                {t('accessLogs.title')}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-slate-400">
                {t('accessLogs.subtitle')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter} >
              <SelectTrigger className="w-[120px] h-9 border border-slate-200 rounded-lg shadow-sm bg-white text-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-700 border border-slate-200">
                <SelectItem value="today">{t('accessLogs.filters.today')}</SelectItem>
                <SelectItem value="week">{t('accessLogs.filters.week')}</SelectItem>
                <SelectItem value="month">{t('accessLogs.filters.month')}</SelectItem>
                <SelectItem value="all">{t('accessLogs.filters.allTime')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 border-slate-200 rounded-lg shadow-sm bg-white text-slate-700">
              <Download className="h-4 w-4" />
              {t('common:actions.export')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('accessLogs.filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 rounded-lg shadow-sm bg-white transition-all focus:ring-2 focus:ring-[#8D8DC7]/20"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border border-slate-200 rounded-lg shadow-sm bg-white text-slate-700">
                <SelectValue placeholder={t('accessLogs.filters.status')} />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-700 border border-slate-200">
                <SelectItem value="all">{t('accessLogs.filters.allStatus')}</SelectItem>
                <SelectItem value="success">{t('accessLogs.status.success') || "Success"}</SelectItem>
                <SelectItem value="failed">{t('accessLogs.status.failed') || "Failed"}</SelectItem>
                <SelectItem value="pending">{t('accessLogs.status.pending') || "Pending"}</SelectItem>
                <SelectItem value="suspicious">{t('accessLogs.status.suspicious') || "Suspicious"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px] border border-slate-200 rounded-lg shadow-sm bg-white text-slate-700">
                <SelectValue placeholder={t('accessLogs.filters.action')} />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-700 border border-slate-200">
                <SelectItem value="all">{t('accessLogs.filters.allActions')}</SelectItem>
                <SelectItem value="Checkout">{t('accessLogs.actions.checkout')}</SelectItem>
                <SelectItem value="Return">{t('accessLogs.actions.return')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[1.5rem] border border-gray-50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-50">
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('accessLogs.table.logId')}</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('accessLogs.table.user')}</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('accessLogs.table.action')}</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('accessLogs.table.equipment')}</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('accessLogs.table.location')}</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('accessLogs.table.timestamp')}</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('accessLogs.table.status')}</TableHead>
                  <TableHead className="px-4 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-widest"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j} className="px-4 py-4">
                          <div className="h-4 bg-slate-100 rounded-md animate-pulse w-3/4"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-300 font-medium">
                      {t('accessLogs.table.noLogs')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((log) => (
                    <TableRow key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="px-4 py-4 font-bold text-slate-900 font-mono text-xs">
                        {log.id}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-slate-50 shadow-sm transition-transform group-hover:scale-105">
                            <AvatarFallback className="bg-slate-100 text-[#8D8DC7] text-[10px] font-black underline underline-offset-2">
                              {getInitials(log.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900 text-sm whitespace-nowrap">{log.user}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{log.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm ${actionConfig[log.action]?.className || "bg-gray-100 text-gray-800"}`}
                        >
                          {t(`accessLogs.actions.${actionConfig[log.action]?.label?.toLowerCase()}`) || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8D8DC7]"></div>
                          <span className="text-sm font-bold text-slate-700">{log.equipment}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-xs font-bold text-slate-500">{log.location}</TableCell>
                      <TableCell className="px-4 py-4 text-xs font-bold text-slate-400">{log.timestamp}</TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm ${statusConfig[log.status]?.className || statusConfig.pending.className}`}
                        >
                          {t(`accessLogs.status.${statusConfig[log.status]?.label?.toLowerCase() || log.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl bg-slate-900 hover:bg-[#8D8DC7] text-white shadow-lg shadow-slate-900/10 transition-all hover:-rotate-12 hover:scale-110"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <Link to="/security/logs" className="flex items-center gap-2 mt-6 p-4 justify-end border-t border-gray-50">
          <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:text-black hover:bg-slate-50 rounded-xl font-bold px-6">
            <Eye className="h-4 w-4" />
            {t('accessLogs.viewAll')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

AccessLogsTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
      equipment: PropTypes.string.isRequired,
      equipmentId: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      ipAddress: PropTypes.string.isRequired,
    })
  ),
};
