import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FinanceClientWrapper } from '@/components/layout/FinanceClientWrapper';

export default async function FinanceARLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the auth token from cookies - just check existence
  // Full auth validation happens client-side in AuthContext
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken') || cookieStore.get('token');
  
  // If no token, redirect to login
  if (!token?.value) {
    redirect('/auth/login');
  }

  return (
    <FinanceClientWrapper>
      {children}
    </FinanceClientWrapper>
  );
}

