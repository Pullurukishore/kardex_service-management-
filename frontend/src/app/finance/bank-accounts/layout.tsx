import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BankAccountsClientWrapper } from '@/components/layout/BankAccountsClientWrapper';
import { getCurrentUser } from '@/lib/api/auth';

// Force dynamic rendering for bank accounts layout
export const dynamic = 'force-dynamic';

export default async function BankAccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the auth token from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken') || cookieStore.get('token');
  
  // If no token, redirect to login
  if (!token?.value) {
    redirect('/auth/login');
  }

  try {
    // Get current user on the server
    const user = await getCurrentUser();
    
    // If no user, redirect to login
    if (!user) {
      redirect('/auth/login');
    }

    return (
      <BankAccountsClientWrapper>
        {children}
      </BankAccountsClientWrapper>
    );
  } catch (error) {
    // Fallback error handling
    console.error('Bank accounts layout auth error:', error);
    redirect('/auth/login');
  }
}
