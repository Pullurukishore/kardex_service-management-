import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import AuthProvider from "@/contexts/AuthContext";
import PinGuard from "@/components/PinGuard";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
});

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
      <body className={`${inter.variable} font-sans antialiased text-[#2D3132]`}>
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
