'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/user.types';

// Dynamic imports for heavy components - reduces initial bundle
const Sidebar = dynamic(
  () => import('@/components/layout/Sidebar').then(mod => ({ default: mod.Sidebar })),
  { 
    ssr: false,
    loading: () => <div className="hidden lg:block w-64 h-screen bg-gradient-to-b from-[#546A7A] to-[#3D4F5C]" />
  }
);

const Header = dynamic(
  () => import('@/components/layout/Header').then(mod => ({ default: mod.Header })),
  { 
    ssr: false,
    loading: () => <div className="h-16 bg-white border-b border-gray-100" />
  }
);

interface DashboardClientWrapperProps {
  children: React.ReactNode;
  userRole: UserRole;
}

export function DashboardClientWrapper({ children, userRole }: DashboardClientWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const pathname = usePathname();
  
  // Service persons and external users don't need sidebar - single dashboard approach
  const showSidebar = userRole !== 'SERVICE_PERSON' && userRole !== 'EXTERNAL_USER';

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Auto-collapse sidebar on desktop, but keep it as overlay on mobile
      if (!mobile && window.innerWidth < 1280) { // xl breakpoint
        setIsCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change and handle page transitions
  useEffect(() => {
    setSidebarOpen(false);
    // Trigger page transition animation
    setIsPageVisible(false);
    const timer = setTimeout(() => {
      setPageKey(prev => prev + 1);
      setIsPageVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white">
      {/* Animated background elements - more subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#6F8A9D]/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#96AEC2]/30/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#6F8A9D]/30/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Mobile overlay - using CSS transition instead of framer-motion */}
      {showSidebar && (
        <div
          className={cn(
            "fixed inset-0 z-[55] bg-[#546A7A]/40 backdrop-blur-[2px] print:hidden transition-opacity duration-300",
            sidebarOpen && isMobile ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - fixed position, no wrapper interference */}
      {showSidebar && (
        <div
          className={cn(
            "print:hidden transition-transform duration-300 ease-in-out",
            isMobile 
              ? (sidebarOpen ? "translate-x-0" : "-translate-x-full")
              : "hidden lg:block"
          )}
        >
          <Suspense fallback={<div className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-[#546A7A] to-[#3D4F5C] z-[60]" />}>
            <Sidebar 
              userRole={userRole}
              collapsed={!isMobile && isCollapsed}
              setCollapsed={setIsCollapsed}
              onClose={() => setSidebarOpen(false)}
            />
          </Suspense>
        </div>
      )}
      
      {/* Main content */}
      <div 
        className={cn(
          "flex flex-col h-screen overflow-hidden transition-all duration-500 ease-out relative z-10",
          // Conditional margins based on sidebar visibility and user role
          !showSidebar 
            ? "ml-0" // No sidebar for service persons
            : isMobile 
              ? "ml-0" // No margin on mobile (overlay sidebar)
              : isCollapsed 
                ? "lg:ml-[72px]" // Match sidebar collapsed width (72px)
                : "lg:ml-64"
        )}
      >
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100 flex-shrink-0" />}>
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            showSidebar={showSidebar}
            className="print:hidden flex-shrink-0"
          />
        </Suspense>
        
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className={cn(
            "min-h-full",
            // Reduced padding for more content width
            isMobile 
              ? "py-3 px-3" 
              : "py-4 px-4 lg:px-6"
          )}>
            {/* Page transition using CSS instead of framer-motion */}
            <div
              key={pageKey}
              className={cn(
                "transition-all duration-100 ease-out",
                isPageVisible 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-1"
              )}
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
