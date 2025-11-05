import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { Package, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { PageContainer, PageHeader } from '@components/common/Page';
import MainLayout from '@/components/layout/MainLayout';
import { CategoryBadge } from './components/CategoryBadge';
import { EquipmentCategory } from './enums/EquipmentCategort';
const borrowedEquipment = [
  {
    id: 'EQ-001',
    name: 'Dell Laptop XPS 15',
    category: EquipmentCategory.LAPTOP,
    borrowDate: '2025-10-28',
    dueDate: '2025-11-11',
    status: 'active',
  },
  {
    id: 'EQ-045',
    name: 'Logitech Webcam C920',
    category: EquipmentCategory.OTHER,
    borrowDate: '2025-10-30',
    dueDate: '2025-11-06',
    status: 'overdue',
  },
];

const requestHistory = [
  {
    id: 'REQ-123',
    equipment: 'iPad Pro 12.9"',
    requestDate: '2025-11-01',
    status: 'pending',
    dueDate: '2025-11-08',
  },
  {
    id: 'REQ-118',
    equipment: 'Canon DSLR Camera',
    requestDate: '2025-10-25',
    status: 'approved',
    dueDate: '2025-11-12',
  },
  {
    id: 'REQ-115',
    equipment: 'Wireless Microphone',
    requestDate: '2025-10-20',
    status: 'rejected',
    dueDate: '2025-11-15',
  },
  {
    id: 'REQ-110',
    equipment: 'HP Laptop',
    requestDate: '2025-10-15',
    status: 'completed',
    dueDate: '2025-11-20',
  },
];

  const availableEquipment = [
    {
      id: 'EQ-105',
      name: 'MacBook Pro 16"',
      category: EquipmentCategory.LAPTOP,
      available: 3,
      total: 10,
    },
    {
      id: 'EQ-210',
      name: 'iPad Air',
      category: EquipmentCategory.OTHER,
      available: 8,
      total: 15,
    },
    {
      id: 'EQ-340',
      name: 'Sony A7 III Camera',
      category: EquipmentCategory.OTHER,
      available: 2,
      total: 5,
    },
    {
      id: 'EQ-450',
      name: 'Portable Projector',
      category: EquipmentCategory.OTHER,
      available: 5,
      total: 8,
    },
  ];

const dashboardCards = [
  {
    title: "Active Borrowings",
    icon: Package,
    value: 2,
    description: "Equipment currently borrowed",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Pending Requests",
    icon: Clock,
    value: 5,
    description: "Awaiting approval from admin",
    color: "from-yellow-400 to-orange-500",
  },
  {
    title: "Returned Equipment",
    icon: CheckCircle2,
    value: 12,
    description: "Successfully returned items",
    color: "from-green-400 to-emerald-500",
  },
  {
    title: "Overdue Items",
    icon: XCircle,
    value: 1,
    description: "Equipment past due date",
    color: "from-red-500 to-pink-500",
  },
];

export function Dashboard() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string, className?: string }> = {
      active: {variant: 'default', text: 'Active', className: 'border bg-green-600 text-white rounded-[50px] px-2 py-1' },
      overdue: { variant: 'destructive', text: 'Overdue', className: 'border bg-red-600 text-white rounded-[50px] px-2 py-1' },
      pending: { variant: 'secondary', text: 'Pending', className: 'border bg-yellow-600 text-white rounded-[50px] px-2 py-1' },
      approved: { variant: 'default', text: 'Approved', className: 'border bg-green-600 text-white rounded-[50px] px-2 py-1' },
      rejected: { variant: 'destructive', text: 'Rejected', className: 'border bg-gray-600 text-white rounded-[50px] px-2 py-1' },
      completed: { variant: 'outline', text: 'Completed', className: 'border bg-green-600 text-white rounded-[50px] px-2 py-1' },
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>;
  };

  return (
    <MainLayout>
    <PageContainer>
      {/* Header */}
      <PageHeader 
      title="Welcome Back!" 
      subtitle="Manage your equipment borrowing and requests" 
      className="mb-8" />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
               <Card
                 key={index}
                 className={`bg-linear-to-r ${card.color} text-white shadow-lg rounded-2xl transition-transform transform hover:scale-105`}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold">{card.title}</CardTitle>
                  <Icon className="h-12 w-12 opacity-80" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                  <p className="text-sm opacity-90 mt-1">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* consider using a component for the tabs */}
        {/* Main Content */}
        <Tabs defaultValue="borrowed" className="space-y-4">
          <TabsList className="flex flex-wrap  justify-between items-center gap-2 p-2 overflow-x-auto">
            <TabsTrigger value="borrowed">My Borrowed Equipment</TabsTrigger>
            <TabsTrigger value="requests">Request History</TabsTrigger>
            <TabsTrigger value="available">Available Equipment</TabsTrigger>
          </TabsList>

          {/* Borrowed Equipment Tab */}
          <TabsContent value="borrowed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Currently Borrowed Equipment</CardTitle>
                <CardDescription>Equipment you currently have in your possession</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mx-2 sm:mx-0">
                <Table className="min-w-[640px] sm:min-w-0 border-separate border-spacing-y-2 border-spacing-x-0">
                  <TableHeader>
                    <TableRow className=''>
                      <TableHead className='text-center'>Equipment ID</TableHead>
                      <TableHead className='text-center'>Name</TableHead>
                      <TableHead className='text-center'>Category</TableHead>
                      <TableHead className='text-center'>Borrowed Date</TableHead>
                      <TableHead className='text-center'>Due Date</TableHead>
                      <TableHead className='text-center'>Status</TableHead>
                      <TableHead className='text-center'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className=''>
                    {borrowedEquipment.map((item) => (
                      <TableRow
                        key={item.id}
                        className='bg-white shadow-2xs rounded-xl border border-r border-gray-800 hover:shadow-md transition-all duration-200'
                        //   "border rounded-lg transition-all duration-200",
                        //   item.status === "overdue" && "bg-red-600 rounded-[50px]",
                        //   item.status === "active" && "bg-blue-50 dark:bg-blue-950",
                        //   item.status === "completed" && "bg-green-50 dark:bg-green-950"
                        // )}
                      >
                        <TableCell className='text-center border-l-2 border-gray-800'>{item.id}</TableCell>
                        <TableCell className='text-center'>{item.name}</TableCell>
                        <TableCell className='text-center'>{item.category}</TableCell>
                        <TableCell className='text-center'>{item.borrowDate}</TableCell>
                        <TableCell className='text-center'>{item.dueDate}</TableCell>
                        <TableCell className='text-center'>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className='text-center'>
                          <Button size="sm" variant="outline">
                            Return
                          </Button>
                        </TableCell>
                    </TableRow>
                    
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Request History Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Request History</CardTitle>
                <CardDescription>Your equipment borrowing requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                <Table className="min-w-[560px] sm:min-w-0 border-separate border-spacing-y-2 border-spacing-x-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestHistory.map((request) => (
                      <TableRow key={request.id} className='bg-white shadow-2xs rounded-xl border border-r border-gray-600 hover:shadow-md transition-all duration-200'>
                        <TableCell className='text-center border-l-2 border-gray-800'>{request.id}</TableCell>
                        <TableCell>{request.equipment}</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className='border border-gray-800 rounded-xl px-2 py-1'>View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Equipment Tab */}
          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Available Equipment</CardTitle>
                <CardDescription>Browse and request available equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableEquipment.map((equipment) => (
                    <Card key={equipment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{equipment.name}</CardTitle>
                            <CardDescription className="mt-1">{equipment.id}</CardDescription>
                          </div>
                          <CategoryBadge category={equipment.category} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 flex flex-col justify-center">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Available:</span>
                            <span className="text-gray-900">
                              {equipment.available} / {equipment.total}
                            </span>
                          </div>
                          <Button 
                            className="bg-indigo-600 text-white flex justify-center items-center" 
                            disabled={equipment.available === 0}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Request to Borrow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </PageContainer>
    </MainLayout>
  );
}
