'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceLayoutProps {
  children: ReactNode;
}

const navItems = [
  { 
    href: '/finance/ar/dashboard', 
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1"/>
        <rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/>
        <rect width="7" height="5" x="3" y="16" rx="1"/>
      </svg>
    )
  },
  { 
    href: '/finance/ar/invoices', 
    label: 'Invoices',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  },
  { 
    href: '/finance/ar/customers', 
    label: 'Customers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  { 
    href: '/finance/ar/payment-terms', 
    label: 'Payment Terms',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    )
  },
  { 
    href: '/finance/ar/reports', 
    label: 'Reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  },
  { 
    href: '/finance/ar/import', 
    label: 'Import',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    )
  },
];

export default function FinanceARLayout({ children }: FinanceLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    router.push('/finance/select');
  };

  const handleLogout = async () => {
    localStorage.removeItem('selectedModule');
    localStorage.removeItem('selectedSubModule');
    await logout();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="app-container">
      <style jsx global>{`
        :root {
          --bg-primary: #0a0a1a;
          --bg-secondary: rgba(15, 15, 35, 0.7);
          --border-subtle: rgba(139, 92, 246, 0.25);
          --border-glow: rgba(139, 92, 246, 0.4);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.9);
          --text-muted: rgba(255, 255, 255, 0.5);
          --cyan-400: #22d3ee;
          --primary-500: #a855f7;
          --emerald-500: #10b981;
          --emerald-400: #34d399;
        }

        /* Global Text Enhancement - Bright White */
        .content {
          color: rgba(255, 255, 255, 1);
        }

        .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
          color: rgba(255, 255, 255, 1);
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
        }

        .content p, .content span, .content div, .content label {
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.15);
        }

        /* Enhanced table text - White */
        .content table th {
          color: rgba(255, 255, 255, 1);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
          font-weight: 600;
        }

        .content table td {
          color: rgba(255, 255, 255, 0.95);
        }

        /* Brighter links - White */
        .content a {
          color: rgba(255, 255, 255, 1);
        }

        .content a:hover {
          color: rgba(255, 255, 255, 1);
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
        }

        /* Enhanced labels and form text - White */
        .content input, .content select, .content textarea {
          color: rgba(255, 255, 255, 1);
        }

        .content input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .app-container {
          min-height: 100vh;
          background: 
            url('/finance-bg.png') no-repeat center center fixed;
          background-size: 100% 100%;
          position: relative;
          overflow: hidden;
        }

        .app-container::before {
          content: '';
          position: fixed;
          inset: 0;
          background: rgba(5, 5, 16, 0.05);
          pointer-events: none;
        }

        /* Animated Gradient Background */
        .app-container .bg-gradient {
          position: fixed;
          inset: 0;
          background: 
            linear-gradient(135deg, transparent 0%, rgba(34, 211, 238, 0.03) 50%, transparent 100%),
            linear-gradient(225deg, transparent 0%, rgba(139, 92, 246, 0.04) 50%, transparent 100%);
          animation: gradient-shift 15s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes gradient-shift {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        /* Aurora Effect - Top Right */
        .app-container .aurora-1 {
          position: fixed;
          top: -30%;
          right: -20%;
          width: 80%;
          height: 80%;
          background: 
            radial-gradient(ellipse at 20% 50%, rgba(34, 211, 238, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 30%, rgba(16, 185, 129, 0.20) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 55%);
          animation: aurora-move-1 20s ease-in-out infinite;
          filter: blur(60px);
          pointer-events: none;
        }

        /* Aurora Effect - Bottom Left */
        .app-container .aurora-2 {
          position: fixed;
          bottom: -30%;
          left: -20%;
          width: 80%;
          height: 80%;
          background: 
            radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.22) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 70%, rgba(245, 158, 11, 0.15) 0%, transparent 45%),
            radial-gradient(ellipse at 60% 30%, rgba(236, 72, 153, 0.12) 0%, transparent 55%);
          animation: aurora-move-2 25s ease-in-out infinite;
          filter: blur(60px);
          pointer-events: none;
        }

        /* Aurora Effect - Center */
        .app-container .aurora-3 {
          position: fixed;
          top: 20%;
          left: 30%;
          width: 60%;
          height: 60%;
          background: 
            radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 30% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
          animation: aurora-move-3 30s ease-in-out infinite;
          filter: blur(80px);
          pointer-events: none;
        }

        @keyframes aurora-move-1 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.8; }
          25% { transform: translate(-50px, 30px) scale(1.1) rotate(3deg); opacity: 1; }
          50% { transform: translate(30px, -40px) scale(0.95) rotate(-2deg); opacity: 0.7; }
          75% { transform: translate(-20px, 20px) scale(1.05) rotate(2deg); opacity: 0.9; }
        }

        @keyframes aurora-move-2 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.7; }
          33% { transform: translate(40px, -30px) scale(1.08) rotate(-3deg); opacity: 1; }
          66% { transform: translate(-30px, 40px) scale(0.92) rotate(4deg); opacity: 0.8; }
        }

        @keyframes aurora-move-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(-40px, 30px) scale(1.15); opacity: 0.8; }
        }

        /* Floating Orbs */
        .app-container .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
          opacity: 0.6;
        }

        .app-container .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%);
          top: 10%;
          right: 15%;
          animation: orb-float-1 18s ease-in-out infinite;
        }

        .app-container .orb-2 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%);
          bottom: 15%;
          left: 10%;
          animation: orb-float-2 22s ease-in-out infinite;
        }

        .app-container .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          animation: orb-float-3 15s ease-in-out infinite;
        }

        .app-container .orb-4 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%);
          top: 30%;
          left: 20%;
          animation: orb-float-4 20s ease-in-out infinite;
        }

        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 30px) scale(1.1); }
          50% { transform: translate(20px, -50px) scale(0.9); }
          75% { transform: translate(30px, 20px) scale(1.05); }
        }

        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -40px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.85); }
        }

        @keyframes orb-float-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(calc(-50% + 60px), calc(-50% - 40px)) scale(1.2); }
        }

        @keyframes orb-float-4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.1); }
        }

        /* Floating particles */
        .app-container .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .app-container .particle {
          position: absolute;
          border-radius: 50%;
          animation: particle-float 20s linear infinite;
        }

        @keyframes particle-float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }

        .app-wrapper {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 14px;
          gap: 12px;
          overflow: hidden;
        }

        /* Premium Header */
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          background: rgba(5, 5, 16, 0.05);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 18px;
          border: 1px solid rgba(139, 92, 246, 0.4);
          box-shadow: 
            0 0 30px rgba(139, 92, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          overflow: visible;
          position: relative;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-logo img {
          height: 34px;
          filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.3));
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 10px 20px;
          background: linear-gradient(135deg, rgba(15, 15, 35, 0.9) 0%, rgba(30, 20, 60, 0.7) 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.4px;
          box-shadow: 
            0 4px 24px rgba(139, 92, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        .header-badge::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: shimmer-badge 4s ease-in-out infinite;
        }

        @keyframes shimmer-badge {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .header-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .header-btn:hover {
          background: rgba(139, 92, 246, 0.15);
          color: var(--text-primary);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
          transform: translateY(-1px);
        }

        .header-avatar {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--emerald-400), var(--cyan-400));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
          position: relative;
        }

        .header-avatar::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--cyan-400), var(--emerald-400), var(--primary-500));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .header-avatar:hover::after {
          opacity: 0.5;
        }

        /* Main Layout */
        .app-main {
          display: flex;
          flex: 1;
          gap: 12px;
          min-height: 0;
          overflow: hidden;
        }

        /* Premium Sidebar */
        .sidebar {
          width: 210px;
          flex-shrink: 0;
          background: rgba(5, 5, 16, 0.05);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 18px;
          border: 1px solid rgba(139, 92, 246, 0.4);
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          box-shadow: 
            0 0 30px rgba(139, 92, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          position: relative;
          overflow: hidden;
        }

        /* Sidebar gradient line */
        .sidebar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20px;
          right: 20px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 16px;
          border-radius: 14px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: linear-gradient(180deg, var(--cyan-400), var(--emerald-400), var(--primary-500));
          border-radius: 0 4px 4px 0;
          transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px var(--cyan-400);
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.12), rgba(56, 189, 248, 0.06));
          border-color: rgba(139, 92, 246, 0.15);
        }

        .nav-item:hover::before {
          height: 24px;
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(34, 211, 238, 0.18) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(236, 72, 153, 0.08) 100%);
          color: var(--cyan-400);
          border: 1px solid rgba(34, 211, 238, 0.25);
          box-shadow: 
            0 0 25px rgba(34, 211, 238, 0.12),
            inset 0 0 25px rgba(34, 211, 238, 0.05);
        }

        .nav-item.active::before {
          height: 32px;
        }

        .nav-item .icon {
          display: flex;
          align-items: center;
          opacity: 0.85;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .nav-item:hover .icon {
          transform: scale(1.1);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 18px;
          border-top: 1px solid rgba(139, 92, 246, 0.15);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-footer .nav-item {
          opacity: 0.75;
        }

        .sidebar-footer .nav-item:hover {
          opacity: 1;
        }

        .sidebar-footer .nav-item.danger:hover {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08));
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.25);
        }

        .sidebar-version {
          padding: 10px 16px;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        /* Content Area */
        .content {
          flex: 1;
          min-width: 0;
          padding: 24px 28px;
          overflow-y: auto;
          overflow-x: hidden;
          background: rgba(5, 5, 16, 0.05);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 18px;
          border: 1px solid rgba(139, 92, 246, 0.4);
          box-shadow: 
            0 0 30px rgba(139, 92, 246, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          position: relative;
        }

        /* Content grid pattern */
        .content::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(rgba(139, 92, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          border-radius: inherit;
          pointer-events: none;
          opacity: 0.5;
        }

        /* Premium Scrollbar */
        .content::-webkit-scrollbar {
          width: 8px;
        }

        .content::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .content::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--emerald-400), var(--cyan-400));
          border-radius: 4px;
        }

        .content::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, var(--cyan-400), var(--primary-500));
        }
      `}</style>

      <div className="app-wrapper">
        {/* Animated Gradient Background */}
        <div className="bg-gradient" />
        
        {/* Aurora Effects */}
        <div className="aurora-1" />
        <div className="aurora-2" />
        <div className="aurora-3" />
        
        {/* Floating Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        
        {/* Floating Particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${12 + Math.random() * 18}s`,
                background: i % 5 === 0 
                  ? 'rgba(34, 211, 238, 0.6)' 
                  : i % 5 === 1 
                    ? 'rgba(139, 92, 246, 0.6)' 
                    : i % 5 === 2
                      ? 'rgba(16, 185, 129, 0.5)'
                      : i % 5 === 3
                        ? 'rgba(245, 158, 11, 0.5)'
                        : 'rgba(59, 130, 246, 0.5)',
              }}
            />
          ))}
        </div>

        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <div className="header-logo">
              <Image src="/kardex.png" alt="Kardex" width={110} height={34} priority />
            </div>
            <div className="header-badge">
              <span style={{ color: 'rgba(168, 85, 247, 1)' }}>Finance</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)', margin: '0 8px' }}>→</span>
              <span style={{ 
                background: 'linear-gradient(90deg, #22d3ee, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>AR Invoice Management</span>
            </div>
          </div>
          <div className="header-right">
            <button className="header-btn" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </button>
            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="header-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'F'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-medium text-white">{user?.name || 'Finance User'}</div>
                  <div className="text-xs text-purple-400">{(user as any)?.financeRole || 'FINANCE_USER'}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {userMenuOpen && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div 
                    className="absolute right-0 top-full mt-2 w-56 py-2 bg-[#1a1a2e] rounded-xl border border-purple-500/20 shadow-2xl z-50"
                    style={{ backdropFilter: 'blur(20px)' }}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-sm font-medium text-white">{user?.name || 'Finance User'}</div>
                      <div className="text-xs text-white/40">{user?.email || 'user@kardex.com'}</div>
                      <div className="text-xs text-purple-400 mt-1">{(user as any)?.financeRole || 'FINANCE_USER'}</div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); handleBack(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m12 19-7-7 7-7"/>
                          <path d="M19 12H5"/>
                        </svg>
                        Switch Module
                      </button>
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="app-main">
          {/* Sidebar */}
          <aside className="sidebar">
            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="sidebar-footer">
              <button onClick={handleBack} className="nav-item">
                <span className="icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 19-7-7 7-7"/>
                    <path d="M19 12H5"/>
                  </svg>
                </span>
                <span>Back</span>
              </button>
              <button onClick={handleLogout} className="nav-item danger">
                <span className="icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                <span>Exit</span>
              </button>

            </div>
          </aside>

          {/* Content */}
          <div className="content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
