'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import LocationService, { GPSLocation, LocationResult } from '@/services/LocationService';

export interface LocationCaptureProps {
  onLocationCapture: (result: LocationResult) => void;
  onError?: (error: string) => void;
  className?: string;
  showAddress?: boolean;
  accuracyThreshold?: number; // Default 5000m (5km)
  autoCapture?: boolean; // Auto-capture on mount
  title?: string;
  subtitle?: string;
}

interface LocationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  location: GPSLocation | null;
  address: string | null;
  error: string | null;
}

const LocationCapture: React.FC<LocationCaptureProps> = ({
  onLocationCapture,
  onError,
  className = '',
  showAddress = true,
  accuracyThreshold = 5000, // 5km default
  autoCapture = false,
  title = 'Capture Location',
  subtitle = 'Get your current GPS coordinates'
}) => {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    location: null,
    address: null,
    error: null
  });

  const [permissionGranted, setPermissionGranted] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    if (autoCapture) {
      requestPermissionAndAutoCapture();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [autoCapture]);

  // Auto GPS tracking after permission is granted
  useEffect(() => {
    if (permissionGranted && autoCapture) {
      const interval = setInterval(() => {
        if (state.status !== 'loading') {
          handleCaptureLocation();
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [permissionGranted, autoCapture, state.status]);

  const requestPermissionAndAutoCapture = async () => {
    try {
      // Request geolocation permission
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        setPermissionGranted(true);
        handleCaptureLocation();
      } else {
        // Try to get location anyway, which will trigger permission prompt
        handleCaptureLocation();
      }
    } catch (error) {
      handleCaptureLocation();
    }
  };

  const handleCaptureLocation = async () => {
    if (!mountedRef.current) return;

    setState(prev => ({
      ...prev,
      status: 'loading',
      error: null
    }));

    try {
      // Get GPS location with any accuracy (no blocking)
      const location = await LocationService.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // Allow cached location up to 1 minute
        retryAttempts: 2,
        accuracyThreshold: 999999, // Accept any accuracy
        requireAccuracy: false
      });

      if (!mountedRef.current) return;

      // Set permission as granted after successful location capture
      setPermissionGranted(true);

      // Always proceed with geocoding regardless of accuracy
      await processLocationWithAddress(location);

    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Failed to get GPS location';
      
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }));

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const processLocationWithAddress = async (location: GPSLocation) => {
    try {
      // Get address using LocationService
      const geocodeResult = await LocationService.reverseGeocode(
        location.latitude, 
        location.longitude
      );

      if (!mountedRef.current) return;

      const result: LocationResult = {
        location,
        address: geocodeResult.address,
        source: geocodeResult.source
      };

      setState(prev => ({
        ...prev,
        status: 'success',
        location,
        address: geocodeResult.address,
        error: null
      }));

      onLocationCapture(result);

    } catch (error) {
      if (!mountedRef.current) return;

      // Still provide location without address
      const result: LocationResult = {
        location,
        address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        source: 'coordinates'
      };

      setState(prev => ({
        ...prev,
        status: 'success',
        location,
        address: result.address,
        error: null
      }));

      onLocationCapture(result);
    }
  };

  const handleRetry = () => {
    handleCaptureLocation();
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-[#546A7A]" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-[#4F6A64]" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-[#9E3B47]" />;
      default:
        return <MapPin className="h-5 w-5 text-[#5D6E73]" />;
    }
  };

  const getStatusMessage = () => {
    switch (state.status) {
      case 'loading':
        return 'Getting your location...';
      case 'success':
        const accuracy = state.location?.accuracy;
        let message = 'Location captured successfully';
        if (accuracy) {
          message += ` (±${Math.round(accuracy)}m accuracy)`;
          if (accuracy > 100) {
            message += ' - Consider moving to an open area for better accuracy';
          }
        }
        return message;
      case 'error':
        return state.error || 'Failed to get location';
      default:
        return permissionGranted && autoCapture ? 'Auto-tracking your location...' : 'Tap to get your current location';
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'success':
        const accuracy = state.location?.accuracy;
        if (accuracy && accuracy > 100) {
          return 'text-[#976E44] bg-[#CE9F6B]/10 border-[#CE9F6B]/50';
        }
        return 'text-[#4F6A64] bg-[#A2B9AF]/10 border-[#A2B9AF]';
      case 'error':
        return 'text-[#9E3B47] bg-[#E17F70]/10 border-[#E17F70]';
      case 'loading':
        return 'text-[#546A7A] bg-[#96AEC2]/10 border-[#96AEC2]';
      default:
        return permissionGranted && autoCapture ? 'text-[#546A7A] bg-[#96AEC2]/10 border-[#96AEC2]' : 'text-[#5D6E73] bg-[#AEBFC3]/10 border-[#92A2A5]';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-[#546A7A]">{title}</h3>
        <p className="text-sm text-[#5D6E73] mt-1">{subtitle}</p>
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStatusColor()}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {getStatusMessage()}
            </p>
            
            {/* Location Details */}
            {state.location && (
              <div className="mt-2 space-y-1">
                <div className="text-xs font-mono bg-white bg-opacity-50 rounded px-2 py-1">
                  📍 {state.location.latitude.toFixed(6)}, {state.location.longitude.toFixed(6)}
                </div>
                {showAddress && state.address && (
                  <div className="text-xs bg-white bg-opacity-50 rounded px-2 py-1">
                    📍 {state.address}
                  </div>
                )}
                {state.location.accuracy && (
                  <div className="text-xs">
                    Accuracy: ±{Math.round(state.location.accuracy)}m ({state.location.accuracyLevel})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Primary GPS Button */}
        <button
          onClick={handleCaptureLocation}
          disabled={state.status === 'loading'}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#6F8A9D] text-white rounded-lg hover:bg-[#546A7A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
        >
          <Navigation className="h-4 w-4" />
          <span className="font-medium">
            {state.status === 'loading' ? 'Getting Location...' : permissionGranted && autoCapture ? 'Update Location' : 'Get GPS Location'}
          </span>
        </button>

        {/* Retry Button - Only shown when GPS fails */}
        {state.status === 'error' && (
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#976E44] text-white rounded-lg hover:bg-[#976E44] transition-colors duration-200 touch-manipulation"
          >
            <Navigation className="h-3 w-3" />
            <span className="text-sm font-medium">Retry GPS</span>
          </button>
        )}

        {/* Auto-tracking status */}
        {permissionGranted && autoCapture && (
          <div className="text-center">
            <p className="text-xs text-[#546A7A]">
              🔄 Auto-tracking enabled - Location updates every 30 seconds
            </p>
          </div>
        )}
      </div>

      {/* Accuracy Help - Only shown when accuracy is poor but location is still captured */}
      {state.status === 'success' && state.location?.accuracy && state.location.accuracy > 100 && (
        <div className="bg-[#CE9F6B]/10 border border-[#CE9F6B]/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-[#976E44] mb-2">GPS Accuracy Notice:</h4>
          <p className="text-xs text-[#976E44]">
            Location captured with ±{Math.round(state.location.accuracy)}m accuracy. For better accuracy, try moving to an open area with clear sky view.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationCapture;
