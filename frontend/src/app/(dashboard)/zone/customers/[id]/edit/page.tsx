'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function EditCustomerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect zone users away from edit page
    router.push('/zone/customers');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50 to-[#96AEC2]/20 p-4 sm:p-6 lg:p-8">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="text-center py-12">
          <AlertCircle className="mx-auto h-16 w-16 text-[#CE9F6B] mb-4" />
          <h3 className="text-lg font-medium text-[#546A7A] mb-2">
            Access Denied
          </h3>
          <p className="text-[#5D6E73]">
            Zone users do not have permission to edit customer details.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
