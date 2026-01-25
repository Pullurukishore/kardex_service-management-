import type { Metadata } from "next";
import { Toaster } from "sonner";
import dynamic from 'next/dynamic';
import AuthProvider from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { NavigationProvider } from "@/providers/NavigationProvider";
import PinGuard from "@/components/PinGuard";
import "./globals.css";

// Dynamically import ErrorBoundary with no SSR
const ErrorBoundary = dynamic(
  () => import('@/components/ErrorBoundary'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Kardex Ticket Management",
  description: "Kardex Ticket Management System",
  icons: {
    icon: [
      { url: "/favicon-circle-simple.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon-circle.svg", sizes: "64x64", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "48x48", type: "image/png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/favicon-circle-simple.svg",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              <NavigationProvider>
                <PinGuard>
                  {children}
                </PinGuard>
                <Toaster 
                  position="top-center" 
                  closeButton
                  theme="light"
                  richColors
                  toastOptions={{
                    style: {
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(110, 138, 157, 0.2), 0 8px 10px -6px rgba(110, 138, 157, 0.15)',
                      fontWeight: 500,
                    },
                    classNames: {
                      toast: 'font-medium',
                      success: 'bg-gradient-to-r from-[#A2B9AF] to-[#82A094] text-white border-none',
                      error: 'bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white border-none',
                      warning: 'bg-gradient-to-r from-[#EEC1BF] to-[#CE9F6B] text-white border-none',
                      info: 'bg-gradient-to-r from-[#96AEC2] to-[#6F8A9D] text-white border-none',
                    },
                  }}
                />
              </NavigationProvider>
            </QueryProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
