'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationLoadingProps {
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

export const NavigationLoadingOverlay: React.FC<NavigationLoadingProps> = ({
  isLoading = false,
  loadingText = "Loading...",
  className
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm",
        "animate-fade-in",
        className
      )}
    >
      <div
        className="flex flex-col items-center space-y-4 p-8 bg-white/90 rounded-2xl shadow-2xl border border-[#92A2A5]/60 animate-scale-in"
      >
        {/* Animated loader with sparkles */}
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-[#546A7A]" />
          <div className="absolute -inset-2 animate-spin-slow">
            <Sparkles className="h-3 w-3 text-[#6F8A9D] absolute top-0 left-0" />
            <Sparkles className="h-2 w-2 text-[#96AEC2] absolute bottom-0 right-0" />
          </div>
        </div>
        
        {/* Loading text */}
        <p className="text-sm font-medium text-[#5D6E73] animate-fade-in-up">
          {loadingText}
        </p>
        
        {/* Progress bar */}
        <div className="w-32 h-1 bg-[#92A2A5]/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
};

interface NavItemLoadingProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const NavItemLoading: React.FC<NavItemLoadingProps> = ({
  isLoading = false,
  children,
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-4 bg-gradient-to-r from-transparent via-white/60 to-white/80 rounded-xl backdrop-blur-sm animate-fade-in"
        >
          <Loader2 className="h-4 w-4 animate-spin text-[#546A7A]" />
        </div>
      )}
    </div>
  );
};

export const NavItemSkeleton: React.FC<{ isMobile?: boolean; collapsed?: boolean }> = ({
  isMobile = false,
  collapsed = false
}) => {
  return (
    <div className={cn(
      "flex items-center rounded-xl bg-[#AEBFC3]/20 animate-pulse",
      isMobile ? "px-4 py-4 min-h-[56px]" : "px-3 py-3 h-12"
    )}>
      <div className={cn(
        "rounded-lg bg-[#92A2A5]/30",
        isMobile ? "h-6 w-6" : "h-5 w-5"
      )} />
      {(!collapsed || isMobile) && (
        <div className={cn(
          "bg-[#92A2A5]/30 rounded",
          isMobile ? "ml-4 h-4 w-32" : "ml-3 h-3 w-24"
        )} />
      )}
    </div>
  );
};

interface LoadingProgressProps {
  progress: number;
  className?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress,
  className
}) => {
  return (
    <div className={cn("w-full h-1 bg-[#92A2A5]/30 rounded-full overflow-hidden", className)}>
      <div
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        className="h-full bg-gradient-to-r from-[#6F8A9D] to-[#6F8A9D] rounded-full transition-all duration-300 ease-out"
      />
    </div>
  );
};

export const PulseLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-[#96AEC2] rounded-full animate-pulse-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
};
