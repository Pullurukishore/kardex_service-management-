'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FileText, Landmark, ArrowRight, ArrowLeft, Lock, Sparkles } from 'lucide-react';

interface SubModuleCard {
  id: 'ar' | 'accounting';
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
  glowColor: string;
  disabled?: boolean;
  comingSoon?: boolean;
}

// Particle component for animated background
const Particles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
      tx: (Math.random() - 0.5) * 200,
      ty: (Math.random() - 0.5) * 200,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 
              ? 'rgba(34, 211, 238, 0.6)' 
              : p.id % 3 === 1 
                ? 'rgba(168, 85, 247, 0.6)' 
                : 'rgba(236, 72, 153, 0.5)',
            animation: `particle-drift ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px currentColor`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}
      <style jsx>{`
        @keyframes particle-drift {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(var(--tx), var(--ty)) scale(1.5);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default function FinanceSelectPage() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Verify user selected Finance module
    const selectedModule = localStorage.getItem('selectedModule');
    if (selectedModule !== 'finance') {
      router.push('/module-select');
    }
  }, [router]);

  const subModules: SubModuleCard[] = [
    {
      id: 'ar',
      title: 'Accounts Receivable',
      description: 'Manage invoices, customer payments, and collections with intelligent insights',
      icon: <FileText className="w-10 h-10 text-white drop-shadow-lg" />,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      shadowColor: 'rgba(139, 92, 246, 0.5)',
      glowColor: 'rgba(139, 92, 246, 0.3)',
    },
    {
      id: 'accounting',
      title: 'Bank Accounts',
      description: 'Manage bank accounts, transactions, and reconciliation seamlessly',
      icon: <Landmark className="w-10 h-10 text-white drop-shadow-lg" />,
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
      shadowColor: 'rgba(251, 146, 60, 0.5)',
      glowColor: 'rgba(251, 146, 60, 0.3)',
      disabled: true,
      comingSoon: true
    }
  ];

  const handleSubModuleSelect = (subModuleId: string) => {
    const module = subModules.find(m => m.id === subModuleId);
    if (module?.disabled) return;

    setSelectedModule(subModuleId);
    // Store sub-module selection
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSubModule', subModuleId);
    }
    // Redirect to appropriate dashboard
    setTimeout(() => {
      if (subModuleId === 'ar') {
        router.push('/finance/ar/dashboard');
      } else {
        router.push('/finance/accounting/dashboard');
      }
    }, 600);
  };

  const handleBack = () => {
    localStorage.removeItem('selectedModule');
    router.push('/module-select');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4 overflow-hidden relative">
      {/* Premium Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950" />
        
        {/* Animated orbs */}
        <div className="absolute -top-1/4 -right-1/4 w-[60%] h-[60%] bg-gradient-radial from-cyan-500/20 via-cyan-500/5 to-transparent rounded-full blur-3xl animate-pulse" 
          style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-1/4 -left-1/4 w-[70%] h-[70%] bg-gradient-radial from-fuchsia-500/20 via-fuchsia-500/5 to-transparent rounded-full blur-3xl animate-pulse" 
          style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-gradient-radial from-violet-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" 
          style={{ animationDuration: '6s', animationDelay: '2s' }} />
        
        {/* Particles */}
        <Particles />
        
        {/* Premium grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Modules</span>
        </button>

        {/* Header */}
        <div className="text-center mb-14">
          <div className="mb-6 relative inline-block">
            <Image 
              src="/kardex.png" 
              alt="Kardex" 
              width={180} 
              height={72} 
              className="mx-auto brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
              priority 
            />
          </div>
          
          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-pink-500/20 border border-purple-500/30 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="finance-gradient-text text-sm font-semibold tracking-wide">Finance Module</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Choose Your <span className="finance-gradient-text">Workspace</span>
          </h1>
          <p className="text-purple-200/60 text-lg max-w-md mx-auto">
            Select which area you want to work on today
          </p>
        </div>

        {/* Sub-Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {subModules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => handleSubModuleSelect(module.id)}
              onMouseEnter={() => !module.disabled && setHoveredModule(module.id)}
              onMouseLeave={() => setHoveredModule(null)}
              disabled={selectedModule !== null || module.disabled}
              className={`
                relative group text-left p-8 rounded-3xl
                bg-white/[0.03] backdrop-blur-xl
                border border-white/10
                transition-all duration-500 ease-out
                ${hoveredModule === module.id ? 'scale-[1.02] border-white/20' : ''}
                ${selectedModule === module.id ? 'scale-[0.98] opacity-50' : ''}
                ${selectedModule && selectedModule !== module.id ? 'opacity-30 pointer-events-none' : ''}
                ${module.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/[0.06]'}
                disabled:cursor-not-allowed
              `}
              style={{
                boxShadow: hoveredModule === module.id 
                  ? `0 25px 60px ${module.shadowColor}, 0 0 60px ${module.glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Coming Soon Badge */}
              {module.comingSoon && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 backdrop-blur-sm">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400 tracking-wide">Coming Soon</span>
                </div>
              )}

              {/* Gradient overlay on hover */}
              <div className={`
                absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500
                bg-gradient-to-br ${module.gradient}
                ${hoveredModule === module.id ? 'opacity-[0.08]' : ''}
              `} />

              {/* Top gradient line on hover */}
              <div className={`
                absolute top-0 left-8 right-8 h-px transition-opacity duration-500
                bg-gradient-to-r from-transparent ${module.id === 'ar' ? 'via-purple-500' : 'via-amber-500'} to-transparent
                ${hoveredModule === module.id ? 'opacity-100' : 'opacity-0'}
              `} />

              {/* Icon with enhanced styling */}
              <div className={`
                w-20 h-20 rounded-2xl mb-6
                bg-gradient-to-br ${module.gradient}
                flex items-center justify-center
                transition-all duration-500 ease-out
                ${hoveredModule === module.id ? 'scale-110 rotate-3' : ''}
                ${module.disabled ? 'opacity-50' : ''}
              `}
              style={{ 
                boxShadow: module.disabled ? 'none' : `0 10px 40px ${module.shadowColor}, 0 0 20px ${module.glowColor}`,
              }}
              >
                {module.icon}
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-3 relative z-10 tracking-tight">
                {module.title}
              </h2>
              <p className="text-purple-200/50 mb-6 relative z-10 leading-relaxed">
                {module.description}
              </p>

              {/* Arrow with enhanced animation */}
              {!module.disabled && (
                <div className={`
                  flex items-center gap-2 text-white/40 
                  transition-all duration-300 relative z-10
                  ${hoveredModule === module.id ? 'text-white translate-x-2' : ''}
                `}>
                  <span className="text-sm font-semibold tracking-wide">Enter {module.title.split(' ')[0]}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${hoveredModule === module.id ? 'translate-x-1' : ''}`} />
                </div>
              )}

              {/* Loading indicator with gradient */}
              {selectedModule === module.id && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/60 backdrop-blur-sm">
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div 
                        key={i}
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-14">
          <p className="text-white/30 text-xs tracking-wider">
            © {new Date().getFullYear()} KARDEX REMSTAR. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
