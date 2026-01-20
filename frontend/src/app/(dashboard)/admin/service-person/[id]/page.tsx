'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Mail, Shield, MapPin, User, Phone, Calendar, Clock, Activity, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { MobilePageHeader, MobileCard } from '@/components/ui/mobile-responsive';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getServicePerson, deleteServicePerson, ServicePerson } from '@/services/servicePerson.service';

export default function ServicePersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [servicePerson, setServicePerson] = useState<ServicePerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const servicePersonId = parseInt(params.id as string);

  useEffect(() => {
    const fetchServicePerson = async () => {
      try {
        setLoading(true);
        const data = await getServicePerson(servicePersonId);
        // Debug log
        setServicePerson(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch service person details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (servicePersonId) {
      fetchServicePerson();
    }
  }, [servicePersonId]);

  const handleDelete = async () => {
    try {
      await deleteServicePerson(servicePersonId);
      toast({
        title: 'Success',
        description: 'Service person deleted successfully',
      });
      router.push('/admin/service-person');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete service person',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading service person details...</div>
        </div>
      </div>
    );
  }

  if (!servicePerson) {
    return (
      <div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Service Person Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested service person could not be found.</p>
          <Link href="/admin/service-person" className="mt-4 inline-block">
            <Button>Back to Service Persons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Header with Gradient */}
      <div className="hidden md:block relative overflow-hidden rounded-lg bg-gradient-to-r from-[#6F8A9D] via-[#6F8A9D] to-[#6F8A9D] p-6 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{servicePerson.name || servicePerson.email}</h1>
              <p className="text-[#96AEC2] flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {servicePerson.email}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge 
                  variant={servicePerson.isActive ? 'default' : 'secondary'}
                  className={servicePerson.isActive 
                    ? 'bg-[#A2B9AF]/100/20 text-[#A2B9AF] border-green-400/30' 
                    : 'bg-[#AEBFC3]/100/20 text-[#AEBFC3] border-[#979796]/30'
                  }
                >
                  {servicePerson.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/service-person">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href={`/admin/service-person/${servicePersonId}/edit`}>
              <Button className="bg-white text-[#546A7A] hover:bg-[#96AEC2]/10">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="mb-4">
          <Link href="/admin/service-person">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service Persons
            </Button>
          </Link>
        </div>
        <MobilePageHeader
          title={servicePerson.name || servicePerson.email}
          description={servicePerson.name ? servicePerson.email : undefined}
          action={
            <Link href={`/admin/service-person/${servicePersonId}/edit`}>
              <Button size="sm" className="bg-[#6F8A9D] hover:bg-[#546A7A] text-white">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-[#96AEC2]/10/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="h-6 w-6 text-[#546A7A]" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5D6E73] uppercase tracking-wide">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <User className="h-5 w-5 text-[#6F8A9D]" />
                    <span className="font-medium text-[#546A7A]">
                      {servicePerson.name || 'Not provided'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5D6E73] uppercase tracking-wide">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Mail className="h-5 w-5 text-[#82A094]" />
                    <span className="font-medium text-[#546A7A] break-all">{servicePerson.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5D6E73] uppercase tracking-wide">Phone Number</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Phone className="h-5 w-5 text-[#6F8A9D]" />
                    <span className="font-medium text-[#546A7A]">
                      {servicePerson.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-[#A2B9AF]/10/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-6 w-6 text-[#4F6A64]" />
                Account Status & Activity
              </CardTitle>
              <CardDescription>Current status and recent activity information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5D6E73] uppercase tracking-wide">Account Status</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <div className={`h-3 w-3 rounded-full ${
                      servicePerson.isActive ? 'bg-[#A2B9AF]/100' : 'bg-[#979796]'
                    }`}></div>
                    <Badge 
                      variant={servicePerson.isActive ? 'default' : 'secondary'}
                      className={servicePerson.isActive 
                        ? 'bg-[#A2B9AF]/20 text-[#4F6A64] hover:bg-[#82A094]/30' 
                        : 'bg-[#AEBFC3]/20 text-[#5D6E73] hover:bg-[#92A2A5]/30'
                      }
                    >
                      {servicePerson.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5D6E73] uppercase tracking-wide">Role</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Settings className="h-5 w-5 text-[#CE9F6B]" />
                    <Badge variant="outline" className="bg-[#CE9F6B]/10 text-[#976E44] border-[#CE9F6B]">
                      Service Personnel
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5D6E73] uppercase tracking-wide">Last Login</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Clock className="h-5 w-5 text-[#6F8A9D]" />
                    <span className="font-medium text-[#546A7A]">
                      {servicePerson.lastLoginAt 
                        ? new Date(servicePerson.lastLoginAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#5D6E73] uppercase tracking-wide">Account Created</label>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <Calendar className="h-5 w-5 text-[#6F8A9D]" />
                    <span className="font-medium text-[#546A7A]">
                      {servicePerson.createdAt 
                        ? new Date(servicePerson.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Zones */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-[#96AEC2]/10/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPin className="h-6 w-6 text-[#546A7A]" />
                Assigned Service Zones
              </CardTitle>
              <CardDescription>
                Geographic areas and zones this person is responsible for managing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {servicePerson.serviceZones.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto h-20 w-20 bg-[#6F8A9D]/20 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-10 w-10 text-[#6F8A9D]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#546A7A] mb-2">No zones assigned</h3>
                  <p className="text-[#AEBFC3]0 mb-6 max-w-sm mx-auto">
                    This service person is not assigned to any zones yet. Assign zones to enable service coverage.
                  </p>
                  <Link href={`/admin/service-person/${servicePersonId}/edit`}>
                    <Button className="bg-[#546A7A] hover:bg-[#546A7A] text-white">
                      <MapPin className="mr-2 h-4 w-4" />
                      Assign Zones
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[#5D6E73]">
                      {servicePerson.serviceZones.length} zone{servicePerson.serviceZones.length !== 1 ? 's' : ''} assigned
                    </span>
                    <Link href={`/admin/service-person/${servicePersonId}/edit`}>
                      <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Zones
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicePerson.serviceZones.map((zone, index) => (
                      <div
                        key={zone.serviceZone.id}
                        className="group p-4 bg-white border border-[#6F8A9D] rounded-xl hover:shadow-md hover:border-[#6F8A9D] transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#6F8A9D]/20 rounded-lg flex items-center justify-center group-hover:bg-[#6F8A9D]/30 transition-colors">
                              <MapPin className="h-5 w-5 text-[#546A7A]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#546A7A] group-hover:text-[#546A7A] transition-colors">
                                {zone.serviceZone.name}
                              </h4>
                              <Badge variant="outline" className="text-xs bg-[#6F8A9D]/10 text-[#546A7A] border-[#6F8A9D]">
                                Zone #{zone.serviceZone.id}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {zone.serviceZone.description && (
                          <p className="text-sm text-[#5D6E73] leading-relaxed">
                            {zone.serviceZone.description}
                          </p>
                        )}
                        <div className="mt-3 pt-3 border-t border-[#96AEC2]/20">
                          <div className="flex items-center justify-between text-xs text-[#AEBFC3]0">
                            <span>Active Zone</span>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 bg-[#82A094] rounded-full"></div>
                              <span>Online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-[#96AEC2]/10/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-[#546A7A]" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-white rounded-lg border border-[#96AEC2]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-[#96AEC2]/20 rounded-lg flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-[#546A7A]" />
                      </div>
                      <span className="text-sm font-medium text-[#5D6E73]">Assigned Zones</span>
                    </div>
                    <span className="text-xl font-bold text-[#546A7A]">{servicePerson.serviceZones.length}</span>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-[#96AEC2]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-[#A2B9AF]/20 rounded-lg flex items-center justify-center">
                        <Activity className="h-4 w-4 text-[#4F6A64]" />
                      </div>
                      <span className="text-sm font-medium text-[#5D6E73]">Status</span>
                    </div>
                    <Badge 
                      variant={servicePerson.isActive ? 'default' : 'secondary'}
                      className={servicePerson.isActive 
                        ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' 
                        : 'bg-[#AEBFC3]/20 text-[#5D6E73]'
                      }
                    >
                      {servicePerson.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-[#EEC1BF]/10/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-[#976E44]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/admin/service-person/${servicePersonId}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start h-12 bg-white hover:bg-[#96AEC2]/10 border-[#96AEC2] hover:border-[#96AEC2]">
                  <Pencil className="mr-3 h-5 w-5 text-[#546A7A]" />
                  <div className="text-left">
                    <div className="font-medium text-[#546A7A]">Edit Details</div>
                    <div className="text-xs text-[#6F8A9D]">Update information</div>
                  </div>
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-white hover:bg-[#E17F70]/10 border-[#E17F70] hover:border-[#E17F70] text-[#9E3B47] hover:text-[#75242D]"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Delete Person</div>
                  <div className="text-xs opacity-70">Remove permanently</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-[#A2B9AF]/10/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-[#4F6A64]" />
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-[#A2B9AF]/20">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#4F6A64]" />
                  <div>
                    <div className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Email</div>
                    <div className="font-medium text-[#546A7A] text-sm break-all">{servicePerson.email}</div>
                  </div>
                </div>
              </div>
              {servicePerson.phone && (
                <div className="p-3 bg-white rounded-lg border border-[#A2B9AF]/20">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#4F6A64]" />
                    <div>
                      <div className="text-xs text-[#AEBFC3]0 uppercase tracking-wide">Phone</div>
                      <div className="font-medium text-[#546A7A] text-sm">{servicePerson.phone}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Person</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {servicePerson.email}? This action cannot be undone.
              All zone assignments will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
