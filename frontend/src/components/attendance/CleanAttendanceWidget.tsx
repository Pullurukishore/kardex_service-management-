'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  LogIn, 
  LogOut,
  Loader2,
  AlertCircle,
  RotateCcw,
  Navigation,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';
import EnhancedLocationCapture from '@/components/activity/EnhancedLocationCapture';
import { LocationData as EnhancedLocationData } from '@/hooks/useEnhancedLocation';

export interface AttendanceData {
  isCheckedIn: boolean;
  attendance?: {
    id: number;
    checkInAt: string;
    checkOutAt?: string;
    checkInAddress?: string;
    checkOutAddress?: string;
    totalHours?: number;
    status: 'CHECKED_IN' | 'CHECKED_OUT' | 'EARLY_CHECKOUT';
  };
}

interface AttendanceStats {
  totalHours: number;
  avgHoursPerDay: number;
  totalDaysWorked: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  timestamp: string;
}

// Enhanced location data from our new system
interface AttendanceLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  timestamp: number;
  source: 'gps' | 'manual' | 'network';
}

interface CleanAttendanceWidgetProps {
  onStatusChange?: (data?: AttendanceData) => void;
  initialData?: AttendanceData;
}

interface LocationCaptureState {
  isCapturing: boolean;
  capturedLocation: LocationData | null;
  error: string | null;
}

interface EnhancedLocationCaptureState {
  isCapturing: boolean;
  capturedLocation: AttendanceLocationData | null;
  error: string | null;
  showLocationCapture: boolean;
}

export default function CleanAttendanceWidget({ 
  onStatusChange,
  initialData
}: CleanAttendanceWidgetProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(initialData || null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEarlyCheckoutConfirm, setShowEarlyCheckoutConfirm] = useState(false);
  const [earlyCheckoutData, setEarlyCheckoutData] = useState<any>(null);
  const [locationState, setLocationState] = useState<LocationCaptureState>({
    isCapturing: false,
    capturedLocation: null,
    error: null
  });
  
  // Enhanced location state
  const [enhancedLocationState, setEnhancedLocationState] = useState<EnhancedLocationCaptureState>({
    isCapturing: false,
    capturedLocation: null,
    error: null,
    showLocationCapture: false
  });
  
  const [lastKnownLocation, setLastKnownLocation] = useState<AttendanceLocationData | null>(null);
  const { toast } = useToast();

  // Fetch attendance status
  const fetchAttendanceStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/attendance/status');
      const data = response.data || response;
      setAttendanceData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch attendance stats
  const fetchAttendanceStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/attendance/stats');
      const data = response.data || response;
      setStats(data);
    } catch (error) {
    }
  }, []);

  // Initialize data
  useEffect(() => {
    if (!initialData) {
      fetchAttendanceStatus();
    }
    fetchAttendanceStats();
  }, [initialData, fetchAttendanceStatus, fetchAttendanceStats]);

  // Update when initial data changes
  useEffect(() => {
    if (initialData) {
      setAttendanceData(initialData);
    }
  }, [initialData]);

  // Enhanced location capture handler
  const handleEnhancedLocationCapture = (location: EnhancedLocationData) => {
    const attendanceLocation: AttendanceLocationData = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address,
      timestamp: location.timestamp,
      source: location.source === 'network' ? 'gps' : location.source
    };
    
    setEnhancedLocationState(prev => ({
      ...prev,
      capturedLocation: attendanceLocation,
      error: null,
      showLocationCapture: false
    }));
    
    setLastKnownLocation(attendanceLocation);
  };

  // Legacy location capture (keeping for backward compatibility)
  const getCurrentLocation = async (): Promise<LocationData> => {
    setLocationState({
      isCapturing: true,
      capturedLocation: null,
      error: null
    });

    try {
      // Take multiple GPS readings to handle intermittent issues
      const readings: LocationData[] = [];
      const maxReadings = 3;
      const readingDelay = 2000; // 2 seconds between readings

      for (let i = 0; i < maxReadings; i++) {
        try {
          const reading = await getSingleLocationReading();
          readings.push(reading);
          
          // If we get a very accurate reading early, we can use it
          if (reading.accuracy <= 50 && i > 0) {
            break;
          }
          
          // Wait before next reading (except for last one)
          if (i < maxReadings - 1) {
            await new Promise(resolve => setTimeout(resolve, readingDelay));
          }
        } catch (error) {
        }
      }

      if (readings.length === 0) {
        throw new Error('All GPS readings failed');
      }

      const bestReading = selectBestLocationReading(readings);
      
      setLocationState({
        isCapturing: false,
        capturedLocation: bestReading,
        error: null
      });

      return bestReading;

    } catch (error: any) {
      setLocationState({
        isCapturing: false,
        capturedLocation: null,
        error: error.message || 'Failed to get consistent GPS location'
      });
      throw error;
    }
  };

  const selectBestLocationReading = (readings: LocationData[]): LocationData => {
    if (readings.length === 1) return readings[0];
    const excellentReadings = readings.filter(r => r.accuracy <= 50);
    if (excellentReadings.length > 0) {
      return excellentReadings.reduce((best, current) => current.accuracy < best.accuracy ? current : best);
    }
    const consistentReadings = findConsistentReadings(readings);
    if (consistentReadings.length > 0) {
      return consistentReadings.reduce((best, current) => current.accuracy < best.accuracy ? current : best);
    }
    return readings.reduce((best, current) => current.accuracy < best.accuracy ? current : best);
  };

  const findConsistentReadings = (readings: LocationData[]): LocationData[] => {
    if (readings.length < 2) return readings;
    const CONSISTENCY_THRESHOLD = 500;
    const consistent: LocationData[] = [];
    for (let i = 0; i < readings.length; i++) {
      let consistentCount = 1;
      for (let j = 0; j < readings.length; j++) {
        if (i !== j) {
          const distance = calculateDistance(readings[i].latitude, readings[i].longitude, readings[j].latitude, readings[j].longitude);
          if (distance <= CONSISTENCY_THRESHOLD) consistentCount++;
        }
      }
      if (consistentCount > 1) consistent.push(readings[i]);
    }
    return consistent;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getSingleLocationReading = async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser';
        setLocationState({ isCapturing: false, capturedLocation: null, error });
        reject(new Error(error));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          if (accuracy > 100) {
            setLocationState(prev => ({ ...prev, error: `Poor GPS signal (±${Math.round(accuracy)}m).` }));
          }
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          try {
            const response = await apiClient.get(`/geocoding/reverse?latitude=${latitude}&longitude=${longitude}`);
            if (response.data?.address) address = response.data.address;
            else if (response.data?.success && response.data?.data?.address) address = response.data.data.address;
          } catch (error) {}
          const locationData = { latitude, longitude, accuracy, address, timestamp: new Date().toISOString() };
          setLocationState({ isCapturing: false, capturedLocation: locationData, error: null });
          resolve(locationData);
        },
        (error) => {
          const errorMessage = `Location error: ${error.message}`;
          setLocationState({ isCapturing: false, capturedLocation: null, error: errorMessage });
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    if (!enhancedLocationState.capturedLocation) {
      setEnhancedLocationState(prev => ({ ...prev, showLocationCapture: true, error: null }));
      toast({ title: "Location Required", description: "Please capture your location for check-in.", variant: "destructive" });
      return;
    }
    const location = enhancedLocationState.capturedLocation;
    if (location.source === 'gps' && location.accuracy > 2000) {
      toast({ title: "GPS Accuracy Too Poor", description: `GPS accuracy is ±${Math.round(location.accuracy)}m (requires ≤2000m).`, variant: "destructive" });
      setEnhancedLocationState(prev => ({ ...prev, showLocationCapture: true }));
      return;
    }

    setActionLoading(true);
    try {
      const checkInData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        accuracy: location.accuracy,
        locationSource: location.source,
        timestamp: new Date(location.timestamp).toISOString()
      };

      const response = await apiClient.post('/attendance/checkin', checkInData);
      const result = (response.data || response) as any;
      const newData: AttendanceData = {
        isCheckedIn: true,
        attendance: result.attendance ? {
          id: result.attendance.id,
          checkInAt: result.attendance.checkInAt,
          checkInAddress: result.attendance.checkInAddress || location.address,
          status: 'CHECKED_IN'
        } : {
          id: 0,
          checkInAt: new Date().toISOString(),
          checkInAddress: location.address,
          status: 'CHECKED_IN'
        }
      };
      
      setAttendanceData(newData);
      if (onStatusChange) onStatusChange(newData);
      
      setActionLoading(false);
      setEnhancedLocationState({ isCapturing: false, capturedLocation: null, error: null, showLocationCapture: false });
      fetchAttendanceStats().catch(() => {});
    } catch (error: any) {
      setActionLoading(false);
      let errorMessage = 'Failed to check in. Please try again.';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 400) errorMessage = 'Invalid location data.';
      toast({ title: 'Check-in Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLegacyCheckIn = async () => {
    setActionLoading(true);
    try {
      const location = await getCurrentLocation();
      const response = await apiClient.post('/attendance/checkin', {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
      });
      const result = response.data || response;
      const newData: AttendanceData = {
        isCheckedIn: true,
        attendance: result.attendance ? {
          id: result.attendance.id,
          checkInAt: result.attendance.checkInAt,
          checkInAddress: result.attendance.checkInAddress || location.address,
          status: 'CHECKED_IN'
        } : {
          id: 0,
          checkInAt: new Date().toISOString(),
          checkInAddress: location.address,
          status: 'CHECKED_IN'
        }
      };
      setAttendanceData(newData);
      if (onStatusChange) onStatusChange(newData);
      await fetchAttendanceStatus();
      await fetchAttendanceStats();
    } catch (error: any) {
      if (error.response?.status === 400 && 
          (error.response?.data?.error === 'Already checked in' || 
           error.response?.data?.message?.includes('already checked in'))) {
        toast({ title: 'Already Checked In', description: 'Refreshing status...', variant: 'destructive' });
        await fetchAttendanceStatus();
      } else {
        toast({ title: 'Check-in Failed', description: error.response?.data?.message || 'Failed to check in', variant: 'destructive' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!attendanceData?.isCheckedIn || !attendanceData?.attendance?.id) {
      toast({ title: "Cannot Check Out", description: "You are not currently checked in.", variant: "destructive" });
      await fetchAttendanceStatus();
      return;
    }
    if (!enhancedLocationState.capturedLocation) {
      setEnhancedLocationState(prev => ({ ...prev, showLocationCapture: true, error: null }));
      toast({ title: "Location Required", description: "Please capture location.", variant: "destructive" });
      return;
    }
    const location = enhancedLocationState.capturedLocation;
    if (location.source === 'gps' && location.accuracy > 2000) {
      toast({ title: "GPS Accuracy Too Poor", description: "GPS Accuracy Too Poor", variant: "destructive" });
      setEnhancedLocationState(prev => ({ ...prev, showLocationCapture: true }));
      return;
    }
    const checkOutData = {
      attendanceId: attendanceData.attendance.id,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      locationSource: location.source
    };
    setActionLoading(true);
    try {
      const response = await apiClient.post('/attendance/checkout', checkOutData);
      const result = (response.data || response) as any;
      const newData: AttendanceData = {
        isCheckedIn: false,
        attendance: result.attendance
      };
      setAttendanceData(newData);
      if (onStatusChange) onStatusChange(newData);
      setActionLoading(false);
      setEnhancedLocationState({ isCapturing: false, capturedLocation: null, error: null, showLocationCapture: false });
      fetchAttendanceStats().catch(() => {});
    } catch (error: any) {
      setActionLoading(false);
      if (error.response?.status === 400 && error.response.data?.requiresConfirmation) {
        setEarlyCheckoutData({ location, confirmationData: error.response.data });
        setShowEarlyCheckoutConfirm(true);
        setActionLoading(false);
        return;
      }
      toast({ title: 'Check-out Failed', description: error.response?.data?.message || 'Failed to check out', variant: 'destructive' });
      setActionLoading(false);
    }
  };

  const handleReCheckIn = async () => {
    if (!enhancedLocationState.capturedLocation) {
      setEnhancedLocationState(prev => ({ ...prev, showLocationCapture: true, error: null }));
      toast({ title: "Location Required", description: "Please capture location.", variant: "destructive" });
      return;
    }
    const location = enhancedLocationState.capturedLocation;
    if (location.source === 'gps' && location.accuracy > 2000) {
      toast({ title: "GPS Accuracy Too Poor", description: "GPS Accuracy Too Poor", variant: "destructive" });
      setEnhancedLocationState(prev => ({ ...prev, showLocationCapture: true }));
      return;
    }
    setActionLoading(true);
    try {
      const reCheckInData = {
        attendanceId: attendanceData?.attendance?.id,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        accuracy: location.accuracy,
        locationSource: location.source,
        timestamp: new Date(location.timestamp).toISOString()
      };
      const response = await apiClient.post('/attendance/re-checkin', reCheckInData);
      const result = response.data || response;
      const newData: AttendanceData = {
        isCheckedIn: true,
        attendance: result.attendance ? {
          id: result.attendance.id,
          checkInAt: result.attendance.checkInAt,
          checkInAddress: result.attendance.checkInAddress || location.address,
          status: 'CHECKED_IN'
        } : {
          id: 0,
          checkInAt: new Date().toISOString(),
          checkInAddress: location.address,
          status: 'CHECKED_IN'
        }
      };
      setAttendanceData(newData);
      if (onStatusChange) onStatusChange(newData);
      setActionLoading(false);
      setEnhancedLocationState({ isCapturing: false, capturedLocation: null, error: null, showLocationCapture: false });
      fetchAttendanceStats().catch(() => {});
    } catch (error: any) {
      setActionLoading(false);
      toast({ title: 'Re-Check-in Failed', description: error.response?.data?.message || 'Failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEarlyCheckoutConfirm = async (confirmed: boolean) => {
    setShowEarlyCheckoutConfirm(false);
    if (!confirmed || !earlyCheckoutData) {
      setEarlyCheckoutData(null);
      setActionLoading(false);
      return;
    }
    setActionLoading(true);
    try {
      const { location } = earlyCheckoutData;
      const response = await apiClient.post('/attendance/checkout', {
        attendanceId: attendanceData?.attendance?.id,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        locationSource: location.source,
        confirmEarlyCheckout: true
      });
      const result = response.data || response;
      const newData: AttendanceData = {
        isCheckedIn: false,
        attendance: result.attendance
      };
      setAttendanceData(newData);
      if (onStatusChange) onStatusChange(newData);
      setEnhancedLocationState({ isCapturing: false, capturedLocation: null, error: null, showLocationCapture: false });
      fetchAttendanceStatus();
      fetchAttendanceStats();
    } catch (error: any) {
      toast({ title: 'Check-out Failed', description: error.response?.data?.message || 'Failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
      setEarlyCheckoutData(null);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatHours = (hours: string | number | undefined, decimals: number = 2): string => {
    if (!hours) return '0';
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    return isNaN(numHours) ? '0' : numHours.toFixed(decimals);
  };

  const renderActionButton = () => {
    if (loading || !attendanceData) {
      return (
        <Button disabled className="w-full h-12 rounded-xl text-sm font-semibold bg-[#AEBFC3]/20 text-[#979796]">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }
    const isCheckedIn = attendanceData.isCheckedIn;
    const hasAttendanceToday = attendanceData.attendance && (attendanceData.attendance.status === 'CHECKED_OUT' || attendanceData.attendance.status === 'EARLY_CHECKOUT');
    
    if (isCheckedIn) {
      return (
        <Button onClick={handleCheckOut} disabled={actionLoading} className="w-full h-14 bg-gradient-to-r from-[#E17F70] to-[#9E3B47] text-white font-bold rounded-xl shadow-lg">
          {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogOut className="w-5 h-5 mr-2" />}
          {actionLoading ? 'Checking Out...' : 'Check Out'}
        </Button>
      );
    } else if (hasAttendanceToday) {
      return (
        <div className="space-y-3">
          <div className="text-center text-xs text-[#546A7A] font-semibold bg-[#96AEC2]/10 py-2.5 px-4 rounded-xl border border-[#96AEC2]">
            Checked out today • Tap to resume work
          </div>
          <Button onClick={handleReCheckIn} disabled={actionLoading} className="w-full h-14 bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] text-white font-bold rounded-xl shadow-lg">
            {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
            {actionLoading ? 'Re-Checking In...' : 'Re-Check In'}
          </Button>
        </div>
      );
    } else {
      return (
        <Button onClick={handleCheckIn} disabled={actionLoading} className="w-full h-14 bg-gradient-to-r from-[#82A094] to-[#4F6A64] text-white font-bold rounded-xl shadow-lg">
          {actionLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
          {actionLoading ? 'Checking In...' : 'Check In'}
        </Button>
      );
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-white/50">
      <div className="bg-gradient-to-r from-[#546A7A] via-[#6F8A9D] to-[#96AEC2] p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Attendance</h2>
              <p className="text-white/70 text-sm">Track your work hours</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border ${attendanceData?.isCheckedIn ? 'bg-green-500/20 border-green-500/50' : 'bg-white/10 border-white/30'}`}>
            <span className="text-sm font-bold">{attendanceData?.isCheckedIn ? 'Checked In' : 'Off Duty'}</span>
          </div>
        </div>
        {attendanceData?.attendance?.checkInAt && (
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-3 rounded-xl">
              <p className="text-white/60 text-xs">Started at</p>
              <p className="font-bold">{formatTime(attendanceData.attendance.checkInAt)}</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        {enhancedLocationState.showLocationCapture && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <EnhancedLocationCapture
              onLocationCapture={handleEnhancedLocationCapture}
              required={true}
              enableJumpDetection={true}
              autoCapture={true}
            />
          </div>
        )}
        
        {/* Captured Location Preview */}
        {enhancedLocationState.capturedLocation && !enhancedLocationState.showLocationCapture && (
          <div className="mb-4 bg-[#A2B9AF]/10 border border-[#A2B9AF]/30 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#A2B9AF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#4F6A64]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#4F6A64] flex items-center gap-1.5">
                    Location Captured 
                    <CheckCircle className="w-3.5 h-3.5" />
                  </p>
                  <p className="text-xs text-[#5D6E73] mt-0.5 line-clamp-2 leading-relaxed">
                    {enhancedLocationState.capturedLocation.address || `${enhancedLocationState.capturedLocation.latitude.toFixed(6)}, ${enhancedLocationState.capturedLocation.longitude.toFixed(6)}`}
                  </p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full text-[#AEBFC3]0 font-medium">
                      Accuracy: ±{Math.round(enhancedLocationState.capturedLocation.accuracy)}m
                    </span>
                    <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full text-[#AEBFC3]0 font-medium">
                      Source: {enhancedLocationState.capturedLocation.source?.toUpperCase() || 'GPS'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEnhancedLocationState(prev => ({ ...prev, capturedLocation: null, showLocationCapture: true }))}
                className="h-8 w-8 text-[#546A7A] hover:bg-white/50 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {renderActionButton()}
        <Button 
          variant="ghost" 
          onClick={() => { fetchAttendanceStatus(); fetchAttendanceStats(); }} 
          className="w-full mt-4 text-[#5D6E73] hover:bg-gray-100"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Refresh Status
        </Button>
      </div>
      
      {showEarlyCheckoutConfirm && earlyCheckoutData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Early Checkout</h3>
            <p className="text-gray-600 mb-6">{earlyCheckoutData.confirmationData.message}</p>
            <div className="flex gap-4">
              <Button onClick={() => handleEarlyCheckoutConfirm(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={() => handleEarlyCheckoutConfirm(true)} className="flex-1 bg-[#CE9F6B]">Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
