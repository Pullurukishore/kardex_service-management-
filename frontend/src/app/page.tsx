'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, Zap, ArrowRight } from 'lucide-react';
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
          // Redirect authenticated users to their dashboard
          const getRoleBasedRedirect = (role: string): string => {
            const normalizedRole = role.toUpperCase();
            switch (normalizedRole) {
              case 'ADMIN':
                return '/admin/dashboard';
              case 'ZONE_USER':
                return '/zone/dashboard';
              case 'SERVICE_PERSON':
                return '/service-person/dashboard';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      
      <div className="max-w-lg w-full relative z-10">
        {/* Main Card with Glass Effect */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 rounded-3xl blur-xl opacity-60" />
          
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 overflow-hidden">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 rounded-3xl" />
            
            {/* Content */}
            <div className="relative">
              {/* Logo with enhanced presentation */}
              <div className="mb-8 flex justify-center">
                <div className="relative group">
                  {/* Logo glow on hover */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-indigo-500/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                </div>
              </div>
              
              {/* Typography */}
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                  Ticket Management System
                </h1>
                <p className="text-slate-500 font-medium tracking-wide">
                  Streamlined service management solutions
                </p>
              </div>
              
              {/* Loading Section */}
              <div className="space-y-6">
                {/* Status with animated icon */}
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md animate-pulse" />
                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-2.5 shadow-lg">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  </div>
                  <span className="text-slate-700 font-semibold text-lg">{statusText}</span>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    {/* Animated progress fill */}
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                      {/* Shimmer effect on progress bar */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  
                  {/* Progress percentage */}
                  <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                    <span>Loading</span>
                    <span>{Math.round(Math.min(progress, 100))}%</span>
                  </div>
                </div>
                
                {/* Animated dots with better styling */}
                <div className="flex justify-center items-center gap-2 pt-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse shadow-sm"
                      style={{ 
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
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg">
            <Shield className="w-4 h-4 text-blue-300" />
            <span className="text-white/80 text-sm font-medium">Secure Access</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white/80 text-sm font-medium">Fast & Reliable</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg">
            <ArrowRight className="w-4 h-4 text-green-300" />
            <span className="text-white/80 text-sm font-medium">Auto Redirect</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-full border border-white/10">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </div>
            <p className="text-white/70 text-sm font-medium">
              Powered by intelligent automation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
