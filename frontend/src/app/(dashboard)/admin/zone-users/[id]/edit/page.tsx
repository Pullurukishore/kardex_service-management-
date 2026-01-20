'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Save, 
  X, 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  UserCheck,
  Building,
  Phone
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { MobilePageHeader } from '@/components/ui/mobile-responsive';

type ServiceZone = { id: number; name: string; description?: string | null; isActive: boolean };
type ZoneUser = {
  id: number;
  email: string;
  name?: string | null;
  phone?: string | null;
  isActive: boolean;
  role: string;
  serviceZones: Array<{ serviceZone: { id: number; name: string } }>;
};

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
  role: z.enum(['ZONE_USER', 'ZONE_MANAGER'], {
    errorMap: () => ({ message: 'Please select a valid role' })
  }),
  serviceZoneIds: z.array(z.number()).min(1, 'Please select a service zone')
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function EditZoneUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const userId = useMemo(() => Number(params?.id), [params?.id]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoneUser, setZoneUser] = useState<ZoneUser | null>(null);
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<'ZONE_USER' | 'ZONE_MANAGER'>('ZONE_USER');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      email: '',
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'ZONE_USER',
      serviceZoneIds: [] 
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || Number.isNaN(userId)) return;
      setLoading(true);
      try {
        const [userRes, zonesRes] = await Promise.all([
          apiClient.get(`/zone-users/${userId}`),
          // fetch active zones
          apiClient.get('/service-zones', { params: { limit: 100, includeInactive: false } })
        ]);
        
        // Handle different response structures
        let userData = null;
        
        // Check if response has ApiResponse structure (userRes.data)
        if (userRes && typeof userRes === 'object' && 'data' in userRes && userRes.data) {
          userData = userRes.data;
        }
        // Check if response is the user data directly
        else if (userRes && typeof userRes === 'object' && 'id' in userRes) {
          userData = userRes;
        }
        
        if (!userData || typeof userData !== 'object' || !userData.id) {
          throw new Error('Invalid user data received from API');
        }
        
        const user: ZoneUser = userData;
        
        // Handle zones response structure
        let zonesData = null;
        if (zonesRes && typeof zonesRes === 'object' && 'data' in zonesRes) {
          if (Array.isArray(zonesRes.data)) {
            zonesData = zonesRes.data;
          } else if (zonesRes.data && zonesRes.data.data && Array.isArray(zonesRes.data.data)) {
            zonesData = zonesRes.data.data;
          }
        } else if (Array.isArray(zonesRes)) {
          zonesData = zonesRes;
        }
        
        const zones = zonesData || [];

        setZoneUser(user);
        setServiceZones(zones);

        const assigned = (user.serviceZones || []).map((z) => z.serviceZone.id);
        setSelectedZones(assigned);
        const userRole = (user.role === 'ZONE_MANAGER' ? 'ZONE_MANAGER' : 'ZONE_USER') as 'ZONE_USER' | 'ZONE_MANAGER';
        setSelectedRole(userRole);
        form.reset({ 
          email: user.email || '',
          name: user.name || '',
          phone: user.phone || '',
          password: '',
          confirmPassword: '',
          role: userRole,
          serviceZoneIds: assigned 
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to load zone user details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onSubmit = async (values: FormValues) => {
    if (!userId) return;
    
    // Validate required fields
    if (!values.email || !values.email.trim()) {
      toast({ title: 'Error', description: 'Email address is required', variant: 'destructive' });
      return;
    }
    
    if (!values.name || !values.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }
    
    // Validate password if provided
    if (values.password && values.password.length > 0) {
      if (values.password.length < 6) {
        toast({ title: 'Error', description: 'Password must be at least 6 characters long', variant: 'destructive' });
        return;
      }
      
      if (values.password !== values.confirmPassword) {
        toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
        return;
      }
    }
    
    setSaving(true);
    try {
      const promises = [];
      
      // 1. Update user profile (email, name, phone, role) via admin API
      const profileUpdateData = {
        email: values.email,
        name: values.name,
        phone: values.phone || undefined,
        role: values.role,
      };
      
      promises.push(apiClient.put(`/admin/${userId}`, profileUpdateData));
      
      // 2. Update password if provided via separate password reset API
      if (values.password && values.password.length > 0) {
        promises.push(apiClient.post(`/admin/${userId}/reset-password`, {
          newPassword: values.password
        }));
      }
      
      // 3. Update zone assignments via zone user API
      promises.push(apiClient.put(`/zone-users/${userId}`, {
        serviceZoneIds: values.serviceZoneIds
      }));
      
      // Execute all API calls
      await Promise.all(promises);
      
      toast({ 
        title: 'Success', 
        description: 'Zone user updated successfully! Redirecting...' 
      });
      
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push('/admin/zone-users');
        router.refresh();
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update zone user',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50 to-[#96AEC2]/20 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#96AEC2]/20 mb-4">
            <RefreshCw className="h-6 w-6 text-[#546A7A] animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-[#546A7A] mb-2">Loading Zone User</h3>
          <p className="text-sm text-[#AEBFC3]0">Please wait while we fetch the user details and service zones...</p>
        </div>
      </div>
    );
  }

  if (!zoneUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50 to-[#96AEC2]/20 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E17F70]/20 mb-4">
            <XCircle className="h-6 w-6 text-[#9E3B47]" />
          </div>
          <h3 className="text-lg font-medium text-[#546A7A] mb-2">Zone User Not Found</h3>
          <p className="text-sm text-[#AEBFC3]0 mb-6">The zone user you're trying to edit doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/admin/zone-users')} className="bg-[#546A7A] hover:bg-[#546A7A]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Zone Users
          </Button>
        </div>
      </div>
    );
  }

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
              Back to Zone Users
            </Button>
            <Badge 
              variant={zoneUser.isActive ? 'default' : 'secondary'}
              className={zoneUser.isActive 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-[#5D6E73] text-[#AEBFC3] hover:bg-[#5D6E73]'
              }
            >
              {zoneUser.isActive ? (
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
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
              {(zoneUser.name || zoneUser.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Zone User</h1>
              <p className="text-cyan-100 flex items-center gap-2">
                <User className="h-4 w-4" />
                {zoneUser.name || zoneUser.email} - Zone Assignment Management
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
            Back
          </Button>
          <Badge 
            variant={zoneUser.isActive ? 'default' : 'secondary'}
            className={zoneUser.isActive 
              ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' 
              : 'bg-[#AEBFC3]/20 text-[#5D6E73]'
            }
          >
            {zoneUser.isActive ? (
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
        <MobilePageHeader
          title="Edit Zone User"
          description={`${zoneUser.name || zoneUser.email} - Zone Assignment Management`}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Enhanced User Profile Edit Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-[#AEBFC3]/10 to-[#AEBFC3]/20">
            <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-[#AEBFC3]/20 rounded-t-lg border-b">
              <CardTitle className="text-[#546A7A] flex items-center gap-2">
                <User className="h-5 w-5 text-[#546A7A]" />
                User Profile Information
              </CardTitle>
              <CardDescription>
                Update the user's basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#546A7A]" />
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                        className="focus:ring-2 focus:ring-cyan-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name and Phone Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#546A7A]" />
                        Full Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter full name"
                          {...field}
                          className="focus:ring-2 focus:ring-cyan-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#546A7A]" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          {...field}
                          className="focus:ring-2 focus:ring-cyan-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-[#5D6E73]">
                      <Shield className="h-4 w-4 text-[#546A7A]" />
                      User Role *
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="radio"
                          id="role-zone-user"
                          value="ZONE_USER"
                          checked={selectedRole === 'ZONE_USER'}
                          onChange={() => {
                            setSelectedRole('ZONE_USER');
                            form.setValue('role', 'ZONE_USER', { shouldValidate: true });
                          }}
                          className="sr-only"
                        />
                        <label
                          htmlFor="role-zone-user"
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedRole === 'ZONE_USER'
                              ? 'border-[#6F8A9D] bg-[#96AEC2]/10'
                              : 'border-[#92A2A5] bg-white hover:border-[#96AEC2]'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            selectedRole === 'ZONE_USER'
                              ? 'border-[#6F8A9D] bg-[#96AEC2]/100'
                              : 'border-[#92A2A5]'
                          }`}>
                            {selectedRole === 'ZONE_USER' && <div className="h-2 w-2 bg-white rounded-full" />}
                          </div>
                          <div>
                            <p className="font-semibold text-[#546A7A]">Zone User</p>
                            <p className="text-xs text-[#5D6E73]">Can manage assigned zones</p>
                          </div>
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="radio"
                          id="role-zone-manager"
                          value="ZONE_MANAGER"
                          checked={selectedRole === 'ZONE_MANAGER'}
                          onChange={() => {
                            setSelectedRole('ZONE_MANAGER');
                            form.setValue('role', 'ZONE_MANAGER', { shouldValidate: true });
                          }}
                          className="sr-only"
                        />
                        <label
                          htmlFor="role-zone-manager"
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedRole === 'ZONE_MANAGER'
                              ? 'border-[#6F8A9D] bg-[#6F8A9D]/10'
                              : 'border-[#92A2A5] bg-white hover:border-[#6F8A9D]'
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            selectedRole === 'ZONE_MANAGER'
                              ? 'border-[#6F8A9D] bg-[#6F8A9D]/100'
                              : 'border-[#92A2A5]'
                          }`}>
                            {selectedRole === 'ZONE_MANAGER' && <div className="h-2 w-2 bg-white rounded-full" />}
                          </div>
                          <div>
                            <p className="font-semibold text-[#546A7A]">Zone Manager</p>
                            <p className="text-xs text-[#5D6E73]">Can manage and oversee zones</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#976E44]" />
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep current password"
                          {...field}
                          className="focus:ring-2 focus:ring-cyan-500"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[#5D6E73]">
                        Leave blank to keep the current password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#976E44]" />
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          className="focus:ring-2 focus:ring-cyan-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status Display */}
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border">
                <div className="h-10 w-10 rounded-full bg-[#A2B9AF]/20 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-[#4F6A64]" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-[#AEBFC3]0 uppercase tracking-wide">Account Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={zoneUser.isActive ? 'default' : 'secondary'}
                      className={zoneUser.isActive 
                        ? 'bg-[#A2B9AF]/20 text-[#4F6A64] hover:bg-[#82A094]/30' 
                        : 'bg-[#AEBFC3]/20 text-[#5D6E73] hover:bg-[#92A2A5]/30'
                      }
                    >
                      {zoneUser.isActive ? (
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
            </CardContent>
          </Card>

      {/* Enhanced Zone Assignment Form */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-[#96AEC2]/10 to-[#96AEC2]/20">
        <CardHeader className="bg-gradient-to-r from-[#96AEC2]/10 to-[#96AEC2]/20 rounded-t-lg border-b">
          <CardTitle className="text-[#546A7A] flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#546A7A]" />
            Service Zone Assignments
          </CardTitle>
          <CardDescription>
            Select the service zones that this user should be assigned to manage
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">

              {/* Enhanced Zone Selection */}
              <FormField
                control={form.control}
                name="serviceZoneIds"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-4">
                      <FormLabel className="text-lg font-semibold text-[#546A7A]">Available Service Zones</FormLabel>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-[#96AEC2]/10 text-[#546A7A] border-[#96AEC2]/40">
                          {selectedZones.length} selected
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedZones((prevSelected) => {
                              form.setValue('serviceZoneIds', [], { shouldValidate: false, shouldDirty: true });
                              return [];
                            });
                          }}
                          className="text-[#9E3B47] border-[#E17F70] hover:bg-[#E17F70]/10"
                        >
                          <X className="mr-1 h-3 w-3" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {serviceZones.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-cyan-100 to-[#96AEC2]/20 flex items-center justify-center mb-4">
                            <MapPin className="h-8 w-8 text-[#6F8A9D]" />
                          </div>
                          <h3 className="text-lg font-semibold text-[#546A7A] mb-2">No Service Zones Available</h3>
                          <p className="text-[#AEBFC3]0">
                            No active service zones are currently available for assignment.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {serviceZones
                            .filter((z) => z.isActive)
                            .map((zone) => (
                              <div 
                                key={zone.id} 
                                className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                  selectedZones.includes(zone.id)
                                    ? 'border-cyan-500 bg-[#96AEC2]/10 shadow-sm'
                                    : 'border-[#92A2A5] bg-white hover:border-cyan-300'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <FormControl>
                                    <Checkbox
                                      checked={selectedZones.includes(zone.id)}
                                      onCheckedChange={() => {
                                        setSelectedZones((prevSelected) => {
                                          // Single selection: if clicking the same zone, deselect it; otherwise select only this zone
                                          const updated = prevSelected.includes(zone.id) ? [] : [zone.id];
                                          form.setValue('serviceZoneIds', updated, { shouldValidate: false, shouldDirty: true });
                                          return updated;
                                        });
                                      }}
                                      className="mt-1"
                                    />
                                  </FormControl>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] flex items-center justify-center text-white font-semibold text-sm">
                                        {zone.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-[#546A7A]">{zone.name}</h4>
                                        <Badge 
                                          variant="outline" 
                                          className="text-xs bg-[#A2B9AF]/10 text-[#4F6A64] border-[#A2B9AF]"
                                        >
                                          <CheckCircle className="mr-1 h-2 w-2" />
                                          Active
                                        </Badge>
                                      </div>
                                    </div>
                                    {zone.description && (
                                      <p className="text-sm text-[#5D6E73] leading-relaxed">
                                        {zone.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {selectedZones.includes(zone.id) && (
                                  <div className="absolute top-2 right-2">
                                    <div className="h-6 w-6 rounded-full bg-[#96AEC2]/100 flex items-center justify-center">
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    
                    <FormDescription className="text-sm text-[#5D6E73] mt-4">
                      Select one or more service zones to assign to this user. Users can only manage tickets and activities within their assigned zones.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

          </CardContent>
        </Card>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#92A2A5]">
          <div className="flex items-center gap-2 text-sm text-[#5D6E73]">
            <MapPin className="h-4 w-4" />
            <span>
              {selectedZones.length === 0 
                ? 'No zones selected' 
                : `${selectedZones.length} zone${selectedZones.length === 1 ? '' : 's'} selected`
              }
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin/zone-users">
              <Button 
                type="button" 
                variant="outline"
                className="border-[#92A2A5] text-[#5D6E73] hover:bg-[#AEBFC3]/10"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={saving || selectedZones.length === 0}
              className="bg-gradient-to-r from-cyan-600 to-[#6F8A9D] hover:from-cyan-700 hover:to-[#546A7A] shadow-lg min-w-[120px]"
            >
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        </form>
      </Form>
    </div>
  );
}
