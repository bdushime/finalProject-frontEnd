import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid3x3, List, Package, Eye, Loader2 } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/common/Page';
import CategoryBadge from '../User_Student/components/CategoryBadge';
import ITStaffLayout from '@/components/layout/ITStaffLayout';
import { useNavigate } from 'react-router-dom';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/common/PaginationControls';
import EquipmentDetailsDialog from './components/EquipmentDetailsDialog';
import api from '@/utils/api';

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
  const [page, setPage] = useState(1);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const pageSize = 9;

  // --- MAIN FETCH FUNCTION ---
  // Re-runs whenever filters (Category, ActiveSearch, Sort) change
  useEffect(() => {
    async function fetchEquipment() {
      setLoading(true);
      try {
        // Build Query Parameters
        const params = {
          search: activeSearch, // Only search when button is clicked (or enter pressed)
          category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
          // You can add sort params here if your backend supports it, 
          // otherwise we sort client-side below
        };

        const res = await api.get('/equipment/browse', { params });

        // Normalize Data
        let normalized = res.data.map((item) => ({
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
      } catch (e) {
        console.error('Failed to load IT equipment data', e);
      } finally {
        setLoading(false);
      }
    }

    fetchEquipment();
  }, [activeSearch, selectedCategory, sortBy]); // <--- Dependencies trigger fetch

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

  // Use pagination hook
  const {
    totalPages,
    currentPage,
    paginatedItems: currentEquipment,
  } = usePagination(equipment, page, pageSize);

  return (
    <ITStaffLayout>
      <div className="min-h-screen">
        <PageHeader title="Browse Equipment" />

        <Card className="mb-6 border-gray-300">
          <CardContent className="pt-6">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, brand, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full border-gray-300 shadow-sm"
                  />
                </div>
                <Button type="submit" className="rounded-full border-gray-300 shadow-sm">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px] rounded-full border-gray-300 shadow-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {STATIC_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px] rounded-full border-gray-300 shadow-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="availability">Availability</SelectItem>
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
            {loading ? "Searching..." : `Showing ${equipment.length} items`}
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
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentEquipment.map(item => (
              <Card
                key={item.id}
                className="flex flex-col border-gray-300 hover:shadow-lg hover:bg-gray-50 transition-all shadow-sm bg-background rounded-3xl cursor-pointer"
                onClick={() => {
                  setSelectedEquipment(item);
                  setDialogOpen(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CategoryBadge category={item.category} />
                    <Badge className={item.available > 0 ? 'bg-yellow-400 text-yellow-900 rounded-full' : 'bg-gray-200 text-gray-600 rounded-full'}>
                      {item.available > 0 ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                  <CardDescription className="text-xs font-mono">SN: {item.serialNumber || item.id.substring(0, 8)}</CardDescription>
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
                      Details
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
                          {item.available > 0 ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">SN: {item.serialNumber || item.id}</p>
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
                        <span className="hidden sm:inline">Details</span>
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
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-gray-900 mb-2">No equipment found</h3>
              <p className="text-gray-600">
                Try adjusting your search filters.
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