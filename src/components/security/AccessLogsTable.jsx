import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, ArrowUpRight, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/utils/api";

const statusConfig = {
  Returned: { label: "Success", className: "bg-[#BEBEE0] text-[#1A2240] border-none rounded-full" },
  'Checked Out': { label: "Success", className: "bg-[#BEBEE0] text-[#1A2240] border-none rounded-full" },
  Overdue: { label: "Failed", className: "bg-red-500 text-white border-none rounded-full" },
  Pending: { label: "Pending", className: "bg-yellow-500 text-white border-none rounded-full" },
  'Pending Return': { label: "Pending", className: "bg-yellow-500 text-white border-none rounded-full" },
};

const actionConfig = {
  Checkout: { label: "Checkout", className: "bg-[#BEBEE0] text-[#1A2240] border-none rounded-full" },
  Return: { label: "Return", className: "bg-green-500 text-white border-none rounded-full" },
};

export default function AccessLogsTable() {
  const { t } = useTranslation(["security", "common"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  
  // Real Data State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch live data
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/transactions/security/access-logs');
        if (res.data && res.data.logs) {
          setLogs(res.data.logs);
        }
      } catch (err) {
        console.error("Failed to fetch access logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredData = useMemo(() => {
    return logs.filter((log) => {
      const searchStr = searchQuery.toLowerCase();
      const userName = log.user?.username || "";
      const equipmentName = log.equipment?.name || "";
      
      const matchesSearch =
        searchQuery === "" ||
        userName.toLowerCase().includes(searchStr) ||
        equipmentName.toLowerCase().includes(searchStr) ||
        (log._id || "").toLowerCase().includes(searchStr);

      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      
      const actionType = (log.status || '').includes('Return') ? 'Return' : 'Checkout';
      const matchesAction = actionFilter === "all" || actionType === actionFilter;

      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [logs, searchQuery, statusFilter, actionFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, actionFilter]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white rounded-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {t('accessLogs.title', 'Access Logs')}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                {t('accessLogs.subtitle', 'Recent equipment access activity')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[100px] h-9 border border-gray-300 rounded-lg shadow-sm bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#BEBEE0] text-gray-700 border-none">
                <SelectItem value="today">{t('accessLogs.filters.today', 'Today')}</SelectItem>
                <SelectItem value="week">{t('accessLogs.filters.week', 'This Week')}</SelectItem>
                <SelectItem value="month">{t('accessLogs.filters.month', 'This Month')}</SelectItem>
                <SelectItem value="all">{t('accessLogs.filters.allTime', 'All Time')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 border border-gray-300 rounded-lg shadow-sm bg-white">
              <Download className="h-4 w-4" />
              {t('common:actions.export', 'Export')}
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
              placeholder={t('accessLogs.filters.searchPlaceholder', 'Search logs...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-gray-300 rounded-lg shadow-sm bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border border-gray-300 rounded-lg shadow-sm bg-white">
                <SelectValue placeholder={t('accessLogs.filters.status', 'Status')} />
              </SelectTrigger>
              <SelectContent className="bg-[#BEBEE0] text-gray-700 border-none">
                <SelectItem value="all">{t('accessLogs.filters.allStatus', 'All Status')}</SelectItem>
                <SelectItem value="Checked Out">Checked Out</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px] border border-gray-300 rounded-lg shadow-sm bg-white">
                <SelectValue placeholder={t('accessLogs.filters.action', 'Action')} />
              </SelectTrigger>
              <SelectContent className="bg-[#BEBEE0] text-gray-700 border-none">
                <SelectItem value="all">{t('accessLogs.filters.allActions', 'All Actions')}</SelectItem>
                <SelectItem value="Checkout">{t('accessLogs.actions.checkout', 'Checkout')}</SelectItem>
                <SelectItem value="Return">{t('accessLogs.actions.return', 'Return')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#BEBEE0] hover:bg-[#BEBEE0]">
                <TableHead className="font-semibold text-white">{t('accessLogs.table.logId', 'Log ID')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.user', 'User')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.action', 'Action')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.equipment', 'Equipment')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.location', 'Location')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.timestamp', 'Timestamp')}</TableHead>
                <TableHead className="font-semibold text-white">{t('accessLogs.table.status', 'Status')}</TableHead>
                <TableHead className="font-semibold text-white"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1A2240]" />
                  </TableCell>
                </TableRow>
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {t('accessLogs.table.noLogs', 'No access logs found matching your filters.')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => {
                  const actionType = (log.status || '').includes('Return') ? 'Return' : 'Checkout';
                  
                  // 👇 BUG FIX: Capital 'P' in Pending and safe chaining
                  const conf = statusConfig[log.status] || statusConfig.Pending; 
                  
                  return (
                    <TableRow key={log._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-500 font-mono text-xs">
                        {(log._id || "").slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                              {getInitials(log.user?.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{log.user?.username || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{log.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border ${actionConfig[actionType]?.className || 'bg-gray-100 text-gray-800'}`}>
                          {actionConfig[actionType]?.label || actionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-800 font-medium">
                        {log.equipment?.name || 'Deleted'}
                        <div className="text-xs text-gray-400 font-mono font-normal">{log.equipment?.serialNumber}</div>
                      </TableCell>
                      <TableCell className="text-gray-600">{log.destination || 'Main Storage'}</TableCell>
                      <TableCell className="text-gray-600">{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border ${conf?.className || 'bg-gray-100 text-gray-800'}`}>
                          {conf?.label || log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-[#1A2240] hover:bg-[#0A1128] text-white">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-bold text-gray-700">{filteredData.length}</span> entries
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center px-2 text-sm font-medium text-gray-600">
                {currentPage} / {totalPages}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <Link to="/security/logs" className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-gray-400">
              <Eye className="h-4 w-4" />
              {t('accessLogs.viewAll', 'View All Logs')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}