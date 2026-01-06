'use client';

import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, FileText, MapPin, Phone, Type, AlignLeft, Flag, Globe } from 'lucide-react';

interface Zone {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

interface TicketBasicInfoFormProps {
  control: Control<any>;
  zones: Zone[];
  isSubmitting: boolean;
  hideZoneSelector?: boolean;
}

export function TicketBasicInfoForm({ control, zones, isSubmitting, hideZoneSelector = false }: TicketBasicInfoFormProps) {
  return (
    <Card className="shadow-xl border-0 bg-white overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      
      <CardHeader className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 border-b border-blue-100/50 pb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg ring-2 ring-blue-100">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
              <span className="text-xs font-bold text-white">1</span>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">Ticket Information</CardTitle>
            <CardDescription className="text-gray-500 mt-1">Fill in the basic details about the support ticket</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        {/* Title Field - Full Width */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-semibold text-gray-700">
                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Type className="h-4 w-4 text-blue-600" />
                </div>
                Ticket Title
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Machine not starting, Error code E501, Routine maintenance needed..." 
                  {...field} 
                  disabled={isSubmitting}
                  className="h-12 text-base border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </FormControl>
              <FormDescription className="text-gray-500 text-sm">
                Provide a brief, descriptive title for quick identification
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description Field - Full Width */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-base font-semibold text-gray-700">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <AlignLeft className="h-4 w-4 text-indigo-600" />
                </div>
                Description
                <span className="text-red-500 ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue in detail:&#10;• What happened?&#10;• When did it start?&#10;• Any error messages or codes?&#10;• Steps already tried to fix it?"
                  className="min-h-[140px] text-base border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none placeholder:text-gray-400"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-gray-500 text-sm">
                The more details you provide, the faster we can resolve your issue
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Call Type and Priority Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Type */}
          <FormField
            control={control}
            name="callType"
            render={({ field }) => (
              <FormItem className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 p-5 rounded-xl border border-green-100">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <div className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  Call Type
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base bg-white border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select contract status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="UNDER_MAINTENANCE_CONTRACT" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div>
                        <div>
                          <span className="font-medium text-blue-700">Under Maintenance Contract</span>
                          <p className="text-xs text-gray-500 mt-0.5">Covered under service agreement</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="NOT_UNDER_CONTRACT" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-orange-500 ring-2 ring-orange-200"></div>
                        <div>
                          <span className="font-medium text-orange-700">Not Under Contract</span>
                          <p className="text-xs text-gray-500 mt-0.5">Billable service call</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Priority */}
          <FormField
            control={control}
            name="priority"
            render={({ field }) => (
              <FormItem className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-5 rounded-xl border border-amber-100">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Flag className="h-4 w-4 text-amber-600" />
                  </div>
                  Priority Level
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base bg-white border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-200"></div>
                        <div>
                          <span className="font-medium text-green-700">Low Priority</span>
                          <p className="text-xs text-gray-500 mt-0.5">Can wait, no immediate impact</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-yellow-500 ring-2 ring-yellow-200"></div>
                        <div>
                          <span className="font-medium text-yellow-700">Medium Priority</span>
                          <p className="text-xs text-gray-500 mt-0.5">Important, affects workflow</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-200 animate-pulse"></div>
                        <div>
                          <span className="font-medium text-red-700">High Priority</span>
                          <p className="text-xs text-gray-500 mt-0.5">Urgent, production stopped</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Service Zone - Full Width */}
        <FormField
          control={control}
          name="zoneId"
          render={({ field }) => {
            const selectedZone = zones.find(zone => zone.id === field.value);
            
            return (
              <FormItem className="bg-gradient-to-br from-blue-50/50 to-cyan-50/30 p-5 rounded-xl border border-blue-100">
                <FormLabel className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  Service Zone
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                
                {hideZoneSelector ? (
                  <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-gray-700">
                      {selectedZone?.name || 'No zone selected'}
                    </span>
                  </div>
                ) : (
                  <Select 
                    onValueChange={(value) => field.onChange(value === 'all' ? 'all' : Number(value))} 
                    value={field.value?.toString()}
                    disabled={isSubmitting || zones.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder={zones.length === 0 ? 'No zones available' : 'Select the service zone for this ticket'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(zones) && zones.length > 0 ? (
                        <>
                          {zones.length > 1 && (
                            <SelectItem key="all" value="all" className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                  <Globe className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <span className="font-medium">All Zones</span>
                                  <p className="text-xs text-gray-500 mt-0.5">Show customers from all service zones</p>
                                </div>
                              </div>
                            </SelectItem>
                          )}
                          {zones.filter(zone => zone.isActive).map((zone) => (
                            <SelectItem key={zone.id} value={zone.id.toString()} className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                  <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium">{zone.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      ) : (
                        <SelectItem value="" disabled>
                          No active zones available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                <FormDescription className="text-gray-500 text-sm">
                  Select the zone to load available customers
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
