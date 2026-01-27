import AuthProvider from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" closeButton theme="dark" richColors />
    </AuthProvider>
  );
}
