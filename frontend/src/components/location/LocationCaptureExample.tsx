'use client';

import React, { useState } from 'react';
import { MapPin, Clock, Globe } from 'lucide-react';
import LocationCapture from './LocationCapture';
import { LocationResult } from '@/services/LocationService';

const LocationCaptureExample: React.FC = () => {
  const [capturedLocation, setCapturedLocation] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLocationCapture = (result: LocationResult) => {
    setCapturedLocation(result);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setCapturedLocation(null);
  };

  const handleReset = () => {
    setCapturedLocation(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#546A7A] mb-2">Location Capture Demo</h1>
        <p className="text-[#5D6E73]">
          Test the location capture component with GPS accuracy validation and map fallback
        </p>
      </div>

      {/* Location Capture Component */}
      <div className="bg-white rounded-lg border border-[#92A2A5] p-6">
        <LocationCapture
          onLocationCapture={handleLocationCapture}
          onError={handleError}
          showAddress={true}
          accuracyThreshold={5000} // 5km threshold
          title="Get Your Location"
          subtitle="We'll try GPS first, then show a map if accuracy is poor"
        />
      </div>

      {/* Results Display */}
      {capturedLocation && (
        <div className="bg-[#A2B9AF]/10 border border-[#A2B9AF] rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-[#4F6A64]" />
            <h3 className="text-lg font-semibold text-[#4F6A64]">Location Captured Successfully!</h3>
          </div>
          
          <div className="space-y-3">
            {/* Coordinates */}
            <div className="flex items-start space-x-3">
              <Globe className="h-4 w-4 text-[#4F6A64] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#4F6A64]">Coordinates:</p>
                <p className="text-sm text-[#4F6A64] font-mono">
                  {capturedLocation.location.latitude.toFixed(6)}, {capturedLocation.location.longitude.toFixed(6)}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-[#4F6A64] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#4F6A64]">Address:</p>
                <p className="text-sm text-[#4F6A64]">{capturedLocation.address}</p>
                <p className="text-xs text-[#4F6A64]">Source: {capturedLocation.source}</p>
              </div>
            </div>

            {/* Accuracy Info */}
            {capturedLocation.location.accuracy && (
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-[#4F6A64] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#4F6A64]">Accuracy:</p>
                  <p className="text-sm text-[#4F6A64]">
                    ±{Math.round(capturedLocation.location.accuracy)}m ({capturedLocation.location.accuracyLevel})
                  </p>
                </div>
              </div>
            )}

            {/* Timestamp */}
            {capturedLocation.location.timestamp && (
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-[#4F6A64] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#4F6A64]">Captured At:</p>
                  <p className="text-sm text-[#4F6A64]">
                    {capturedLocation.location.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* JSON Output for Developers */}
          <details className="mt-4">
            <summary className="text-sm font-medium text-[#4F6A64] cursor-pointer hover:text-[#4F6A64]">
              View Raw Data (for developers)
            </summary>
            <pre className="mt-2 text-xs bg-[#A2B9AF]/20 p-3 rounded overflow-x-auto">
              {JSON.stringify(capturedLocation, null, 2)}
            </pre>
          </details>

          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-[#4F6A64] text-white rounded-lg hover:bg-[#4F6A64] transition-colors"
          >
            Capture Another Location
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-[#E17F70]/10 border border-[#E17F70] rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-5 w-5 text-[#9E3B47]">⚠️</div>
            <h3 className="text-lg font-semibold text-[#75242D]">Location Capture Failed</h3>
          </div>
          <p className="text-sm text-[#75242D] mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#9E3B47] text-white rounded-lg hover:bg-[#75242D] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-[#96AEC2]/10 border border-[#96AEC2] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#546A7A] mb-3">How It Works</h3>
        <div className="space-y-2 text-sm text-[#546A7A]">
          <p>✅ <strong>High Accuracy GPS:</strong> If GPS accuracy ≤ 5km, location is accepted immediately</p>
          <p>⚠️ <strong>Poor Accuracy GPS:</strong> If GPS accuracy &gt; 5km, you'll see a warning and map picker</p>
          <p>🗺️ <strong>Map Fallback:</strong> Tap anywhere on the LocationIQ map to set precise location</p>
          <p>📱 <strong>Mobile Optimized:</strong> Works on both desktop and mobile devices</p>
          <p>🔄 <strong>Multiple Sources:</strong> Backend geocoding → Frontend geocoding → Coordinates fallback</p>
        </div>
      </div>

      {/* Integration Example */}
      <div className="bg-[#AEBFC3]/10 border border-[#92A2A5] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#546A7A] mb-3">Integration Example</h3>
        <pre className="text-xs bg-[#AEBFC3]/20 p-3 rounded overflow-x-auto">
{`import LocationCapture from '@/components/location/LocationCapture';

<LocationCapture
  onLocationCapture={(result) => {
    // Use the location data...
  }}
  onError={(error) => {
    }}
  accuracyThreshold={5000} // 5km
  showAddress={true}
  autoCapture={false}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default LocationCaptureExample;
