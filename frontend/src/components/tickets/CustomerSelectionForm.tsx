'use client';

import { Control } from 'react-hook-form';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Building2, Users, Package, Plus, Loader2, Search, X, CircleUser, Wrench, Phone, Mail, Hash, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  companyName: string;
  serviceZoneId: number;
  contacts: Array<{id: number, name: string, email: string, phone: string}>;
  assets: Array<{id: number, model?: string, serialNo?: string, serialNumber?: string}>;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Asset {
  id: number;
  model?: string;
  serialNo?: string;
  serialNumber?: string;
}

interface CustomerSelectionFormProps {
  control: Control<any>;
  customers: Customer[];
  contacts: Contact[];
  assets: Asset[];
  zoneId: number | string | undefined;
  customerId: string;
  isSubmitting: boolean;
  isLoadingCustomers: boolean;
  onAddContactClick: () => void;
  onAddAssetClick: () => void;
}

export function CustomerSelectionForm({
  control,
  customers,
  contacts,
  assets,
  zoneId,
  customerId,
  isSubmitting,
  isLoadingCustomers,
  onAddContactClick,
  onAddAssetClick
}: CustomerSelectionFormProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [assetSearch, setAssetSearch] = useState('');

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    return customers.filter(customer => 
      customer.companyName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.name?.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
      contact.phone?.includes(contactSearch)
    );
  }, [contacts, contactSearch]);

  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    if (!assetSearch.trim()) return assets;
    return assets.filter(asset => 
      asset.model?.toLowerCase().includes(assetSearch.toLowerCase()) ||
      asset.serialNo?.toLowerCase().includes(assetSearch.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(assetSearch.toLowerCase())
    );
  }, [assets, assetSearch]);

  // Status indicators
  const hasCustomer = !!customerId;
  const hasContacts = contacts.length > 0;
  const hasAssets = assets.length > 0;

  return (
    <Card className="shadow-xl border-0 bg-white overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#82A094] via-[#82A094] to-[#82A094]"></div>
      
      <CardHeader className="bg-gradient-to-br from-[#A2B9AF]/10 via-[#A2B9AF]/50 to-[#82A094]/10/30 border-b border-[#A2B9AF]/30/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#82A094] to-[#4F6A64] flex items-center justify-center shadow-lg ring-2 ring-green-100">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-[#CE9F6B] to-[#CE9F6B] flex items-center justify-center shadow">
                <span className="text-xs font-bold text-white">2</span>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-[#546A7A]">Customer Information</CardTitle>
              <CardDescription className="text-[#AEBFC3]0 mt-1">Select or add customer details for this ticket</CardDescription>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${hasCustomer ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' : 'bg-[#AEBFC3]/20 text-[#AEBFC3]0'}`}>
              {hasCustomer ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              Customer
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${hasContacts ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' : 'bg-[#AEBFC3]/20 text-[#AEBFC3]0'}`}>
              {hasContacts ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              Contact
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${hasAssets ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' : 'bg-[#AEBFC3]/20 text-[#AEBFC3]0'}`}>
              {hasAssets ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              Asset
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        {/* Customer Selection - Full Width */}
        <FormField
          control={control}
          name="customerId"
          render={({ field }) => (
            <FormItem className="bg-gradient-to-br from-[#A2B9AF]/10/50 to-[#A2B9AF]/10/30 p-5 rounded-xl border border-[#A2B9AF]/30">
              <FormLabel className="flex items-center gap-2 text-base font-semibold text-[#5D6E73]">
                <div className="h-7 w-7 rounded-lg bg-[#82A094]/20 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-[#4F6A64]" />
                </div>
                Select Customer
                <span className="text-[#E17F70] ml-1">*</span>
                {isLoadingCustomers && <Loader2 className="h-4 w-4 animate-spin text-[#82A094] ml-2" />}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={isSubmitting || !zoneId || isLoadingCustomers || customers.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="h-12 text-base bg-white border-[#92A2A5] focus:ring-2 focus:ring-[#82A094] focus:border-[#82A094]">
                    <SelectValue placeholder={
                      !zoneId 
                        ? '⚠️ Select a service zone first (Step 1)' 
                        : isLoadingCustomers 
                          ? 'Loading customers from zone...' 
                          : customers.length === 0 
                            ? 'No customers found in this zone' 
                            : `Choose from ${customers.length} customer${customers.length > 1 ? 's' : ''}`
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-80">
                  {/* Search Header */}
                  <div className="sticky top-0 bg-white border-b p-3 z-10">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#979796] h-4 w-4" />
                      <Input
                        placeholder="Type to search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10 pr-10 h-10 text-sm border-[#92A2A5]"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {customerSearch && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerSearch('');
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#979796] hover:text-[#5D6E73] p-1 rounded-full hover:bg-[#AEBFC3]/20"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()} className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#82A094] to-[#4F6A64] flex items-center justify-center text-white font-bold">
                              {customer.companyName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-[#546A7A]">{customer.companyName}</span>
                              <div className="flex items-center gap-2 text-xs text-[#AEBFC3]0 mt-0.5">
                                <span>{customer.contacts?.length || 0} contacts</span>
                                <span>•</span>
                                <span>{customer.assets?.length || 0} assets</span>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <div className="text-[#979796] mb-2">
                          <Building2 className="h-8 w-8 mx-auto opacity-50" />
                        </div>
                        <p className="text-sm text-[#AEBFC3]0">
                          {customerSearch ? 'No customers match your search' : 'No customers available'}
                        </p>
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              <FormDescription className="text-[#AEBFC3]0 text-sm">
                {zoneId ? `${customers.length} customer${customers.length !== 1 ? 's' : ''} available in selected zone` : 'Select a zone first to see customers'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Contact and Asset Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Person */}
          <FormField
            control={control}
            name="contactId"
            render={({ field }) => (
              <FormItem className="bg-gradient-to-br from-[#6F8A9D]/10/50 to-[#6F8A9D]/10/30 p-5 rounded-xl border border-[#6F8A9D]/30">
                <div className="flex items-center justify-between mb-1">
                  <FormLabel className="flex items-center gap-2 text-base font-semibold text-[#5D6E73]">
                    <div className="h-7 w-7 rounded-lg bg-[#6F8A9D]/20 flex items-center justify-center">
                      <CircleUser className="h-4 w-4 text-[#546A7A]" />
                    </div>
                    Contact Person
                    <span className="text-[#E17F70] ml-1">*</span>
                  </FormLabel>
                  {customerId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onAddContactClick}
                      disabled={isSubmitting || isLoadingCustomers}
                      className="text-[#546A7A] hover:text-[#546A7A] hover:bg-[#6F8A9D]/20 h-8 px-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New
                    </Button>
                  )}
                </div>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={!customerId || contacts.length === 0 || isSubmitting || isLoadingCustomers}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base bg-white border-[#92A2A5] focus:ring-2 focus:ring-[#6F8A9D] focus:border-[#6F8A9D]">
                      <SelectValue 
                        placeholder={
                          !customerId 
                            ? '← Select a customer first' 
                            : contacts.length === 0 
                              ? 'No contacts - click Add New' 
                              : `Choose from ${contacts.length} contact${contacts.length > 1 ? 's' : ''}`
                        } 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-80">
                    <div className="sticky top-0 bg-white border-b p-3 z-10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#979796] h-4 w-4" />
                        <Input
                          placeholder="Search contacts..."
                          value={contactSearch}
                          onChange={(e) => setContactSearch(e.target.value)}
                          className="pl-10 pr-10 h-10 text-sm border-[#92A2A5]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {contactSearch && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContactSearch('');
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#979796] hover:text-[#5D6E73]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id.toString()} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] flex items-center justify-center text-white font-bold">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium text-[#546A7A]">{contact.name}</span>
                                <div className="flex items-center gap-3 text-xs text-[#AEBFC3]0 mt-0.5">
                                  {contact.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {contact.phone}
                                    </span>
                                  )}
                                  {contact.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {contact.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <div className="text-[#979796] mb-2">
                            <Users className="h-8 w-8 mx-auto opacity-50" />
                          </div>
                          <p className="text-sm text-[#AEBFC3]0">
                            {contactSearch ? 'No contacts match your search' : 'No contacts available'}
                          </p>
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Asset Selection */}
          <FormField
            control={control}
            name="assetId"
            render={({ field }) => (
              <FormItem className="bg-gradient-to-br from-[#6F8A9D]/10/50 to-[#96AEC2]/10/30 p-5 rounded-xl border border-[#6F8A9D]/30">
                <div className="flex items-center justify-between mb-1">
                  <FormLabel className="flex items-center gap-2 text-base font-semibold text-[#5D6E73]">
                    <div className="h-7 w-7 rounded-lg bg-[#546A7A]/20 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-[#546A7A]" />
                    </div>
                    Machine/Asset
                    <span className="text-[#E17F70] ml-1">*</span>
                  </FormLabel>
                  {customerId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onAddAssetClick}
                      disabled={isSubmitting || isLoadingCustomers}
                      className="text-[#546A7A] hover:text-[#546A7A] hover:bg-[#546A7A]/20 h-8 px-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New
                    </Button>
                  )}
                </div>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                  disabled={!customerId || assets.length === 0 || isSubmitting || isLoadingCustomers}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base bg-white border-[#92A2A5] focus:ring-2 focus:ring-[#6F8A9D] focus:border-[#6F8A9D]">
                      <SelectValue 
                        placeholder={
                          !customerId 
                            ? '← Select a customer first' 
                            : assets.length === 0 
                              ? 'No assets - click Add New' 
                              : `Choose from ${assets.length} asset${assets.length > 1 ? 's' : ''}`
                        } 
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-80">
                    <div className="sticky top-0 bg-white border-b p-3 z-10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#979796] h-4 w-4" />
                        <Input
                          placeholder="Search assets by model or serial..."
                          value={assetSearch}
                          onChange={(e) => setAssetSearch(e.target.value)}
                          className="pl-10 pr-10 h-10 text-sm border-[#92A2A5]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {assetSearch && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssetSearch('');
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#979796] hover:text-[#5D6E73]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredAssets.length > 0 ? (
                        filteredAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id.toString()} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] flex items-center justify-center text-white">
                                <Package className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="font-medium text-[#546A7A]">{asset.model || 'Unknown Model'}</span>
                                <div className="flex items-center gap-1 text-xs text-[#AEBFC3]0 mt-0.5">
                                  <Hash className="h-3 w-3" />
                                  <span>SN: {asset.serialNumber || asset.serialNo || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <div className="text-[#979796] mb-2">
                            <Package className="h-8 w-8 mx-auto opacity-50" />
                          </div>
                          <p className="text-sm text-[#AEBFC3]0">
                            {assetSearch ? 'No assets match your search' : 'No assets available'}
                          </p>
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
