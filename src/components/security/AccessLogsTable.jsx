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

export default function AccessLogsTable({ data = mockAccessLogs }) {
  const { t } = useTranslation(["security", "common"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");

  const filteredData = useMemo(() => {
    return data.filter((log) => {
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
  }, [data, searchQuery, statusFilter, actionFilter]);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white rounded-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {t('accessLogs.title')}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                {t('accessLogs.subtitle')}
              </CardDescription>
            </div>

          </div>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter} >
              <SelectTrigger className="w-[100px] h-9 border border-gray-300 rounded-lg shadow-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#BEBEE0] text-gray-700 border-none">
                <SelectItem value="today">{t('accessLogs.filters.today')}</SelectItem>
                <SelectItem value="week">{t('accessLogs.filters.week')}</SelectItem>
                <SelectItem value="month">{t('accessLogs.filters.month')}</SelectItem>
                <SelectItem value="all">{t('accessLogs.filters.allTime')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 border border-gray-300 rounded-lg shadow-sm bg-white">
              <Download className="h-4 w-4" />
              {t('common:actions.export')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('accessLogs.filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-gray-300 rounded-lg shadow-sm bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border border-gray-300 rounded-lg shadow-sm bg-white">
                <SelectValue placeholder={t('accessLogs.filters.status')} />
              </SelectTrigger>
              <SelectContent className="bg-[#BEBEE0] text-gray-700 border-none">
                <SelectItem value="all">{t('accessLogs.filters.allStatus')}</SelectItem>
                <SelectItem value="success">{t('accessLogs.status.success')}</SelectItem>
                <SelectItem value="failed">{t('accessLogs.status.failed')}</SelectItem>
                <SelectItem value="pending">{t('accessLogs.status.pending')}</SelectItem>
                <SelectItem value="suspicious">{t('accessLogs.status.suspicious')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px] border border-gray-300 rounded-lg shadow-sm bg-white">
                <SelectValue placeholder={t('accessLogs.filters.action')} />
              </SelectTrigger>
              <SelectContent className="bg-[#BEBEE0] text-gray-700 border-none">
                <SelectItem value="all">{t('accessLogs.filters.allActions')}</SelectItem>
                <SelectItem value="Checkout">{t('accessLogs.actions.checkout')}</SelectItem>
                <SelectItem value="Return">{t('accessLogs.actions.return')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#BEBEE0] hover:bg-[#BEBEE0]">
                <TableHead className="font-semibold text-white">{t('accessLogs.table.logId')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.user')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.action')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.equipment')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.location')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.timestamp')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.status')}</TableHead>
                <TableHead className="font-semibold text-white"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {t('accessLogs.table.noLogs')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {log.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {getInitials(log.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{log.user}</div>
                          <div className="text-sm text-gray-500">{log.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border ${actionConfig[log.action]?.className || "bg-gray-100 text-gray-800"}`}
                      >
                        {t(`accessLogs.actions.${actionConfig[log.action]?.label?.toLowerCase()}`) || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{log.equipment}</TableCell>
                    <TableCell className="text-gray-600">{log.location}</TableCell>
                    <TableCell className="text-gray-600">{log.timestamp}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border ${statusConfig[log.status]?.className || statusConfig.pending.className}`}
                      >
                        {t(`accessLogs.status.${statusConfig[log.status]?.label?.toLowerCase() || log.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md bg-[#1A2240] hover:bg-[#0A1128] text-white"
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
        <Link to="/security/logs" className="flex items-center gap-2 mt-2 p-4 justify-end border-t border-gray-200 ">
          <Button variant="outline" size="sm" className="gap-2 border-gray-400">
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

