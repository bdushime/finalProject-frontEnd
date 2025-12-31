import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Search, Grid3x3, List, Package, Eye } from 'lucide-react';
import { PageContainer, PageHeader } from '@components/common/Page';
import CategoryBadge from '../User_Student/components/CategoryBadge';
import ITStaffLayout from '@/components/layout/ITStaffLayout';
import { useNavigate } from 'react-router-dom';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@components/common/PaginationControls';

// Simple helper to derive a category from the equipment name
function deriveCategory(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('thinkpad') || lower.includes('surface')) {
    return 'Laptop';
  }
  if (lower.includes('tablet') || lower.includes('ipad') || lower.includes('galaxy tab') || lower.includes('android tablet')) {
    return 'Tablet';
  }
  if (lower.includes('camera') || lower.includes('gopro')) {
    return 'Camera';
  }
  if (lower.includes('microphone') || lower.includes('speaker') || lower.includes('audio')) {
    return 'Audio';
  }
  if (lower.includes('projector')) {
    return 'Projector';
  }
  if (lower.includes('router') || lower.includes('switch') || lower.includes('access point')) {
    return 'Accessories';
  }
  return 'Other';
}

export function BrowseEquipment({ onViewDetails, onCheckout, onSearch }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [equipment, setEquipment] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  // Load equipment from trackers JSON so count always matches trackers
  useEffect(() => {
    async function loadEquipment() {
      try {
        const res = await fetch('/trackers.json');
        const trackers = await res.json();

        const normalized = trackers.map((t) => {
          const category = deriveCategory(t.equipment);
          return {
            id: t.id,
            name: t.equipment,
            category,
            description: 'Tracked device with IoT monitoring',
            available: t.status === 'online' ? 1 : 0,
            total: 1,
            condition: t.status === 'online' ? 'online' : 'offline',
            location: t.location,
          };
        });

        setEquipment(normalized);
      } catch (e) {
        console.error('Failed to load IT equipment data', e);
      }
    }
    loadEquipment();
  }, []);

  // Derive category list from loaded equipment (plus "All")
  const categories = useMemo(() => {
    const unique = new Set();
    equipment.forEach((item) => {
      if (item.category) unique.add(item.category);
    });
    return ['All Categories', ...Array.from(unique)];
  }, [equipment]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) onSearch(searchQuery);
    }
  };

  const filteredEquipment = equipment
    .filter(item =>
      (selectedCategory === 'All Categories' || item.category === selectedCategory) &&
      (searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'availability':
          return b.available - a.available;
        default:
          return 0;
      }
    });

  // Reset to first page when filters or view mode change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, sortBy, viewMode]);

  // Use pagination hook
  const {
    totalPages,
    currentPage,
    paginatedItems: currentEquipment,
  } = usePagination(filteredEquipment, page, pageSize);

  return (
    <ITStaffLayout>
      <div className="min-h-screen">
        <PageContainer>
          <PageHeader title="Browse Equipment" subtitle="Discover and borrow equipment for your projects" />

          <Card className="mb-6 border-gray-300">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search onSubmit={handleSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, brand, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-full border-gray-300 shadow-sm"
                    />
                  </div>
                  <Button type="submit" className="rounded-full border-gray-300 shadow-sm">Search</Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Select className="rounded-full border-gray-300 shadow-sm" value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-[200px] rounded-full border-gray-300 shadow-sm">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-none border-gray-300 shadow-sm">
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select className="rounded-full border-gray-300 shadow-sm" value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[200px] rounded-full border-gray-300 shadow-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="border-none border-gray-300 shadow-sm">
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="availability">Availability</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2 sm:ml-auto">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="rounded-full border-gray-300 shadow-sm"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
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

          <div className="mb-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span>
              Showing {currentEquipment.length} of {filteredEquipment.length} {filteredEquipment.length === 1 ? 'item' : 'items'}
            </span>
            {totalPages > 1 && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1">
              {currentEquipment.map(equipment => (
                <Card
                  key={equipment.id}
                  className="flex flex-col border-gray-300 hover:shadow-lg hover:bg-gray-100 transition-shadow shadow-sm bg-background rounded-3xl cursor-pointer"
                  onClick={() => {
                    setSelectedEquipment(equipment);
                    setDialogOpen(true);
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CategoryBadge category={equipment.category} />
                      <Badge className={equipment.available > 0 ? 'bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-500' : 'bg-gray-200 text-gray-600 rounded-full'}>
                        {equipment.available > 0 ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{equipment.name}</CardTitle>
                    <CardDescription>{equipment.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {equipment.description}
                    </p>
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="text-gray-900">
                          {equipment.available} / {equipment.total}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-gray-600">{equipment.location}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-[#0b1d3a] text-white rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEquipment(equipment);
                            setDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentEquipment.map(equipment => (
                <Card key={equipment.id} className="p-6 border-none shadow-lg bg-background rounded-lg">
                  <CardContent className="">
                    <div className="flex flex-col justify-between sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <CategoryBadge category={equipment.category} />
                          <Badge className={equipment.available > 0 ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-gray-200 text-gray-600'}>
                            {equipment.available > 0 ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <h3 className="text-gray-900 mb-1">{equipment.name}</h3>
                        {/* <p className="text-sm text-gray-600 mb-2">{equipment.id}</p> */}
                        {/* <p className="text-sm text-gray-600 mb-3">
                        {equipment.description}
                      </p> */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">{equipment.location}</span>
                          </div>
                          <span className="text-gray-600">
                            Available: {equipment.available} / {equipment.total}
                          </span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:w-32">
                        <Button
                          variant="outline"
                          className=" bg-[#343264] text-white"
                          onClick={() => {
                            setSelectedEquipment(equipment);
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

          {/* Pagination controls */}
          {filteredEquipment.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-6"
            />
          )}

          {filteredEquipment.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-gray-900 mb-2">No equipment found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          )}
        </PageContainer>

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


