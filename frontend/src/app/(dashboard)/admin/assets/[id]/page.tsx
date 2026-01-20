// src/app/(dashboard)/admin/assets/[id]/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  HardDrive, 
  Pencil, 
  MapPin, 
  Calendar,
  AlertCircle,
  Loader2,
  Trash2,
  Building2,
  Ticket,
  Clock,
  Shield,
  Activity,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface Asset {
  id: number;
  machineId: string;
  model: string | null;
  serialNo: string | null;
  purchaseDate: string | null;
  warrantyStart: string | null;
  warrantyEnd: string | null;
  amcEnd: string | null;
  location: string | null;
  status: string;
  customer: {
    id: number;
    companyName: string;
  };
  tickets: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    assignedTo: {
      id: number;
      email: string;
      name: string | null;
    } | null;
  }>;
  serviceHistory: Array<{
    id: number;
    serviceType: string;
    description: string;
    performedAt: string;
    duration: number | null;
    notes: string | null;
    performedBy: {
      id: number;
      email: string;
      name: string | null;
    };
    ticket: {
      id: number;
      title: string;
    };
  }>;
  _count: {
    tickets: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AssetDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadAsset = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assets/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Get the response text first to see what we're dealing with
      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        throw new Error('Invalid response from server');
      }
      
      // Handle 304 Not Modified
      if (response.status === 304) {
        if (!data) {
          // If no data in 304 response, try a fresh request without cache
          return loadAsset();
        }
        setAsset(data);
        return;
      }
      
      // Handle other status codes
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Asset not found');
        }
        throw new Error(data?.message || 'Failed to load asset details');
      }
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      setAsset(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load asset details',
        variant: 'destructive',
      });
      router.push('/admin/assets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    
    try {
      setDeleting(true);
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete asset');
      }
      
      toast({
        title: 'Success',
        description: `Asset ${asset.machineId} has been deleted successfully`,
      });
      
      router.push(`/admin/customers/${asset.customer.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete asset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAsset();
    }
  }, [id]);

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[#A2B9AF]/20 text-[#4F6A64]';
      case 'MAINTENANCE':
        return 'bg-[#CE9F6B]/20 text-[#976E44]';
      case 'INACTIVE':
        return 'bg-[#AEBFC3]/20 text-[#546A7A]';
      default:
        return 'bg-[#E17F70]/20 text-[#75242D]';
    }
  };

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#E17F70]/20 text-[#75242D]';
      case 'HIGH':
        return 'bg-[#CE9F6B]/20 text-[#976E44]';
      case 'MEDIUM':
        return 'bg-[#CE9F6B]/20 text-[#976E44]';
      case 'LOW':
        return 'bg-[#A2B9AF]/20 text-[#4F6A64]';
      default:
        return 'bg-[#AEBFC3]/20 text-[#546A7A]';
    }
  };

  const getTicketStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-[#96AEC2]/20 text-[#546A7A]';
      case 'IN_PROGRESS':
        return 'bg-[#CE9F6B]/20 text-[#976E44]';
      case 'CLOSED':
        return 'bg-[#A2B9AF]/20 text-[#4F6A64]';
      case 'CANCELLED':
        return 'bg-[#AEBFC3]/20 text-[#546A7A]';
      default:
        return 'bg-[#AEBFC3]/20 text-[#546A7A]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading asset details...</span>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">Asset not found</h3>
        <p className="mt-1 text-muted-foreground">The asset you're looking for doesn't exist or was deleted.</p>
        <Button className="mt-4" onClick={() => router.push('/admin/assets')}>
          Back to Assets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <Button 
            variant="ghost" 
            onClick={() => {
              // Redirect back to customer assets page for better navigation flow
              if (asset?.customer?.id) {
                router.push(`/admin/customers/${asset.customer.id}/assets`);
              } else {
                router.push('/admin/assets'); // Fallback to general assets page
              }
            }} 
            className="p-2 flex-shrink-0"
            title="Back to Customer Assets"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-[#546A7A] truncate">{asset.machineId}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Asset Details • ID: {asset.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/assets/${id}/edit`)}
            className="bg-white hover:bg-[#AEBFC3]/10 flex-1 sm:flex-none"
          >
            <Pencil className="mr-2 h-4 w-4" /> 
            <span className="hidden sm:inline">Edit</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
            className="bg-[#9E3B47] hover:bg-[#75242D] flex-1 sm:flex-none"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Deleting...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
                <span className="sm:hidden">Del</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={`rounded-lg border p-4 ${asset.status === 'ACTIVE' ? 'bg-[#A2B9AF]/10 border-[#A2B9AF]' : asset.status === 'MAINTENANCE' ? 'bg-[#EEC1BF]/10 border-[#CE9F6B]' : 'bg-[#AEBFC3]/10 border-[#92A2A5]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${asset.status === 'ACTIVE' ? 'bg-[#A2B9AF]/20' : asset.status === 'MAINTENANCE' ? 'bg-[#CE9F6B]/20' : 'bg-[#AEBFC3]/20'}`}>
              <Activity className={`h-5 w-5 ${asset.status === 'ACTIVE' ? 'text-[#4F6A64]' : asset.status === 'MAINTENANCE' ? 'text-[#976E44]' : 'text-[#5D6E73]'}`} />
            </div>
            <div>
              <h3 className="font-medium text-[#546A7A]">
                Asset Status: {asset.status}
              </h3>
              <p className="text-sm text-muted-foreground">
                {asset.status === 'ACTIVE' ? 'This asset is currently active and operational' : 
                 asset.status === 'MAINTENANCE' ? 'This asset is under maintenance' : 
                 'This asset is inactive'}
              </p>
            </div>
          </div>
          <Badge className={getStatusBadgeStyles(asset.status)} variant="outline">
            {asset.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Asset Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] shadow-sm">
                    <HardDrive className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#546A7A]">{asset.machineId}</CardTitle>
                    <CardDescription className="mt-1 flex items-center text-base">
                      <Building2 className="h-4 w-4 mr-1" />
                      <Link 
                        href={`/admin/customers/${asset.customer.id}`}
                        className="hover:underline hover:text-[#546A7A]"
                      >
                        {asset.customer.companyName}
                      </Link>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <div className="space-y-6">
                  <div className="bg-[#AEBFC3]/10 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#5D6E73] mb-3 flex items-center">
                      <HardDrive className="h-4 w-4 mr-2 text-[#546A7A]" />
                      Asset Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#5D6E73]">Machine ID:</span>
                        <span className="font-medium text-[#546A7A]">{asset.machineId}</span>
                      </div>
                      {asset.model && (
                        <div className="flex justify-between">
                          <span className="text-[#5D6E73]">Model:</span>
                          <span className="font-medium text-[#546A7A]">{asset.model}</span>
                        </div>
                      )}
                      {asset.serialNo && (
                        <div className="flex justify-between">
                          <span className="text-[#5D6E73]">Serial Number:</span>
                          <span className="font-medium text-[#546A7A]">{asset.serialNo}</span>
                        </div>
                      )}
                      {asset.location && (
                        <div className="flex justify-between">
                          <span className="text-[#5D6E73]">Location:</span>
                          <span className="font-medium text-[#546A7A]">{asset.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#5D6E73]">Status:</span>
                        <Badge className={getStatusBadgeStyles(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#A2B9AF]/10 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-[#5D6E73] mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#4F6A64]" />
                      Dates & Warranty
                    </h3>
                    <div className="space-y-3 text-sm">
                      {asset.purchaseDate && (
                        <div className="flex justify-between">
                          <span className="text-[#5D6E73]">Purchase Date:</span>
                          <span className="font-medium text-[#546A7A]">{format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {asset.warrantyStart && (
                        <div className="flex justify-between">
                          <span className="text-[#5D6E73]">Warranty Start:</span>
                          <span className="font-medium text-[#546A7A]">{format(new Date(asset.warrantyStart), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {asset.warrantyEnd && (
                        <div className="flex justify-between">
                          <span className="text-[#5D6E73]">Warranty End:</span>
                          <span className="font-medium text-[#546A7A]">{format(new Date(asset.warrantyEnd), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {asset.amcEnd && (
                        <div className="flex justify-between">
                          <span className="text-[#5D6E73]">AMC End:</span>
                          <span className="font-medium text-[#546A7A]">{format(new Date(asset.amcEnd), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#5D6E73]">Created:</span>
                        <span className="font-medium text-[#546A7A]">{format(new Date(asset.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5D6E73]">Last Updated:</span>
                        <span className="font-medium text-[#546A7A]">{format(new Date(asset.updatedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-[#EEC1BF]/10 to-red-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Ticket className="h-5 w-5 mr-2 text-[#976E44]" />
                  Recent Tickets
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-[#CE9F6B]/20 text-[#976E44]">
                    {asset._count.tickets} total
                  </Badge>
                  <Button 
                    size="sm" 
                    className="bg-[#976E44] hover:bg-[#976E44] text-white"
                    onClick={() => router.push(`/admin/tickets/create?assetId=${asset.id}`)}
                  >
                    <Ticket className="h-4 w-4 mr-1" />
                    New Ticket
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {asset.tickets?.length > 0 ? (
                <div className="block sm:hidden space-y-3">
                  {/* Mobile Card View */}
                  {asset.tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-3 space-y-2">
                      <Link 
                        href={`/admin/tickets/${ticket.id}`}
                        className="font-medium hover:underline hover:text-primary text-sm block"
                      >
                        {ticket.title}
                      </Link>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${getTicketStatusBadgeStyles(ticket.status)} text-xs`}>
                          {ticket.status.replace(/_/g, ' ')}
                        </Badge>
                        <Badge className={`${getPriorityBadgeStyles(ticket.priority)} text-xs`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-[#5D6E73] space-y-1">
                        <div>Assigned: {ticket.assignedTo ? ticket.assignedTo.name || ticket.assignedTo.email : 'Unassigned'}</div>
                        <div>Created: {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              
              {asset.tickets?.length > 0 ? (
                <div className="hidden sm:block overflow-x-auto">
                  {/* Desktop Table View */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Title</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[80px]">Priority</TableHead>
                        <TableHead className="min-w-[120px]">Assigned To</TableHead>
                        <TableHead className="min-w-[100px]">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {asset.tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <Link 
                              href={`/admin/tickets/${ticket.id}`}
                              className="font-medium hover:underline hover:text-primary"
                            >
                              {ticket.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTicketStatusBadgeStyles(ticket.status)}>
                              {ticket.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityBadgeStyles(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="truncate max-w-[150px]">
                            {ticket.assignedTo ? ticket.assignedTo.name || ticket.assignedTo.email : 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No tickets found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No support tickets have been created for this asset yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#96AEC2]/10 to-[#EEC1BF]/10">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#546A7A]" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-[#CE9F6B]/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#CE9F6B]/20 rounded-lg">
                      <Ticket className="h-5 w-5 text-[#976E44]" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#546A7A]">Total Tickets</span>
                      <p className="text-xs text-[#5D6E73]">All time</p>
                    </div>
                  </div>
                  <Badge className="bg-[#CE9F6B]/20 text-[#976E44] text-lg font-bold px-3 py-1">
                    {asset._count.tickets}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-[#96AEC2]/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#96AEC2]/20 rounded-lg">
                      <Clock className="h-5 w-5 text-[#546A7A]" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#546A7A]">Service History</span>
                      <p className="text-xs text-[#5D6E73]">Records</p>
                    </div>
                  </div>
                  <Badge className="bg-[#96AEC2]/20 text-[#546A7A] text-lg font-bold px-3 py-1">
                    {asset.serviceHistory?.length || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service History */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-[#A2B9AF]/10 to-[#A2B9AF]/10">
              <CardTitle className="flex items-center text-lg">
                <Shield className="h-5 w-5 mr-2 text-[#4F6A64]" />
                Service History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {asset.serviceHistory && asset.serviceHistory.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {asset.serviceHistory.slice(0, 5).map((service) => (
                    <div key={service.id} className="border border-[#92A2A5] rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                        <h4 className="font-medium text-[#546A7A] text-sm sm:text-base">{service.serviceType}</h4>
                        <span className="text-xs text-[#AEBFC3]0 flex-shrink-0">
                          {format(new Date(service.performedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#5D6E73] mb-2">{service.description}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-[#AEBFC3]0 gap-1">
                        <span className="truncate">By: {service.performedBy.name || service.performedBy.email}</span>
                        {service.duration && <span className="flex-shrink-0">{service.duration} min</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No service history</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Service records will appear here once work is performed on this asset.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
