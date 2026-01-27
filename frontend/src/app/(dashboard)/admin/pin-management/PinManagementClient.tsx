'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Clock, Users, AlertCircle, CheckCircle, Copy, RefreshCw, Eye, EyeOff, Trash2, History, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api-client';

interface PinStatus {
  pinRequired: boolean;
  createdAt: string;
  daysRemaining: number | null;
  currentPin: string;
}

export default function PinManagementClient() {
  const [newPin, setNewPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState<PinStatus | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pinTimeout, setPinTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch current PIN status
  const fetchPinStatus = async () => {
    try {
      const response = await apiClient.get('/auth/pin-status');
      if (response.success !== false) {
        setPinStatus(response.data || response);
      } else {
        setError(response.error || 'Failed to load PIN status');
      }
    } catch (error) {
      setError('Network error while fetching PIN status');
    }
  };

  useEffect(() => {
    fetchPinStatus();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pinTimeout) {
        clearTimeout(pinTimeout);
      }
    };
  }, [pinTimeout]);

  // Generate random 6-digit PIN with animation
  const generateRandomPin = () => {
    setIsGenerating(true);
    
    // Animate PIN generation
    let iterations = 0;
    const maxIterations = 10;
    
    const animateGeneration = () => {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      setNewPin(pin);
      iterations++;
      
      if (iterations < maxIterations) {
        setTimeout(animateGeneration, 100);
      } else {
        setIsGenerating(false);
        toast.success('New PIN generated!');
      }
    };
    
    animateGeneration();
  };

  // Copy PIN to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('PIN copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy PIN');
    }
  };

  // Toggle PIN visibility with auto-hide
  const togglePinVisibility = () => {
    if (pinTimeout) {
      clearTimeout(pinTimeout);
    }
    
    if (!showPin) {
      setShowPin(true);
      // Auto-hide PIN after 10 seconds
      const timeout = setTimeout(() => {
        setShowPin(false);
        toast.info('PIN hidden for security');
      }, 10000);
      setPinTimeout(timeout);
    } else {
      setShowPin(false);
    }
  };

  // Handle PIN generation
  const handleGeneratePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/auth/generate-pin', { newPin });

      if (response.success !== false) {
        setSuccess('New PIN generated successfully!');
        setNewPin('');
        fetchPinStatus(); // Refresh status
        toast.success('New access PIN generated!');
      } else {
        setError(response.error || 'Failed to generate PIN');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 1) return 'destructive';
    if (daysRemaining <= 3) return 'secondary';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50/30 to-[#96AEC2]/10/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-[#6F8A9D] to-[#6F8A9D] rounded-xl shadow-lg hover:scale-105 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  PIN Management
                </h1>
                <p className="text-[#5D6E73] text-lg mt-1">
                  Secure access control for your KardexCare system
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md border border-[#96AEC2]/50">
              <Settings className="w-4 h-4 text-[#546A7A]" />
              <span className="text-sm font-medium text-[#5D6E73]">Admin Panel</span>
            </div>
          </div>
          
          {/* Status Banner */}
          {pinStatus && (
            <div className="bg-gradient-to-r from-[#A2B9AF]/10 to-[#A2B9AF]/10 border border-[#A2B9AF] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#4F6A64]" />
                  <span className="font-medium text-[#4F6A64]">System Status: Active</span>
                </div>
                <Badge variant="outline" className="bg-[#A2B9AF]/20 text-[#4F6A64] border-[#82A094]">
                  PIN Never Expires
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current PIN Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#5D6E73]" />
              <CardTitle>Current PIN Status</CardTitle>
            </div>
            <CardDescription>
              View the current access PIN information and expiry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pinStatus ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5D6E73]">Status</span>
                  <Badge variant={pinStatus.pinRequired ? 'destructive' : 'default'}>
                    {pinStatus.pinRequired ? 'Expired' : 'Active'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5D6E73]">Expiry</span>
                  <Badge variant="default">
                    Never expires
                  </Badge>
                </div>

                <Separator className="my-4" />
                
                {/* Current PIN Display */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#5D6E73]">Current PIN</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-lg tracking-widest bg-[#AEBFC3]/10 px-3 py-1 rounded border">
                      {showPin ? pinStatus.currentPin : '••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePinVisibility}
                      className="h-8 w-8"
                      title={showPin ? "Hide PIN" : "Show PIN (auto-hides in 10s)"}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(pinStatus.currentPin)}
                      className="h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {showPin && (
                  <Alert className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      🔒 PIN is visible. It will auto-hide in 10 seconds for security.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5D6E73]">Created</span>
                    <span className="font-mono">{formatDate(pinStatus.createdAt)}</span>
                  </div>
                </div>

              </>
            ) : error ? (
              <div className="text-center py-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-[#546A7A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-[#AEBFC3]0">Loading PIN status...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate New PIN */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-[#5D6E73]" />
              <CardTitle>Generate New PIN</CardTitle>
            </div>
            <CardDescription>
              Create a new 6-digit access PIN for your users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGeneratePin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#5D6E73]">
                  New 6-Digit PIN
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="123456"
                    value={newPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setNewPin(value);
                        setError('');
                      }
                    }}
                    className="font-mono text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateRandomPin}
                    title="Generate random PIN"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  {newPin && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(newPin)}
                      title="Copy PIN"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-[#AEBFC3]0">
                  PIN must be exactly 6 digits. Click the refresh button to generate a random PIN.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-[#A2B9AF] bg-[#A2B9AF]/10">
                  <CheckCircle className="h-4 w-4 text-[#4F6A64]" />
                  <AlertDescription className="text-[#4F6A64]">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={newPin.length !== 6 || loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate New PIN'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#5D6E73]" />
            <CardTitle>Usage Instructions</CardTitle>
          </div>
          <CardDescription>
            How to share and manage the access PIN with your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-[#546A7A]">📱 Sharing the PIN</h4>
              <ul className="text-sm text-[#5D6E73] space-y-1">
                <li>• Share via WhatsApp group or secure channel</li>
                <li>• Send to authorized users only</li>
                <li>• Inform users PIN doesn't expire</li>
                <li>• Use copy button for easy sharing</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-[#546A7A]">🔄 PIN Management</h4>
              <ul className="text-sm text-[#5D6E73] space-y-1">
                <li>• PINs never expire automatically</li>
                <li>• Generate new PIN when needed</li>
                <li>• Users enter PIN once per device</li>
                <li>• Change PIN for security or access control</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-[#96AEC2]/10 border border-[#96AEC2] rounded-lg p-4">
            <h4 className="font-semibold text-[#546A7A] mb-2">💡 Best Practices</h4>
            <ul className="text-sm text-[#546A7A] space-y-1">
              <li>• Generate new PIN periodically for security</li>
              <li>• Share PIN only with active team members</li>
              <li>• Revoke access by generating new PIN immediately</li>
              <li>• Keep track of who has the current PIN</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
