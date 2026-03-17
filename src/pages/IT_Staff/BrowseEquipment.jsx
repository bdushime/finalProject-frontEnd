import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid3x3, List, Package, Eye, Loader2, RefreshCcw, WifiOff } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/common/Page';
import CategoryBadge from '../User_Student/components/CategoryBadge';
import ITStaffLayout from '@/components/layout/ITStaffLayout';
import { useNavigate } from 'react-router-dom';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/common/PaginationControls';
import EquipmentDetailsDialog from './components/EquipmentDetailsDialog';
import api from '@/utils/api';
import { useTranslation } from "react-i18next";

// Schema-defined categories to ensure dropdown always has options
const STATIC_CATEGORIES = ['All Categories', 'Laptop', 'Projector', 'Camera', 'Microphone', 'Tablet', 'Audio', 'Accessories', 'Other'];

// Helper to derive category if missing (fallback)
function deriveCategory(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('macbook') || lower.includes('laptop')) return 'Laptop';
  if (lower.includes('projector')) return 'Projector';
  if (lower.includes('camera')) return 'Camera';
  return 'Other';
}

export function BrowseEquipment({ onViewDetails, onCheckout, onSearch }) {
  const { t } = useTranslation(["itstaff", "common"]);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');     // What user types
  const [activeSearch, setActiveSearch] = useState('');   // What we actually search for (on button click)
  const [sortBy, setSortBy] = useState('name');

  // Data States
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [page, setPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(null);
  const [serverCurrentPage, setServerCurrentPage] = useState(1);
  const [serverTotalCount, setServerTotalCount] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const pageSize = 9;

  // --- MAIN FETCH FUNCTION ---
  // Re-runs whenever filters (Category, ActiveSearch, Sort) change
  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Build Query Parameters
      const params = {
        search: activeSearch, // Only search when button is clicked (or enter pressed)
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        page,
        limit: pageSize,
      };

      const res = await api.get('/equipment/browse', { params });
      const payload = res?.data;
      const items = Array.isArray(payload)
        ? payload
        : (payload?.items || payload?.data || payload?.results || []);

      const totalPagesFromServer =
        (typeof payload?.totalPages === "number" ? payload.totalPages : null) ??
        (typeof payload?.pages === "number" ? payload.pages : null) ??
        null;

      const currentPageFromServer =
        (typeof payload?.page === "number" ? payload.page : null) ??
        (typeof payload?.currentPage === "number" ? payload.currentPage : null) ??
        null;

      const totalCountFromServer =
        (typeof payload?.total === "number" ? payload.total : null) ??
        (typeof payload?.totalCount === "number" ? payload.totalCount : null) ??
        (typeof payload?.count === "number" ? payload.count : null) ??
        null;

      // Normalize Data
      let normalized = items.map((item) => ({
        id: item._id,
        name: item.name,
        category: item.type || deriveCategory(item.name),
        description: item.description || 'No description provided.',
        available: item.status === 'Available' ? 1 : 0,
        total: 1,
        condition: item.status === 'Available' ? 'online' : 'offline',
        location: item.location || "Main Storage",
        serialNumber: item.serialNumber,
        ...item
      }));

      // Client-side Sort (optional, if backend doesn't handle sort)
      normalized.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        if (sortBy === 'availability') return b.available - a.available;
        return 0;
      });

      setEquipment(normalized);
      setServerTotalPages(totalPagesFromServer);
      setServerCurrentPage(currentPageFromServer || page);
      setServerTotalCount(totalCountFromServer);
    } catch (e) {
      console.error('Failed to load IT equipment data', e);
      setLoadError(e?.response?.data?.message || e?.message || 'Failed to load equipment.');
      setEquipment([]);
      setServerTotalPages(null);
      setServerCurrentPage(page);
      setServerTotalCount(null);
    } finally {
      setLoading(false);
    }
  }, [activeSearch, selectedCategory, sortBy, page, pageSize]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]); // <--- Dependencies trigger fetch

  const isInitialLoad = useMemo(() => loading && equipment.length === 0 && !loadError, [loading, equipment.length, loadError]);

  const SkeletonCard = ({ variant = "grid" }) => (
    <Card className={variant === "grid"
      ? "flex flex-col border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm"
      : "p-6 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
    }>
      <CardContent className={variant === "grid" ? "p-0" : "p-0"}>
        <div className="animate-pulse">
          {variant === "grid" ? (
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="h-6 w-24 rounded-full bg-slate-100" />
                <div className="h-6 w-20 rounded-full bg-slate-100" />
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-100 mb-2" />
              <div className="h-3 w-1/2 rounded bg-slate-100 mb-5" />
              <div className="space-y-2 mb-5">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-11/12 rounded bg-slate-100" />
              </div>
              <div className="mt-auto space-y-3">
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-10 w-full rounded-full bg-slate-100" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-6 w-24 rounded-full bg-slate-100" />
                  <div className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
                <div className="h-5 w-2/3 rounded bg-slate-100 mb-2" />
                <div className="h-3 w-1/3 rounded bg-slate-100 mb-4" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
              </div>
              <div className="flex items-center">
                <div className="h-10 w-28 rounded-full bg-slate-100" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  SkeletonCard.propTypes = { variant: PropTypes.oneOf(["grid", "list"]) };

  // Handle "Enter" key or Search Button click
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery); // Triggers the useEffect above
    setPage(1); // Reset to page 1
  };

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeSearch, selectedCategory, sortBy]);

  const usingServerPagination = useMemo(
    () => typeof serverTotalPages === "number" && serverTotalPages > 0,
    [serverTotalPages]
  );

  // Client-side pagination fallback (if backend returns full array)
  const {
    totalPages: clientTotalPages,
    currentPage: clientCurrentPage,
    paginatedItems: clientCurrentEquipment,
  } = usePagination(equipment, page, pageSize);

  const totalPages = usingServerPagination ? serverTotalPages : clientTotalPages;
  const currentPage = usingServerPagination ? serverCurrentPage : clientCurrentPage;
  const currentEquipment = usingServerPagination ? equipment : clientCurrentEquipment;

  return (
    <ITStaffLayout>
      <div className="min-h-screen">
        <PageHeader title={t('equipment.title')} />

        <Card className="mb-6 border-gray-300 text-gray-800">
          <CardContent className="pt-6">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t('equipment.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-gray-800 rounded-full border-gray-300 shadow-sm"
                  />
                </div>
                <Button type="submit" className="rounded-full border-gray-300 shadow-sm">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('equipment.search')}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px] rounded-full border-gray-300 shadow-sm">
                    <SelectValue placeholder={t('equipment.category')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {STATIC_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'All Categories' ? t('equipment.categories.all') : t(`equipment.categories.${category.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px] rounded-full border-gray-300 shadow-sm">
                    <SelectValue placeholder={t('equipment.sortBy')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="name">{t('equipment.sortOptions.name')}</SelectItem>
                    <SelectItem value="category">{t('equipment.sortOptions.category')}</SelectItem>
                    <SelectItem value="availability">{t('equipment.sortOptions.availability')}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2 sm:ml-auto">
                  <Button
                    type="button"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-full border-gray-300 shadow-sm"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span>
            {loading
              ? t('equipment.searching')
              : t('equipment.showingItems', { count: serverTotalCount ?? equipment.length })}
          </span>
          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </div>

        {/* LOADING STATE */}
        {isInitialLoad ? (
          <div className="py-10">
            <div className="mb-6 rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#0b1d3a] text-white flex items-center justify-center shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#0b1d3a]">
                      {t("equipment.searching")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("equipment.fallbackHint", "Fetching available devices, locations, and categories…")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200">Tip</span>
                  <span>Use the search bar to find a serial number faster.</span>
                </div>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: pageSize }).map((_, idx) => (
                  <SkeletonCard key={idx} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: pageSize }).map((_, idx) => (
                  <SkeletonCard key={idx} variant="list" />
                ))}
              </div>
            )}
          </div>
        ) : loadError ? (
          <Card className="border border-rose-200 bg-rose-50/60 rounded-3xl">
            <CardContent className="py-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-rose-200 flex items-center justify-center mb-4">
                <WifiOff className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-[#0b1d3a] font-extrabold mb-2">
                {t("equipment.fallbackErrorTitle", "Couldn’t load devices")}
              </h3>
              <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6">
                {t("equipment.fallbackErrorBody", "Check your connection or try again. If this keeps happening, the server may be temporarily unavailable.")}
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  className="rounded-full bg-[#0b1d3a] hover:bg-[#1a2f55] text-white"
                  onClick={() => fetchEquipment()}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {t("equipment.retry", "Retry")}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-slate-300"
                  onClick={() => {
                    setActiveSearch("");
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                  }}
                >
                  {t("equipment.resetFilters", "Reset filters")}
                </Button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {t("equipment.fallbackErrorDetails", "Error")}: {String(loadError)}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentEquipment.map(item => (
              <Card
                key={item.id}
                className="flex flex-col text-gray-800 border-gray-300 hover:shadow-lg hover:bg-gray-50 transition-all shadow-sm bg-background rounded-3xl cursor-pointer"
                onClick={() => {
                  setSelectedEquipment(item);
                  setDialogOpen(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CategoryBadge category={item.category} />
                    <Badge className={item.status?.toLowerCase() === 'available' ? 'bg-yellow-400 text-yellow-900 rounded-full' : 'bg-gray-200 text-gray-600 rounded-full'}>
                      {item.status?.toLowerCase() === 'available' ? t('equipment.status.available') : t('equipment.status.unavailable')}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                  <CardDescription className="text-xs font-mono"><span className="text-xs font-semibold text-gray-500">{t('common:browseDevices.labels.sn')}:</span> {item.serialNumber || item.id.substring(0, 8)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center text-sm">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600 truncate">{item.location}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-[#0b1d3a] text-white rounded-full hover:bg-[#1a2f55]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEquipment(item);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('equipment.details')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentEquipment.map(item => (
              <Card key={item.id} className="p-6 border-none shadow-md bg-background rounded-xl">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <CategoryBadge category={item.category} />
                        <Badge className={item.available > 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'}>
                          {item.available > 0 ? t('equipment.status.available') : t('equipment.status.unavailable')}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2"><span className="text-xs font-semibold text-gray-500">{t('common:browseDevices.labels.sn')}:</span> {item.serialNumber || item.id}</p>
                      <div className="flex items-center gap-4 text-sm mt-2">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-600">{item.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        className="bg-[#343264] text-white hover:bg-[#2a2850]"
                        onClick={() => {
                          setSelectedEquipment(item);
                          setDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{t('equipment.details')}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && equipment.length === 0 && (
          <Card className="rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-3xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <Package className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-[#0b1d3a] font-extrabold mb-2">{t('equipment.noEquipment')}</h3>
              <p className="text-slate-600 max-w-xl mx-auto">
                {t('equipment.adjustFilters')}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  className="rounded-full bg-[#0b1d3a] hover:bg-[#1a2f55] text-white"
                  onClick={() => fetchEquipment()}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {t("equipment.refresh", "Refresh")}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-slate-300"
                  onClick={() => {
                    setActiveSearch("");
                    setSearchQuery("");
                    setSelectedCategory("All Categories");
                  }}
                >
                  {t("equipment.resetFilters", "Reset filters")}
                </Button>
              </div>
              <p className="mt-6 text-xs text-slate-500">
                {t("equipment.emptyHint", "Try searching by serial number or switch to another category.")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Equipment Details Dialog */}
        <EquipmentDetailsDialog
          equipment={selectedEquipment}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </ITStaffLayout>
  );
}

BrowseEquipment.propTypes = {
  onViewDetails: PropTypes.func,
  onCheckout: PropTypes.func,
  onSearch: PropTypes.func,
};

export default BrowseEquipment;