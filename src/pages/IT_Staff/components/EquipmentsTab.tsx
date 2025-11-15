import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

// Suppose these come from props, context, or hooks
import { borrowedEquipment, requestHistory, availableEquipment } from "@/components/lib/equipmentData";
import { getStatusBadge } from "@/utils/helpers";

export const EquipmentTabs = (
  <Tabs defaultValue="borrowed" className="space-y-4">
    <TabsList className="flex flex-wrap gap-2 p-1 overflow-x-auto">
      <TabsTrigger value="borrowed">My Borrowed Equipment</TabsTrigger>
      <TabsTrigger value="requests">Request History</TabsTrigger>
      <TabsTrigger value="available">Available Equipment</TabsTrigger>
    </TabsList>

    {/* Borrowed Equipment Tab */}
    <TabsContent value="borrowed" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Currently Borrowed Equipment</CardTitle>
          <CardDescription>Equipment you currently have in your possession</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table className="min-w-[640px] sm:min-w-0">
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Borrowed Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowedEquipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.borrowDate}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Return</Button>
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
            <Table className="min-w-[560px] sm:min-w-0">
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
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.equipment}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">View Details</Button>
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
                    <Badge variant="outline">{equipment.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="text-gray-900">
                        {equipment.available} / {equipment.total}
                      </span>
                    </div>
                    <Button 
                      className="w-full" 
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
);
