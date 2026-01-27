'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import {
  TicketFormHeader,
  TicketBasicInfoForm,
  CustomerSelectionForm,
  AddContactDialog,
  AddAssetDialog,
  TicketFormActions,
} from '@/components/tickets';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  customerId: z.string().min(1, 'Customer is required'),
  contactId: z.string().min(1, 'Contact person is required'),
  assetId: z.string().optional(),
  zoneId: z.number({
    required_error: 'Zone is required',
    invalid_type_error: 'Please select a zone'
  }),
  errorDetails: z.string().optional(),
  relatedMachineIds: z.string().optional(),
});

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
});

const assetSchema = z.object({
  model: z.string().min(2, 'Model must be at least 2 characters'),
  serialNo: z.string().min(3, 'Serial number must be at least 3 characters'),
});

type FormValues = z.infer<typeof formSchema>;
type ContactFormValues = z.infer<typeof contactSchema>;
type AssetFormValues = z.infer<typeof assetSchema>;

export default function ZoneCreateTicketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [customers, setCustomers] = useState<Array<{
    id: number;
    name: string;
    companyName: string;
    serviceZoneId: number;
    contacts: Array<{id: number, name: string, email: string, phone: string}>;
    assets: Array<{id: number, model?: string, serialNo?: string, serialNumber?: string}>;
  }>>([]);
  const [contacts, setContacts] = useState<Array<{id: number, name: string, email: string, phone: string}>>([]);
  const [assets, setAssets] = useState<Array<{id: number, model?: string, serialNo?: string, serialNumber?: string}>>([]);

  type ZoneType = {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    servicePersons: Array<{
      id: number;
      user: {
        id: number;
        email: string;
      };
    }>;
  };

  const [zones, setZones] = useState<ZoneType[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const assetForm = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      model: '',
      serialNo: '',
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // For zone managers and zone users, only show their assigned zones
        if (user?.role === 'ZONE_MANAGER' || user?.role === 'ZONE_USER') {
          try {
            // Fetch all zones
            const response = await api.get('/service-zones');
            
            if (response.data) {
              // Handle both response formats
              const allZones = Array.isArray(response.data) ? response.data : 
                              (response.data.data ? response.data.data : []);
              
              // Filter zones based on user's zoneIds (populated by auth middleware)
              const userZoneIds = user?.zoneIds || [];
              const userZones = allZones.filter((zone: any) => userZoneIds.includes(zone.id));
              
              if (userZones.length > 0) {
                setZones(userZones);
                // Auto-select the first zone
                form.setValue('zoneId', userZones[0].id, { shouldValidate: true });
                return; // Exit early on success
              } else {
                toast.error('You are not assigned to any service zone. Please contact your administrator.');
                setZones([]);
                return;
              }
            }
          } catch (apiError) {
            // Don't throw here, we'll handle it below with a user-friendly message
          }
        }
        
        // If we get here, zones failed to load
        toast.error('Failed to load service zones. Please try again.');
        setZones([]);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to load service zones. Please try again.';
        toast.error(errorMessage);
        setZones([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user, form, toast]);

  // Watch all required fields for validation
  const zoneId = form.watch('zoneId');
  const title = form.watch('title');
  const description = form.watch('description');
  const priority = form.watch('priority');
  const customerId = form.watch('customerId');
  const contactId = form.watch('contactId');
  const assetId = form.watch('assetId');

  // Check if all required fields are filled (assetId is optional for zone users)
  const isFormValid = Boolean(
    title && title.length >= 3 &&
    description && description.length >= 10 &&
    priority &&
    zoneId &&
    customerId &&
    contactId
  );
  
  useEffect(() => {
    const fetchZoneCustomers = async () => {
      if (!zoneId) {
        setCustomers([]);
        setContacts([]);
        setAssets([]);
        form.setValue('customerId', '');
        form.setValue('contactId', '');
        form.setValue('assetId', '');
        return;
      }

      try {
        setIsLoadingCustomers(true);
        // Fetch lean customers for the zone user's zone only
        const customersRes = await api.get(`/customers?serviceZoneId=${zoneId}`);
        const leanCustomers = customersRes.data.map((customer: any) => ({
          ...customer,
          contacts: customer.contacts || [],
          assets: customer.assets || []
        }));
        setCustomers(leanCustomers);
        form.setValue('customerId', '');
        form.setValue('contactId', '');
        form.setValue('assetId', '');
        setContacts([]);
        setAssets([]);
      } catch (error) {
        toast.error('Failed to load customers for your zone. Please try again.');
        setCustomers([]);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchZoneCustomers();
  }, [zoneId]);

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Lazy load customer details when a customer is selected
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) {
        setContacts([]);
        setAssets([]);
        form.setValue('contactId', '');
        form.setValue('assetId', '');
        return;
      }

      try {
        setIsLoadingDetails(true);
        const response = await api.get(`/customers/${customerId}?includeAssets=true`);
        const customerDetails = response.data;

        if (customerDetails) {
          const freshContacts = customerDetails.contacts || [];
          const freshAssets = customerDetails.assets || [];
          
          setContacts(freshContacts);
          setAssets(freshAssets);
          form.setValue('contactId', '');
          form.setValue('assetId', '');
          
          if (freshContacts.length === 1) {
            form.setValue('contactId', freshContacts[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch details:', error);
        toast.error('Failed to load customer contacts and assets');
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  const handleCreateAsset = async (values: AssetFormValues) => {
    if (!customerId) {
      toast.error('Please select a customer first');
      return;
    }

    try {
      setIsCreatingAsset(true);
      const payload = { ...values, customerId: parseInt(customerId) };
      const response = await api.post('/assets', payload);
      const newAsset = response.data;
      setAssets(prev => [...prev, newAsset]);
      setCustomers(prev => prev.map(customer => 
        customer.id.toString() === customerId 
          ? { ...customer, assets: [...customer.assets, newAsset] }
          : customer
      ));
      form.setValue('assetId', newAsset.id.toString());
      assetForm.reset();
      setIsAddAssetOpen(false);
      toast.success(`Asset "${newAsset.model}" has been created and selected.`);
    } catch (error: any) {
      let errorMessage = 'Failed to create asset. Please try again.';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } finally {
      setIsCreatingAsset(false);
    }
  };

  const handleCreateContact = async (values: ContactFormValues) => {
    if (!customerId) {
      toast.error('Please select a customer first');
      return;
    }

    try {
      setIsCreatingContact(true);
      const payload = { ...values, customerId: parseInt(customerId) };
      const response = await api.post('/contacts', payload);
      const newContact = response.data;
      setContacts(prev => [...prev, newContact]);
      setCustomers(prev => prev.map(customer => 
        customer.id.toString() === customerId 
          ? { ...customer, contacts: [...customer.contacts, newContact] }
          : customer
      ));
      form.setValue('contactId', newContact.id.toString());
      contactForm.reset();
      setIsAddContactOpen(false);
      toast.success(`Contact "${newContact.name}" has been created and selected.`);
    } catch (error: any) {
      let errorMessage = 'Failed to create contact. Please try again.';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      toast.error(errorMessage);
    } finally {
      setIsCreatingContact(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Verify the zone user is only creating tickets for their assigned zone
      if (user?.zoneId && values.zoneId !== user.zoneId) {
        throw new Error('You are not authorized to create tickets in this zone.');
      }
      
      const response = await api.post('/tickets', {
        ...values,
        customerId: parseInt(values.customerId),
        contactId: parseInt(values.contactId),
        assetId: values.assetId ? parseInt(values.assetId) : undefined,
        relatedMachineIds: values.relatedMachineIds 
          ? values.relatedMachineIds.split(',').map((id: string) => id.trim())
          : undefined,
      });

      const ticketData = response.data;
      const selectedCustomer = customers.find(c => c.id === parseInt(values.customerId));
      const selectedZone = zones.find(z => z.id === values.zoneId);

      toast.success(`🎉 Ticket Created Successfully!\nWelcome! Redirecting to tickets page...\n${selectedCustomer?.companyName || 'customer'} in ${selectedZone?.name || 'your zone'}.`);
      setTimeout(() => {
        router.push('/zone/tickets');
        router.refresh();
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Failed to create ticket. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#AEBFC3]/10 via-red-50/30 to-[#EEC1BF]/10/30"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#E17F70]/30/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#CE9F6B]/30/30 rounded-full blur-3xl animate-pulse delay-300"></div>
        
        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Loading icon with animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E17F70] to-[#CE9F6B] rounded-2xl blur-xl opacity-40 animate-pulse"></div>
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[#E17F70] via-[#CE9F6B] to-[#9E3B47] flex items-center justify-center shadow-2xl">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-[#546A7A]">Loading Form Data</h3>
            <p className="text-[#AEBFC3]0 max-w-md">Preparing the ticket creation form. Please wait...</p>
          </div>
          
          {/* Loading skeleton preview */}
          <div className="w-full max-w-md space-y-3 mt-4">
            <div className="h-3 bg-[#92A2A5]/30/80 rounded-full w-3/4 mx-auto animate-pulse"></div>
            <div className="h-3 bg-[#92A2A5]/30/80 rounded-full w-1/2 mx-auto animate-pulse delay-75"></div>
            <div className="h-3 bg-[#92A2A5]/30/80 rounded-full w-2/3 mx-auto animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-gray-50 to-[#AEBFC3]/20">
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <TicketFormHeader 
          onBack={() => router.back()}
          isSubmitting={isSubmitting}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TicketBasicInfoForm 
              control={form.control}
              zones={zones}
              isSubmitting={isSubmitting}
              hideZoneSelector={true} // Hide zone selector since it's auto-selected for zone users
            />

            <CustomerSelectionForm 
              control={form.control}
              customers={customers}
              contacts={contacts}
              assets={assets}
              zoneId={zoneId !== undefined ? Number(zoneId) : undefined}
              customerId={customerId}
              isSubmitting={isSubmitting}
              isLoadingCustomers={isLoadingCustomers || isLoadingDetails}
              onAddContactClick={() => setIsAddContactOpen(true)}
              onAddAssetClick={() => setIsAddAssetOpen(true)}
            />

            <TicketFormActions 
              isSubmitting={isSubmitting}
              onCancel={() => router.back()}
              isFormValid={isFormValid}
            />
          </form>
        </Form>

        <AddContactDialog 
          open={isAddContactOpen}
          onOpenChange={setIsAddContactOpen}
          onSubmit={handleCreateContact}
          isCreating={isCreatingContact}
        />

        <AddAssetDialog 
          open={isAddAssetOpen}
          onOpenChange={setIsAddAssetOpen}
          onSubmit={handleCreateAsset}
          isCreating={isCreatingAsset}
        />
      </div>
    </div>
  );
}