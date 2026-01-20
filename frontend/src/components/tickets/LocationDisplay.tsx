'use client';

import { MapPin, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type LocationDisplayProps = {
  notes?: string;
  className?: string;
  showMapLink?: boolean;
};

export function LocationDisplay({ notes, className = '', showMapLink = true }: LocationDisplayProps) {
  if (!notes) return null;

  // Extract location information from notes
  const locationMatch = notes.match(/📍 Location: ([^\n]+)/);
  const timeMatch = notes.match(/🕒 Time: ([^\n]+)/);
  const coordsMatch = notes.match(/📍 Coordinates: ([^\n]+)/);

  if (!locationMatch && !coordsMatch) return null;

  const location = locationMatch?.[1];
  const time = timeMatch?.[1];
  const coordinates = coordsMatch?.[1];

  const handleMapClick = () => {
    if (coordinates && showMapLink) {
      const [lat, lng] = coordinates.split(', ').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-[#546A7A]" />
        <Badge variant="secondary" className="text-xs">
          Location Tracked
        </Badge>
      </div>
      
      <div className="bg-[#96AEC2]/10 border border-[#96AEC2] rounded-md p-3 space-y-2">
        {location && (
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-[#546A7A]">📍</span>
            <div className="flex-1">
              <p className="text-sm text-[#546A7A] font-medium">{location}</p>
              {showMapLink && coordinates && (
                <button
                  onClick={handleMapClick}
                  className="text-xs text-[#546A7A] hover:text-[#546A7A] underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on Map
                </button>
              )}
            </div>
          </div>
        )}
        
        {time && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#546A7A]">🕒</span>
            <p className="text-sm text-[#546A7A]">{time}</p>
          </div>
        )}
        
        {coordinates && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#546A7A]">📍</span>
            <p className="text-xs text-[#546A7A] font-mono">{coordinates}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to extract clean notes without location data
export function getNotesWithoutLocation(notes?: string): string {
  if (!notes) return '';
  
  // Remove location information from notes
  return notes
    .replace(/\n\n📍 Location: [^\n]+/g, '')
    .replace(/\n🕒 Time: [^\n]+/g, '')
    .replace(/\n📍 Coordinates: [^\n]+/g, '')
    .trim();
}

// Helper function to check if notes contain location data
export function hasLocationData(notes?: string): boolean {
  if (!notes) return false;
  return notes.includes('📍 Location:') || notes.includes('📍 Coordinates:');
}
