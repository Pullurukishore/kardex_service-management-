'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Ticket, Package, ChevronRight, ArrowLeft } from 'lucide-react';

interface SubModuleCard {
  id: 'tickets' | 'offers';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}

const subModules: SubModuleCard[] = [
  {
    id: 'tickets',
    title: 'Tickets',
    subtitle: 'Service requests & field visits',
    icon: <Ticket className="w-8 h-8" />,
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
  },
  {
    id: 'offers',
    title: 'Offers',
    subtitle: 'Sales funnel & targets',
    icon: <Package className="w-8 h-8" />,
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
  }
];

export default function FSMSelectPage() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const selectedMod = localStorage.getItem('selectedModule');
    if (selectedMod !== 'fsm') {
      router.push('/module-select');
    }
  }, [router]);

  const handleSubModuleSelect = (subModuleId: string) => {
    setSelectedModule(subModuleId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSubModule', subModuleId);
    }
    setTimeout(() => {
      if (subModuleId === 'tickets') {
        router.push('/admin/dashboard');
      } else {
        router.push('/admin/offers');
      }
    }, 400);
  };

  const handleBack = () => {
    localStorage.removeItem('selectedModule');
    router.push('/module-select');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] p-6 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/8 via-blue-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/8 via-green-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(100,100,200,0.03),transparent_70%)]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Logo & Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Image 
              src="/kardex.png" 
              alt="Kardex" 
              width={160} 
              height={64} 
              className="mx-auto brightness-0 invert opacity-90" 
              priority 
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
            <span className="text-white/50 text-xs font-medium tracking-wide">Field Service Management</span>
          </div>
          <h1 className="text-2xl font-medium text-white/90 tracking-wide">
            Select Workspace
          </h1>
        </div>

        {/* Sub-Module Cards */}
        <div className="flex flex-col gap-4">
          {subModules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleSubModuleSelect(module.id)}
              onMouseEnter={() => setHoveredModule(module.id)}
              onMouseLeave={() => setHoveredModule(null)}
              disabled={selectedModule !== null}
              className={`
                relative group flex items-center gap-6 p-6 rounded-2xl
                bg-white/[0.03] backdrop-blur-sm
                border border-white/[0.06]
                transition-all duration-300 ease-out
                ${hoveredModule === module.id ? 'bg-white/[0.06] border-white/[0.12] translate-x-1' : ''}
                ${selectedModule === module.id ? 'opacity-60 scale-[0.99]' : ''}
                ${selectedModule && selectedModule !== module.id ? 'opacity-30' : ''}
                disabled:cursor-not-allowed
              `}
            >
              {/* Icon */}
              <div className={`
                relative w-16 h-16 rounded-xl flex items-center justify-center
                bg-gradient-to-br ${module.gradient}
                shadow-lg transition-all duration-300
                ${hoveredModule === module.id ? 'scale-110 shadow-xl' : ''}
              `}>
                <div className="text-white">
                  {module.icon}
                </div>
                {/* Glow effect */}
                <div className={`
                  absolute inset-0 rounded-xl bg-gradient-to-br ${module.gradient}
                  blur-xl opacity-0 transition-opacity duration-300
                  ${hoveredModule === module.id ? 'opacity-40' : ''}
                `} />
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <h2 className="text-xl font-semibold text-white/95">
                  {module.title}
                </h2>
                <p className="text-sm text-white/40 mt-0.5">
                  {module.subtitle}
                </p>
              </div>

              {/* Arrow */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                bg-white/[0.04] border border-white/[0.06]
                transition-all duration-300
                ${hoveredModule === module.id ? 'bg-white/[0.08] border-white/[0.12]' : ''}
              `}>
                <ChevronRight className={`
                  w-5 h-5 text-white/40 transition-all duration-300
                  ${hoveredModule === module.id ? 'text-white/80 translate-x-0.5' : ''}
                `} />
              </div>

              {/* Loading */}
              {selectedModule === module.id && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Kardex
          </p>
        </div>
      </div>
    </div>
  );
}
