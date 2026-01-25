'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Update status text based on loading state
    if (isLoading) {
      setStatusText('Authenticating...');
    } else if (isAuthenticated && user) {
      setStatusText(`Welcome back, ${user.name || 'User'}!`);
      setProgress(100);
    } else {
      setStatusText('Redirecting to login...');
      setProgress(100);
    }
  }, [isLoading, isAuthenticated, user]);

  useEffect(() => {
    // Add a small delay to prevent conflicts with server-side redirects
    const redirectTimer = setTimeout(() => {
      // Only redirect after auth state is fully initialized
      if (!isLoading) {
        if (isAuthenticated && user) {
          // Check for finance role first
          if (user.financeRole) {
             if (typeof window !== 'undefined') {
                // If user has a selected module, might want to go there, but safe default is select
                // or check localStorage for last accessed module if we wanted to be fancy
                const selectedModule = localStorage.getItem('selectedModule');
                if (selectedModule === 'finance') {
                    window.location.href = '/finance/select'; // Or specific finance dashboard
                } else {
                    window.location.href = '/finance/select';
                }
             }
             return;
          }

          // Redirect authenticated FSM users to their dashboard
          const getRoleBasedRedirect = (role: string | null | undefined): string => {
            if (!role) return '/auth/login';
            const normalizedRole = role.toUpperCase();
            switch (normalizedRole) {
              case 'ADMIN':
                return '/admin/dashboard';
              case 'ZONE_MANAGER':
                return '/zone-manager/dashboard';
              case 'ZONE_USER':
                return '/zone/dashboard';
              case 'SERVICE_PERSON':
                return '/service-person/dashboard';
              case 'EXPERT_HELPDESK':
                return '/expert/dashboard';
              case 'EXTERNAL_USER':
                return '/external/tickets';
              default:
                return '/auth/login';
            }
          };
          
          const redirectPath = getRoleBasedRedirect(user.role);
          // Use window.location for more reliable redirect
          if (typeof window !== 'undefined') {
            window.location.href = redirectPath;
          }
        } else {
          // Redirect unauthenticated users to login
          // Use window.location for more reliable redirect
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }
    }, 500); // Small delay for smoother transition

    return () => clearTimeout(redirectTimer);
  }, [isLoading, isAuthenticated, user]);

  // Show loading spinner while determining authentication status
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-white to-[#96AEC2]/15 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs with Kardex colors */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#96AEC2]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#82A094]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#CE9F6B]/10 to-[#A2B9AF]/10 rounded-full blur-3xl" />
        
        {/* Decorative dots */}
        <div className="absolute top-20 right-20 w-3 h-3 rounded-full bg-[#96AEC2]/50 animate-pulse" />
        <div className="absolute bottom-32 left-32 w-2 h-2 rounded-full bg-[#82A094]/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-[#CE9F6B]/50 animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-100" style={{
          backgroundImage: 'linear-gradient(rgba(150,174,194,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(150,174,194,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <div className="max-w-lg w-full relative z-10">
        {/* Main Card with Glass Effect */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#96AEC2]/30 via-[#82A094]/30 to-[#CE9F6B]/30 rounded-3xl blur-xl opacity-60" />
          
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#96AEC2]/20 border border-[#96AEC2]/20 p-10 overflow-hidden">
            {/* Decorative top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#96AEC2] via-[#82A094] to-[#CE9F6B]" />
            
            {/* Content */}
            <div className="relative">
              {/* Logo with enhanced presentation */}
              <div className="mb-8 flex justify-center">
                <div className="relative group">
                  <Image
                    src="/kardex.png"
                    alt="Kardex Logo"
                    width={260}
                    height={104}
                    className="relative z-10 drop-shadow-md"
                    priority
                  />
                </div>
              </div>
              
              {/* Elegant divider with icon */}
              <div className="relative mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-[#AEBFC3] to-transparent" />
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#96AEC2] to-[#6F8A9D] flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Typography */}
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#546A7A] via-[#6F8A9D] to-[#546A7A] bg-clip-text text-transparent mb-3">
                  Ticket Management System
                </h1>
                <p className="text-[#92A2A5] font-medium tracking-wide">
                  Streamlined service management solutions
                </p>
              </div>
              
              {/* Loading Section */}
              <div className="space-y-6">
                {/* Status with animated icon */}
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#96AEC2]/30 rounded-full blur-md animate-pulse" />
                    <div className="relative bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-full p-2.5 shadow-lg shadow-[#6F8A9D]/30">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  </div>
                  <span className="text-[#546A7A] font-semibold text-lg">{statusText}</span>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="h-3 bg-[#AEBFC3]/20 rounded-full overflow-hidden shadow-inner">
                    {/* Animated progress fill */}
                    <div 
                      className="h-full bg-gradient-to-r from-[#96AEC2] via-[#82A094] to-[#6F8A9D] rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                      {/* Shimmer effect on progress bar */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  
                  {/* Progress percentage */}
                  <div className="flex justify-between mt-2 text-xs font-medium text-[#92A2A5]">
                    <span>Loading</span>
                    <span className="text-[#6F8A9D] font-bold">{Math.round(Math.min(progress, 100))}%</span>
                  </div>
                </div>
                
                {/* Animated dots */}
                <div className="flex justify-center items-center gap-2 pt-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-pulse shadow-sm"
                      style={{ 
                        background: i % 2 === 0 ? '#96AEC2' : '#82A094',
                        animationDelay: `${i * 0.15}s`,
                        opacity: 1 - (i * 0.15)
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature Pills */}
        <div className="flex justify-center gap-3 mt-8 flex-wrap">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-[#96AEC2]/30 shadow-lg shadow-[#96AEC2]/10">
            <Shield className="w-4 h-4 text-[#6F8A9D]" />
            <span className="text-[#546A7A] text-sm font-medium">Secure Access</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-[#CE9F6B]/30 shadow-lg shadow-[#CE9F6B]/10">
            <Zap className="w-4 h-4 text-[#CE9F6B]" />
            <span className="text-[#546A7A] text-sm font-medium">Fast & Reliable</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 border border-[#82A094]/30 shadow-lg shadow-[#82A094]/10">
            <ArrowRight className="w-4 h-4 text-[#82A094]" />
            <span className="text-[#546A7A] text-sm font-medium">Auto Redirect</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full border border-[#AEBFC3]/30 shadow-md">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#82A094] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#82A094]" />
            </div>
            <p className="text-[#5D6E73] text-sm font-medium">
              Powered by intelligent automation
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
