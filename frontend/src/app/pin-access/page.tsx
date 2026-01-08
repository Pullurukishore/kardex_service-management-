'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, AlertCircle, CheckCircle, Key, Loader2, Delete, Fingerprint } from 'lucide-react';
import Image from 'next/image';
import { apiClient } from '@/lib/api/api-client';

// Type definitions
interface PinSession {
  sessionId: string;
  expiresAt: string;
}

interface PinValidationResponse {
  success: boolean;
  message?: string;
  error?: string;
  sessionId?: string;
  expiresAt?: string;
  attemptsLeft?: number;
  lockedUntil?: string;
  code?: string;
}

// Storage keys
const LOCAL_STORAGE_KEY = 'pinAccessSession';
const LOCKOUT_STORAGE_KEY = 'pinLockoutInfo';

interface LockoutInfo {
  isLocked: boolean;
  lockedUntil: string;
  timestamp: number;
}

// Storage helpers
const getLocalSession = (): PinSession | null => {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        const session = JSON.parse(data) as PinSession;
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          return session;
        }
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  } catch {}
  return null;
};

const setLocalSession = (session: PinSession): boolean => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
      return true;
    }
  } catch {}
  return false;
};

const getLockoutInfo = (): LockoutInfo | null => {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LOCKOUT_STORAGE_KEY);
      if (data) {
        const lockoutInfo = JSON.parse(data) as LockoutInfo;
        if (lockoutInfo.lockedUntil && new Date(lockoutInfo.lockedUntil) > new Date()) {
          return lockoutInfo;
        }
        localStorage.removeItem(LOCKOUT_STORAGE_KEY);
      }
    }
  } catch {}
  return null;
};

const setLockoutInfo = (lockoutInfo: LockoutInfo): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(lockoutInfo));
    }
  } catch {}
};

const clearLockoutInfo = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCKOUT_STORAGE_KEY);
    }
  } catch {}
};

export default function PinAccessPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<string | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const router = useRouter();
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Keypad layout
  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete']
  ];

  // Pre-generate particles for background
  const floatingParticles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 15 + 20
    })), []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize PIN status
  useEffect(() => {
    if (!mounted) return;

    const initializePinStatus = async () => {
      try {
        const localLockout = getLockoutInfo();
        if (localLockout) {
          setIsLocked(true);
          setLockoutTime(localLockout.lockedUntil);
        }

        const response = await apiClient.get('/auth/pin-status');
        if (response.data) {
          setAttemptsLeft(response.data.attemptsLeft || 5);
          if (response.data.lockedUntil && !localLockout) {
            setIsLocked(true);
            setLockoutTime(response.data.lockedUntil);
            setLockoutInfo({
              isLocked: true,
              lockedUntil: response.data.lockedUntil,
              timestamp: Date.now()
            });
          } else if (!response.data.lockedUntil && !localLockout) {
            clearLockoutInfo();
            setIsLocked(false);
            setLockoutTime(null);
          }
        }
      } catch {
        const localLockout = getLockoutInfo();
        if (localLockout) {
          setIsLocked(true);
          setLockoutTime(localLockout.lockedUntil);
        }
      }
    };

    initializePinStatus();
  }, [mounted]);

  // Lockout countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTime) {
      interval = setInterval(() => {
        const now = new Date();
        const lockoutEnd = new Date(lockoutTime);
        const timeLeft = lockoutEnd.getTime() - now.getTime();
        
        if (timeLeft <= 0) {
          setIsLocked(false);
          setLockoutTime(null);
          setLockoutCountdown('');
          clearLockoutInfo();
        } else {
          const minutes = Math.floor(timeLeft / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setLockoutCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isLocked, lockoutTime]);

  // Check existing session
  useEffect(() => {
    if (!mounted) return;

    const checkPinSession = async () => {
      if (isLocked) {
        setChecking(false);
        return;
      }
      
      try {
        let hasValidSession = false;
        try {
          const allCookies = document.cookie.split('; ');
          const pinSession = allCookies.find(row => row.startsWith('pinSession='));
          if (pinSession) hasValidSession = true;
        } catch {}
        
        if (!hasValidSession) {
          const localSession = getLocalSession();
          if (localSession?.sessionId) hasValidSession = true;
        }
        
        if (hasValidSession) {
          router.push('/module-select');
          return;
        }
        setChecking(false);
      } catch {
        setChecking(false);
      }
    };

    checkPinSession();
  }, [router, isLocked, mounted]);

  // Handle keypad press
  const handleKeyPress = useCallback((key: string) => {
    if (loading || success || isLocked) return;
    
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);
    
    if (key === 'delete') {
      setPin(prev => prev.slice(0, -1));
      setError('');
    } else if (key && pin.length < 6) {
      setPin(prev => prev + key);
      setError('');
    }
  }, [loading, success, isLocked, pin.length]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (loading || success || isLocked) return;
    
    if (e.key >= '0' && e.key <= '9') {
      handleKeyPress(e.key);
    } else if (e.key === 'Backspace') {
      handleKeyPress('delete');
    } else if (e.key === 'Enter' && pin.length === 6) {
      handleSubmit();
    }
  }, [handleKeyPress, loading, success, isLocked, pin.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSubmit = async () => {
    if (loading || success || pin.length !== 6) return;
    
    setLoading(true);
    setError('');

    try {
      const apiResponse = await apiClient.post<PinValidationResponse>('/auth/validate-pin', { pin }, {
        headers: { 'X-Skip-Global-Error-Handler': 'true' }
      });

      const response = (apiResponse.data || apiResponse) as PinValidationResponse;

      if (response?.success === true) {
        setSuccess(true);
        clearLockoutInfo();
        setIsLocked(false);
        setLockoutTime(null);
        
        const { sessionId, expiresAt } = response;
        if (sessionId && expiresAt) {
          setLocalSession({ sessionId, expiresAt });
        }
        
        setTimeout(() => {
          try {
            const allCookies = document.cookie.split('; ');
            const pinSession = allCookies.find(c => c.startsWith('pinSession='));
            if (!pinSession && response.sessionId) {
              apiClient.setPinSession(response.sessionId);
            }
          } catch {}
          router.push('/module-select');
        }, 1500);
      } else {
        triggerError(response?.error || response?.message || 'Invalid PIN');
        if (typeof response?.attemptsLeft === 'number') {
          setAttemptsLeft(response.attemptsLeft);
        }
      }
    } catch (error: any) {
      let errorMessage = 'Invalid PIN. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many attempts. Please wait.';
      } else if (error.response?.status) {
        errorMessage = `Server error. Please try again.`;
      }
      
      if (error.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(error.response.data.attemptsLeft);
      }
      
      if (error.response?.data?.lockedUntil) {
        setIsLocked(true);
        setLockoutTime(error.response.data.lockedUntil);
        setLockoutInfo({
          isLocked: true,
          lockedUntil: error.response.data.lockedUntil,
          timestamp: Date.now()
        });
      }
      
      triggerError(errorMessage);
    }
  };

  const triggerError = (message: string) => {
    setError(message);
    setShake(true);
    setPin('');
    setLoading(false);
    setTimeout(() => setShake(false), 500);
  };

  // Loading screen
  if (!mounted || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
        <Card className="border-0 shadow-2xl rounded-3xl bg-white/10 backdrop-blur-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Image src="/kardex.png" alt="Kardex" width={180} height={72} className="mx-auto brightness-0 invert" priority />
            </div>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 animate-spin" style={{ clipPath: 'inset(0 0 50% 0)' }}></div>
              <div className="absolute inset-2 rounded-full bg-slate-900"></div>
              <Shield className="absolute inset-0 m-auto h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Initializing Security</h3>
            <p className="text-blue-200/70 text-sm">Verifying access permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
        {floatingParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white/10"
            style={{
              width: p.size,
              height: p.size,
              top: `${p.top}%`,
              left: `${p.left}%`,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className={`border-0 shadow-2xl rounded-3xl bg-white/10 backdrop-blur-xl overflow-hidden transition-transform duration-500 ${shake ? 'animate-shake' : ''}`}>
          {/* Header */}
          <CardHeader className="text-center pt-8 pb-4 px-8">
            <div className="mb-4">
              <Image src="/kardex.png" alt="Kardex" width={160} height={64} className="mx-auto brightness-0 invert drop-shadow-lg" priority />
            </div>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Fingerprint className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Secure Access</CardTitle>
            <CardDescription className="text-blue-200/70">Enter your 6-digit security PIN</CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-4 relative">
            {/* Success Overlay */}
            {success && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Access Granted!</h3>
                  <p className="text-emerald-300/80">Redirecting to login...</p>
                  <div className="flex justify-center gap-2 mt-6">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && !success && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl">
                <div className="text-center p-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
                    <Lock className="absolute inset-0 m-auto h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Verifying PIN</h3>
                  <p className="text-blue-200/70 text-sm">Please wait...</p>
                </div>
              </div>
            )}

            {/* PIN Display */}
            <div className="flex justify-center gap-3 mb-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isLocked
                      ? 'bg-red-500/20 border-2 border-red-500/50'
                      : pin.length > i
                      ? 'bg-gradient-to-br from-blue-500 to-emerald-500 border-2 border-blue-400 shadow-lg shadow-blue-500/30 scale-110'
                      : pin.length === i
                      ? 'bg-blue-500/20 border-2 border-blue-400 animate-pulse'
                      : 'bg-white/5 border-2 border-white/20'
                  }`}
                >
                  {pin.length > i ? (
                    <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/30"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-red-200 rounded-2xl">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {/* Lockout Warning */}
            {isLocked && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/50">
                <div className="flex items-center justify-center gap-2 text-red-300 mb-2">
                  <Lock className="h-5 w-5" />
                  <span className="font-semibold">Account Locked</span>
                </div>
                {lockoutCountdown && (
                  <div className="text-center">
                    <span className="text-3xl font-mono font-bold text-red-400">{lockoutCountdown}</span>
                    <p className="text-xs text-red-300/70 mt-1">Please wait before trying again</p>
                  </div>
                )}
              </div>
            )}

            {/* Attempts Warning */}
            {!isLocked && attemptsLeft < 5 && attemptsLeft > 0 && (
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {attemptsLeft} attempts remaining
                </span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {keypadRows.flat().map((key, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={loading || success || isLocked || (key === '' )}
                  onClick={() => key && handleKeyPress(key)}
                  className={`h-16 rounded-2xl font-bold text-2xl transition-all duration-150 ${
                    key === ''
                      ? 'invisible'
                      : key === 'delete'
                      ? `bg-white/10 text-white/80 hover:bg-red-500/30 active:scale-95 ${activeKey === key ? 'bg-red-500/30 scale-95' : ''}`
                      : `bg-white/10 text-white hover:bg-white/20 active:scale-95 shadow-lg ${activeKey === key ? 'bg-white/30 scale-95' : ''}`
                  } ${(loading || success || isLocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {key === 'delete' ? <Delete className="h-6 w-6 mx-auto" /> : key}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={pin.length !== 6 || loading || success || isLocked}
              className={`w-full h-14 mt-6 font-bold text-lg rounded-2xl transition-all duration-300 ${
                pin.length === 6 && !loading && !success && !isLocked
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              {success ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Access Granted
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Verifying...
                </span>
              ) : isLocked ? (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-5 w-5" /> Locked
                </span>
              ) : pin.length === 6 ? (
                <span className="flex items-center justify-center gap-2">
                  <Key className="h-5 w-5" /> Continue
                </span>
              ) : (
                `Enter ${6 - pin.length} more digit${6 - pin.length !== 1 ? 's' : ''}`
              )}
            </Button>

            {/* Keyboard hint */}
            {!isLocked && (
              <p className="text-center text-white/40 text-xs mt-4">
                You can also use your keyboard to enter the PIN
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Kardex. Secured with end-to-end encryption.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.7; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.9; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
