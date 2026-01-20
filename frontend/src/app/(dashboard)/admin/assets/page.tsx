// src/app/(dashboard)/admin/assets/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, 
  Plus, 
  Search, 
  Filter,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { format } from 'date-fns';

interface Asset {
  id: number;
  machineId: string;
  model: string | null;
  serialNo: string | null;
  location: string | null;
  status: string;
  purchaseDate: string | null;
  warrantyEnd: string | null;
  customer: {
    id: number;
    companyName: string;
  };
  _count: {
    tickets: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/assets?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      
      const data = await response.json();
      setAssets(data.data || []);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [searchTerm, statusFilter]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading assets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#546A7A]">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Manage all assets across customers
          </p>
        </div>
        <Button 
          className="bg-[#6F8A9D] hover:bg-[#546A7A] text-white w-full sm:w-auto"
          onClick={() => router.push('/admin/customers')}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Asset to Customer</span>
          <span className="sm:hidden">Add Asset</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 sm:h-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {assets.map((asset) => (
            <Link 
              key={asset.id} 
              href={`/admin/assets/${asset.id}`}
              className="block"
            >
              <Card className="border border-[#92A2A5] hover:bg-[#96AEC2]/10 hover:border-[#96AEC2] transition-all duration-200 shadow-sm hover:shadow-md">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="p-1.5 sm:p-2 bg-[#96AEC2]/20 rounded-lg flex-shrink-0">
                        <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-[#546A7A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base font-semibold truncate">
                          {asset.machineId}
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-[#5D6E73] truncate">
                          {asset.model || 'No model specified'}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusBadgeStyles(asset.status)} text-xs flex-shrink-0`}>
                      {asset.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-4 sm:px-6">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-[#5D6E73]">
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">{asset.customer.companyName}</span>
                    </div>
                    {asset.serialNo && (
                      <div className="text-xs sm:text-sm text-[#5D6E73]">
                        <span className="font-medium">Serial:</span> <span className="break-all">{asset.serialNo}</span>
                      </div>
                    )}
                    {asset.location && (
                      <div className="flex items-center text-xs sm:text-sm text-[#5D6E73]">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">{asset.location}</span>
                      </div>
                    )}
                    {asset.purchaseDate && (
                      <div className="flex items-center text-xs sm:text-sm text-[#5D6E73]">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="truncate">Purchased: {format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-[#AEBFC3]0">
                        {asset._count.tickets} ticket{asset._count.tickets !== 1 ? 's' : ''}
                      </span>
                      {asset.warrantyEnd && (
                        <span className="text-xs text-[#AEBFC3]0 truncate ml-2">
                          Warranty: {format(new Date(asset.warrantyEnd), 'MMM yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <HardDrive className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No assets found</h3>
            <p className="mt-1 text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Assets will appear here once customers add them.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
