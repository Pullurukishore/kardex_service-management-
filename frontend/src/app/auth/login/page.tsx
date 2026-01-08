"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CheckCircle2, Mail, Lock, Shield, Eye, EyeOff, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Get module from URL params
  const moduleParam = searchParams.get('module');
  const moduleLabels: Record<string, string> = {
    fsm: 'Field Service Management',
    finance: 'Finance'
  };

  // Pre-generate particles for background
  const floatingParticles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: Math.random() * 15 + 20
    })), []
  );

  // Get module-based redirect
  const getModuleBasedRedirect = (): string => {
    const selectedModule = moduleParam || localStorage.getItem('selectedModule');
    if (selectedModule === 'finance') {
      return '/finance/select';
    } else if (selectedModule === 'fsm') {
      return '/fsm/select';
    }
    // Default fallback - check user role
    return '/fsm/select';
  };

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      router.replace(getModuleBasedRedirect());
    }
  }, [isAuthenticated, user, isLoading, router, moduleParam]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  // Check session expiration
  useEffect(() => {
    const sessionExpired = sessionStorage.getItem('sessionExpired');
    const sessionExpiredReason = sessionStorage.getItem('sessionExpiredReason');
    
    if (sessionExpired === 'true') {
      let message = 'Your session has expired. Please login again.';
      if (sessionExpiredReason === 'REFRESH_TOKEN_EXPIRED') {
        message = 'Your session has expired due to inactivity. Please login again.';
      } else if (sessionExpiredReason === 'NO_REFRESH_TOKEN') {
        message = 'Your session is no longer valid. Please login again.';
      }
      
      toast({
        title: "Session Expired",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
      
      sessionStorage.removeItem('sessionExpired');
      sessionStorage.removeItem('sessionExpiredReason');
    }
  }, []);

  // Load saved credentials
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const savedPassword = localStorage.getItem('rememberedPassword');
      const wasRemembered = localStorage.getItem('wasRemembered') === 'true';
      
      if (savedEmail && savedPassword && wasRemembered) {
        form.reset({ email: savedEmail, password: savedPassword, rememberMe: true });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [form]);

  const onSubmit = async (values: LoginFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const result = await login(values.email, values.password, values.rememberMe);
      
      if (result.success) {
        if (values.rememberMe) {
          localStorage.setItem('rememberedEmail', values.email);
          localStorage.setItem('rememberedPassword', values.password);
          localStorage.setItem('wasRemembered', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('wasRemembered');
        }
        setLoginSuccess(true);
        setTimeout(() => setLoginSuccess(false), 2000);
      } else {
        triggerError(result.error || "Invalid credentials");
      }
    } catch (error: any) {
      triggerError(error?.response?.data?.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerError = (message: string) => {
    setShake(true);
    toast({
      title: "Login failed",
      description: message,
      variant: "destructive",
    });
    setTimeout(() => setShake(false), 500);
  };

  // Loading/Redirect screen
  if (isAuthenticated && user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
        <div className="text-center p-8">
          <div className="mb-6">
            <Image src="/kardex.png" alt="Kardex" width={180} height={72} className="mx-auto brightness-0 invert" priority />
          </div>
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 animate-spin" style={{ clipPath: 'inset(0 0 50% 0)' }}></div>
            <div className="absolute inset-2 rounded-full bg-slate-900"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Welcome Back!</h3>
          <p className="text-blue-200/70 text-sm">Redirecting to your dashboard...</p>
        </div>
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
        {/* Back Button */}
        {moduleParam && (
          <button
            onClick={() => router.push('/module-select')}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Modules</span>
          </button>
        )}

        {/* Main Card */}
        <div className={`bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-transform duration-500 ${shake ? 'animate-shake' : ''}`}>
          {/* Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            <div className="mb-6">
              <Image src="/kardex.png" alt="Kardex" width={160} height={64} className="mx-auto brightness-0 invert drop-shadow-lg" priority />
            </div>
            {/* Module Badge */}
            {moduleParam && moduleLabels[moduleParam] && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                moduleParam === 'finance' 
                  ? 'bg-purple-500/20 border border-purple-500/30' 
                  : 'bg-blue-500/20 border border-blue-500/30'
              }`}>
                <span className={`text-sm font-medium ${
                  moduleParam === 'finance' ? 'text-purple-300' : 'text-blue-300'
                }`}>
                  {moduleLabels[moduleParam]}
                </span>
              </div>
            )}
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
              moduleParam === 'finance'
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30'
                : 'bg-gradient-to-br from-blue-500 to-emerald-500 shadow-blue-500/30'
            }`}>
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-blue-200/60 text-sm">Sign in to continue</p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8 relative">
            {/* Success Overlay */}
            {loginSuccess && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                  <p className="text-emerald-300/80">Redirecting to your dashboard...</p>
                  <div className="flex justify-center gap-2 mt-6">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {(isLoading || isSubmitting) && !loginSuccess && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-20 rounded-3xl">
                <div className="text-center p-8">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
                    <Lock className="absolute inset-0 m-auto h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isSubmitting ? "Authenticating..." : "Loading..."}
                  </h3>
                  <p className="text-blue-200/70 text-sm">Please wait...</p>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-blue-200/80">Email Address</FormLabel>
                      <FormControl>
                        <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                          <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedField === 'email' ? 'text-blue-400' : 'text-white/40'}`} />
                          <Input
                            {...field}
                            placeholder="you@example.com"
                            type="email"
                            className={`h-14 pl-12 pr-4 rounded-2xl bg-white/5 border-2 text-white placeholder:text-white/30 transition-all duration-200 ${
                              focusedField === 'email'
                                ? 'border-blue-400 bg-white/10 shadow-lg shadow-blue-500/20'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                            disabled={isLoading || isSubmitting}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => { field.onBlur(); setFocusedField(null); }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1.5" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-blue-200/80">Password</FormLabel>
                      <FormControl>
                        <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                          <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${focusedField === 'password' ? 'text-blue-400' : 'text-white/40'}`} />
                          <Input
                            {...field}
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            className={`h-14 pl-12 pr-12 rounded-2xl bg-white/5 border-2 text-white placeholder:text-white/30 transition-all duration-200 ${
                              focusedField === 'password'
                                ? 'border-blue-400 bg-white/10 shadow-lg shadow-blue-500/20'
                                : 'border-white/10 hover:border-white/20'
                            }`}
                            disabled={isLoading || isSubmitting}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => { field.onBlur(); setFocusedField(null); }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1.5" />
                    </FormItem>
                  )}
                />

                {/* Remember Me */}
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          disabled={isLoading || isSubmitting}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            field.value
                              ? 'bg-gradient-to-br from-blue-500 to-emerald-500 border-transparent'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {field.value && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </FormControl>
                      <FormLabel className="text-sm text-white/60 font-normal cursor-pointer select-none">
                        Keep me signed in
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isSubmitting || loginSuccess}
                  className={`w-full h-14 mt-2 font-bold text-lg rounded-2xl transition-all duration-300 ${
                    loginSuccess
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loginSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Welcome Back!
                    </span>
                  ) : isLoading || isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" /> Signing In...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <Shield className="h-3.5 w-3.5" />
              <span>Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Kardex Remstar. All rights reserved.
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
