'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Mail, 
  User, 
  Shield, 
  Phone, 
  Hash,
  MapPin,
  Calendar,
  Activity,
  RefreshCw,
  Eye,
  UserCheck,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ZoneUserActions } from '@/components/admin/ZoneUserActions';
import { apiClient } from '@/lib/api';
import { MobilePageHeader } from '@/components/ui/mobile-responsive';

type ZoneUser = {
  id: number;
  email: string;
  name?: string | null;
  role: string;
  isActive: boolean;
  phone?: string | null;
  zoneId?: number | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  serviceZones: Array<{
    userId: number;
    serviceZoneId: number;
    serviceZone: { 
      id: number; 
      name: string;
      description?: string;
      isActive: boolean;
    };
  }>;
};

export default function ZoneUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const userId = useMemo(() => Number(params?.id), [params?.id]);

  const [loading, setLoading] = useState(true);
  const [zoneUser, setZoneUser] = useState<ZoneUser | null>(null);

  // Debug state changes
  useEffect(() => {
    }, [loading, zoneUser]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || Number.isNaN(userId)) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await apiClient.get(`/zone-users/${userId}`);
        // Handle different response structures
        let userData = null;
        
        // Check if response has ApiResponse structure (res.data)
        if (res && typeof res === 'object' && 'data' in res && res.data) {
          userData = res.data;
        }
        // Check if response is the user data directly
        else if (res && typeof res === 'object' && 'id' in res) {
          userData = res;
        }
        
        // Validate user data
        if (!userData || typeof userData !== 'object' || !userData.id) {
          setZoneUser(null);
          return;
        }
        
        setZoneUser(userData);
        } catch (error: any) {
        // Don't show toast for 404 errors, just let the UI handle it
        if (error?.response?.status !== 404) {
          toast({
            title: 'Error',
            description: error?.response?.data?.message || 'Failed to fetch zone user',
            variant: 'destructive'
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, toast, params?.id]);

  const onDeleteSuccess = () => {
    router.push('/admin/zone-users');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50 to-[#96AEC2]/20 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#96AEC2]/20 mb-4">
            <RefreshCw className="h-6 w-6 text-[#546A7A] animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-[#546A7A] mb-2">Loading Zone User</h3>
          <p className="text-sm text-[#AEBFC3]0">Please wait while we fetch the user details...</p>
        </div>
      </div>
    );
  }

  if (!loading && !zoneUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50 to-[#96AEC2]/20 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E17F70]/20 mb-4">
            <XCircle className="h-6 w-6 text-[#9E3B47]" />
          </div>
          <h3 className="text-lg font-medium text-[#546A7A] mb-2">Zone User Not Found</h3>
          <p className="text-sm text-[#AEBFC3]0 mb-2">
            User ID {params?.id} doesn't exist in the database or has been removed.
          </p>
          <p className="text-xs text-[#979796] mb-2">
            The API request completed successfully but returned no data.
          </p>
          <p className="text-xs text-[#979796] mb-6">
            Please check if this user ID exists in the zone users list.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/admin/zone-users')} className="bg-[#546A7A] hover:bg-[#546A7A]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Zone Users
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-cyan-300 text-[#546A7A] hover:bg-[#96AEC2]/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // At this point, we know zoneUser is not null because of the checks above
  const user = zoneUser!;

  return (
    <div className="space-y-6">
      {/* Desktop Header with Gradient */}
      <div className="hidden md:block relative overflow-hidden rounded-lg bg-gradient-to-r from-cyan-600 via-[#6F8A9D] to-cyan-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/admin/zone-users')}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Zone Users & Managers
            </Button>
            <div className="flex items-center space-x-3">
              <Badge 
                variant={user.isActive ? 'default' : 'secondary'}
                className={user.isActive 
                  ? 'bg-white/20 text-white hover:bg-white/30' 
                  : 'bg-[#5D6E73] text-[#AEBFC3] hover:bg-[#5D6E73]'
                }
              >
                {user.isActive ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </>
                )}
              </Badge>
              <Link href={`/admin/zone-users/${user.id}/edit`}>
                <Button className="bg-white text-[#546A7A] hover:bg-[#96AEC2]/10 shadow-lg">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit User
                </Button>
              </Link>
              <ZoneUserActions user={{ id: user.id, email: user.email }} onDeleteSuccess={onDeleteSuccess} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.name || user.email}</h1>
              <p className="text-cyan-100 flex items-center gap-2">
                <User className="h-4 w-4" />
                Zone User & Manager Details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin/zone-users')}
            className="text-[#5D6E73] hover:text-[#546A7A]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <div className="flex items-center gap-2">
            <Link href={`/admin/zone-users/${user.id}/edit`}>
              <Button className="bg-[#546A7A] hover:bg-[#546A7A] text-white shadow-lg">
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            </Link>
            <ZoneUserActions user={{ id: user.id, email: user.email }} onDeleteSuccess={onDeleteSuccess} />
          </div>
        </div>
        <MobilePageHeader
          title={user.name || user.email}
          description="Zone User Details & Management"
        />
        <div className="mt-4 flex justify-center">
          <Badge 
            variant={user.isActive ? 'default' : 'secondary'}
            className={user.isActive 
              ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' 
              : 'bg-[#AEBFC3]/20 text-[#5D6E73]'
            }
          >
            {user.isActive ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Enhanced User Information */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/20">
        <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/20 rounded-t-lg border-b">
          <CardTitle className="text-[#546A7A] flex items-center gap-2">
            <User className="h-5 w-5 text-[#546A7A]" />
            User Information
          </CardTitle>
          <CardDescription>
            Basic details and current status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] flex items-center justify-center text-white font-bold text-lg">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[#AEBFC3]0 uppercase tracking-wide">Full Name</label>
              <p className="text-lg font-semibold text-[#546A7A]">{user.name || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <div className="h-10 w-10 rounded-full bg-[#96AEC2]/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-[#546A7A]" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[#AEBFC3]0 uppercase tracking-wide">Email Address</label>
              <p className="text-sm font-medium text-[#546A7A] mt-1">{user.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-full bg-[#CE9F6B]/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#976E44]" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-[#AEBFC3]0 uppercase tracking-wide">Role</label>
                <div className="mt-2">
                  <Badge 
                    variant="outline"
                    className="bg-[#CE9F6B]/10 text-[#976E44] border-[#CE9F6B] px-3 py-1"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-full bg-[#A2B9AF]/20 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-[#4F6A64]" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-[#AEBFC3]0 uppercase tracking-wide">Status</label>
                <div className="mt-2">
                  <Badge 
                    variant={user.isActive ? 'default' : 'secondary'}
                    className={user.isActive 
                      ? 'bg-[#A2B9AF]/20 text-[#4F6A64] hover:bg-[#82A094]/30 px-3 py-1' 
                      : 'bg-[#AEBFC3]/20 text-[#5D6E73] hover:bg-[#92A2A5]/30 px-3 py-1'
                    }
                  >
                    {user.isActive ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active User
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive User
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-full bg-[#6F8A9D]/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-[#546A7A]" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-[#AEBFC3]0 uppercase tracking-wide">Phone Number</label>
                <p className="text-sm font-medium text-[#546A7A] mt-1">
                  {user.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Service Zones */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20">
        <CardHeader className="bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/20 rounded-t-lg border-b">
          <CardTitle className="text-[#546A7A] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#546A7A]" />
            Assigned Service Zones ({user.serviceZones?.length || 0})
          </CardTitle>
          <CardDescription>
            Service zones assigned to this user for management
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {user.serviceZones && user.serviceZones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.serviceZones.map((z) => (
                <Link key={z.serviceZone.id} href={`/admin/service-zones/${z.serviceZone.id}`}>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] flex items-center justify-center text-white font-semibold">
                      {z.serviceZone.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#546A7A] group-hover:text-[#546A7A] transition-colors">
                        {z.serviceZone.name}
                      </p>
                      <p className="text-xs text-[#AEBFC3]0">Service Zone</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4 text-[#546A7A]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-cyan-100 to-[#96AEC2]/20 flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-[#6F8A9D]" />
              </div>
              <h3 className="text-lg font-semibold text-[#546A7A] mb-2">No Service Zones</h3>
              <p className="text-[#AEBFC3]0 mb-4">
                This user is not currently assigned to any service zones.
              </p>
              <Link href={`/admin/zone-users/${user.id}/edit`}>
                <Button className="bg-gradient-to-r from-cyan-600 to-[#6F8A9D] hover:from-cyan-700 hover:to-[#546A7A] shadow-lg">
                  <MapPin className="mr-2 h-4 w-4" />
                  Assign Zones
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

