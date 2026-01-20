'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Phone, User, Loader2, UserPlus, Sparkles } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ContactFormValues) => Promise<void>;
  isCreating: boolean;
}

export function AddContactDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isCreating 
}: AddContactDialogProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const handleSubmit = async (values: ContactFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-0 shadow-2xl">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-[#546A7A] via-[#546A7A] to-[#546A7A] p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg">
                <UserPlus className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-[#CE9F6B] to-[#CE9F6B] flex items-center justify-center shadow">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Add New Contact</DialogTitle>
              <DialogDescription className="text-[#6F8A9D] mt-0.5">
                Create a new contact for the selected customer
              </DialogDescription>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-[#5D6E73] font-medium">
                      <div className="h-6 w-6 rounded-md bg-[#6F8A9D]/20 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-[#546A7A]" />
                      </div>
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter contact's full name" 
                        {...field} 
                        disabled={isCreating}
                        className="h-11 border-[#92A2A5] focus:ring-2 focus:ring-[#6F8A9D] focus:border-[#6F8A9D] transition-all"
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
                    <FormLabel className="flex items-center gap-2 text-[#5D6E73] font-medium">
                      <div className="h-6 w-6 rounded-md bg-[#A2B9AF]/20 flex items-center justify-center">
                        <Phone className="h-3.5 w-3.5 text-[#4F6A64]" />
                      </div>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                        disabled={isCreating}
                        className="h-11 border-[#92A2A5] focus:ring-2 focus:ring-[#82A094] focus:border-[#82A094] transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-4 border-t border-[#AEBFC3]/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isCreating}
                  className="hover:bg-[#AEBFC3]/20 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-gradient-to-r from-[#546A7A] to-[#546A7A] hover:from-[#546A7A] hover:to-[#546A7A] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {isCreating ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Contact
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
