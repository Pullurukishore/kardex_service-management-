import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FinanceClientWrapper } from '@/components/layout/FinanceClientWrapper';
import { getCurrentUser } from '@/lib/api/auth';

// Force dynamic rendering for finance layout
export const dynamic = 'force-dynamic';

export default async function FinanceARLayout({
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
      <FinanceClientWrapper>
        {children}
      </FinanceClientWrapper>
    );
  } catch (error) {
    // Use the same error handling strategy as the Dashboard layout
    // If authentication check fails or backend is down, redirect to login as fallback
    // Or potentially show an error component if we want to be more graceful
    console.error('Finance layout auth error:', error);
    redirect('/auth/login');
  }
}
