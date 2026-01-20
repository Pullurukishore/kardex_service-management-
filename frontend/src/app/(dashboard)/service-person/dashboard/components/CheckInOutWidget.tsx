'use client';

import React from 'react';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Attendance {
  isCheckedIn: boolean;
  status: string;
  checkInAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface Props {
  attendance: Attendance;
  currentLocation: {latitude: number; longitude: number; address?: string} | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isLocationLoading: boolean;
  canCheckOut: boolean;
}

export default function CheckInOutWidget({
  attendance,
  currentLocation,
  onCheckIn,
  onCheckOut,
  isLocationLoading,
  canCheckOut
}: Props) {
  const isCheckedIn = attendance.isCheckedIn;
  
  const formatTime = (dateString?: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = () => {
    if (isCheckedIn) return 'bg-[#A2B9AF]/100';
    return 'bg-[#E17F70]/100';
  };

  const getStatusIcon = () => {
    if (isCheckedIn) return <CheckCircle className="w-5 h-5 text-white" />;
    return <XCircle className="w-5 h-5 text-white" />;
  };

  return (
    <div className="bg-white border-b border-[#92A2A5] shadow-sm">
      <div className="max-w-md mx-auto p-4">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${getStatusColor()} rounded-full p-2`}>
              {getStatusIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#546A7A]">
                {isCheckedIn ? 'Checked In' : 'Checked Out'}
              </h2>
              <p className="text-sm text-[#5D6E73]">
                {isCheckedIn ? 'Work Day Active' : 'Ready to Start Work'}
              </p>
            </div>
          </div>
          
          {/* Current Time */}
          <div className="text-right">
            <div className="flex items-center text-[#5D6E73] mb-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">Now</span>
            </div>
            <p className="text-lg font-mono font-semibold text-[#546A7A]">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
        </div>

        {/* Check-in Details */}
        {isCheckedIn && attendance.checkInAt && (
          <div className="bg-[#A2B9AF]/10 border border-[#A2B9AF] rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#4F6A64] font-medium">Check-in Time:</span>
              <span className="text-[#4F6A64] font-semibold">{formatTime(attendance.checkInAt)}</span>
            </div>
            {attendance.location && (
              <div className="mt-2 flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#4F6A64] mt-0.5 flex-shrink-0" />
                <p className="text-[#4F6A64] text-xs leading-relaxed">
                  {attendance.location.address}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Location */}
        {currentLocation && (
          <div className="bg-[#96AEC2]/10 border border-[#96AEC2] rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-[#546A7A] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[#546A7A] font-medium text-sm">Current Location:</p>
                <p className="text-[#546A7A] text-xs leading-relaxed">
                  {currentLocation.address || `${currentLocation.latitude}, ${currentLocation.longitude}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isCheckedIn ? (
            <button
              onClick={onCheckIn}
              disabled={isLocationLoading}
              className="w-full bg-[#4F6A64] hover:bg-[#4F6A64] disabled:bg-[#979796] text-white py-3 px-4 rounded-lg font-semibold text-center transition-colors"
            >
              {isLocationLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Getting Location...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Check In</span>
                </div>
              )}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onCheckOut}
                disabled={!canCheckOut || isLocationLoading}
                className="w-full bg-[#9E3B47] hover:bg-[#75242D] disabled:bg-[#979796] text-white py-3 px-4 rounded-lg font-semibold text-center transition-colors"
              >
                {isLocationLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Getting Location...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <XCircle className="w-5 h-5" />
                    <span>Check Out</span>
                  </div>
                )}
              </button>
              
              {!canCheckOut && (
                <p className="text-center text-sm text-[#976E44] bg-[#CE9F6B]/10 border border-[#CE9F6B]/40 rounded-lg p-2">
                  ⚠️ End your current activity before checking out
                </p>
              )}
            </div>
          )}
        </div>

        {/* Location Status */}
        <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-[#AEBFC3]0">
          <div className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-[#A2B9AF]/100' : 'bg-[#E17F70]/100'}`}></div>
          <span>{currentLocation ? 'GPS Connected' : 'GPS Disconnected'}</span>
        </div>
      </div>
    </div>
  );
}
