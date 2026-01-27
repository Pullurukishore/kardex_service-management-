import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Camera, 
  Image as ImageIcon, 
  ZoomIn, 
  Download, 
  Clock,
  FileImage,
  X,
  Loader2
} from 'lucide-react';
import PhotoUploadService from '@/services/photo-upload.service';

// Build server base URL for static assets. If NEXT_PUBLIC_API_URL ends with '/api',
// strip it so that '/storage/...' can be fetched from the server root.
const getServerBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';
  return raw.replace(/\/(api)\/?$/, '');
};

// Helper to get full URL for local storage photos
const getPhotoUrl = (url: string) => {
  return url.startsWith('/storage') 
    ? `${getServerBaseUrl()}${url}` 
    : url;
};

interface PhotoDisplayProps {
  notes?: string;
  activityId: string;
  ticketId?: number;
  className?: string;
}

interface StoredPhoto {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  createdAt: string;
}

interface PhotoInfo {
  count: number;
  size: string;
  time: string;
}

// Extract photo information from notes
function extractPhotoInfo(notes: string): PhotoInfo | null {
  if (!notes) return null;

  // Try standard format first (handles optional clock/camera emojis)
  const photoMatch = notes.match(/(?:📸 )?Photos: (\d+) verification photo[s]? stored permanently \(([^)]+)\)/);
  const photoTimeMatch = notes.match(/(?:🕒 )?Photo Time: ([^\n]+)/);
  
  if (photoMatch) {
    return {
      count: parseInt(photoMatch[1]),
      size: photoMatch[2],
      time: photoTimeMatch?.[1] || new Date().toISOString()
    };
  }

  // Fallback to captured metadata format
  const capturedMatch = notes.match(/(?:📸 )?Photos: (\d+) verification photo[s]? captured \(([^)]+)\)/);
  const timeMatch = notes.match(/(?:🕒 )?(?:Photo )?Time: ([^\n]+)/);
  
  if (!capturedMatch) return null;

  return {
    count: parseInt(capturedMatch[1]),
    size: capturedMatch[2],
    time: timeMatch?.[1] || new Date().toISOString()
  };
}

// Extract photo URLs from notes
function extractPhotoUrls(notes: string): string[] {
  if (!notes) return [];
  
  // Try explicitly listed URLs first
  const localMatch = notes.match(/🔗 Local URLs: ([^\n]+)/);
  const cloudinaryMatch = notes.match(/🔗 Cloudinary URLs: ([^\n]+)/); // Keeping for legacy parsing but will treat as local
  
  if (localMatch) {
    const urls = localMatch[1].split(', ').map(url => url.trim());
    return Array.from(new Set(urls));
  }
  
  if (cloudinaryMatch) {
    const urls = cloudinaryMatch[1].split(', ').map(url => url.trim());
    return Array.from(new Set(urls));
  }
  
  // Only if no explicit list found, search for direct URLs anywhere in the notes
  const urlRegex = /\/storage\/images\/[^\s,]+/g;
  const directUrls = notes.match(urlRegex) || [];
  
  return Array.from(new Set(directUrls));
}

// Check if notes contain photo information
export function hasPhotoData(notes?: string): boolean {
  if (!notes) return false;
  return notes.includes('📸 Photos:');
}

// Get notes without photo information
export function getNotesWithoutPhotos(notes?: string): string {
  if (!notes) return '';
  
  return notes
    .replace(/\n\n📸 Photos: [^\n]+/g, '')
    .replace(/\n🕒 Photo Time: [^\n]+/g, '')
    .replace(/\n🔗 Cloudinary URLs: [^\n]+/g, '')
    .replace(/\n🔗 Local URLs: [^\n]+/g, '')
    .replace(/🔗 Local URLs: [^\n]+/g, '')
    .replace(/🔗 Cloudinary URLs: [^\n]+/g, '')
    .replace(/\/storage\/images\/[^\s,\n]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function PhotoDisplay({ notes, activityId, ticketId, className }: PhotoDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<StoredPhoto | null>(null);
  
  const photoInfo = extractPhotoInfo(notes || '');
  const photoUrls = extractPhotoUrls(notes || '');

  useEffect(() => {
    if (photoUrls.length > 0) {
      const photosFromUrls = photoUrls.map((url, index) => {
        const urlParts = url.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        const dotIndex = originalFilename.lastIndexOf('.');
        const extension = dotIndex !== -1 ? originalFilename.substring(dotIndex + 1).toLowerCase() : 'webp';
        
        return {
          id: -index - 1,
          filename: originalFilename || `photo_${index + 1}.${extension}`,
          url: getPhotoUrl(url),
          thumbnailUrl: getPhotoUrl(url),
          size: 0,
          createdAt: photoInfo?.time || new Date().toISOString()
        };
      });
      setPhotos(photosFromUrls);
      setLoading(false);
    } else if (ticketId && photoInfo && photoInfo.count > 0) {
      loadAndFilterPhotos();
    } else if (ticketId && !notes) {
      loadAllPhotos();
    } else {
      setLoading(false);
    }
  }, [ticketId, photoUrls.length, notes, photoInfo?.time]);

  const loadAndFilterPhotos = async () => {
    if (!ticketId || !photoInfo) return;
    
    try {
      setLoading(true);
      const result = await PhotoUploadService.getTicketPhotos(ticketId);
      if (result.success && result.photos) {
        // Try multiple ways to parse the time
        let infoTime = NaN;
        const timeStr = photoInfo.time;
        
        // 1. Direct parsing (works for ISO, and some regional formats)
        infoTime = new Date(timeStr).getTime();
        
        // 2. Try handling common locale format: "27/1/2026, 12:54:41 pm"
        if (isNaN(infoTime) && timeStr.includes('/') && timeStr.includes(',')) {
           // Basic manual parsing for common D/M/YYYY
           const [datePart, timePart] = timeStr.split(', ');
           const [d, m, y] = datePart.split('/').map(Number);
           
           if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
             // Create a date object (months are 0-indexed)
             const tempDate = new Date(y, m - 1, d);
             
             // Try to add time if possible
             if (timePart) {
                const [timeOnly, ampm] = timePart.split(' ');
                let [hh, mm, ss] = timeOnly.split(':').map(Number);
                if (ampm?.toLowerCase() === 'pm' && hh < 12) hh += 12;
                if (ampm?.toLowerCase() === 'am' && hh === 12) hh = 0;
                
                tempDate.setHours(hh || 0, mm || 0, ss || 0);
             }
             infoTime = tempDate.getTime();
           }
        }
        
        const isValidDate = !isNaN(infoTime);
        
        const convertedPhotos = result.photos.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          url: getPhotoUrl(photo.url),
          thumbnailUrl: getPhotoUrl(photo.url),
          size: photo.size,
          createdAt: photo.createdAt
        }));

        if (!isValidDate) {
          // If date is invalid, DON'T show all photos.
          // Instead, try to show the N most recent photos if they exist, 
          // or just show nothing to avoid confusion.
          // Given the requirement to show ONLY relevant photos, showing nothing is safer than showing wrong ones.
          setPhotos([]);
          return;
        }

        const matchedPhotos = convertedPhotos.filter(photo => {
          const photoTime = new Date(photo.createdAt).getTime();
          // Increase tolerance slightly to 5 minutes for safety, but still keep it specific
          return Math.abs(photoTime - infoTime) < 300000; 
        });

        const uniqueMatchedPhotos = matchedPhotos.filter((photo, index, self) =>
          index === self.findIndex((p) => p.url === photo.url)
        );

        if (uniqueMatchedPhotos.length === 0 && convertedPhotos.length > 0) {
            // If no time match found, but we expected N photos, 
            // maybe try to find photos that were created VERY close to each other
            // but for now, empty is safer.
            setPhotos([]);
        } else {
            setPhotos(uniqueMatchedPhotos);
        }
      }
    } catch (error) {
      console.error("Failed to load and filter photos:", error);
    } finally {
      setLoading(false);
    }
  };


  const loadAllPhotos = async () => {
    if (!ticketId) return;
    
    try {
      setLoading(true);
      const result = await PhotoUploadService.getTicketPhotos(ticketId);
      if (result.success && result.photos) {
        const convertedPhotos = result.photos.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          url: getPhotoUrl(photo.url),
          thumbnailUrl: getPhotoUrl(photo.url),
          size: photo.size,
          createdAt: photo.createdAt
        }));
        setPhotos(convertedPhotos);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (photo: StoredPhoto) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      }
  };

  if (!photoInfo) return null;

  return (
    <>
      <div className={`mt-3 overflow-hidden rounded-xl border border-[#6F8A9D]/60 bg-gradient-to-br from-white via-slate-50 to-[#AEBFC3]/10 shadow-lg shadow-[#6F8A9D]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#6F8A9D]/30 ${className}`}>
        <div className="bg-gradient-to-r from-[#546A7A] via-[#6F8A9D] to-[#546A7A] px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg ring-1 ring-white/30">
                <Camera className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Verification Photos
              </span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-semibold px-2 py-0.5 backdrop-blur-sm">
              {photoInfo.count} photo{photoInfo.count > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#546A7A]" />
              <span className="ml-2 text-xs text-[#757777]">Loading photos...</span>
            </div>
          ) : photos.length > 0 ? (
            <div className={`grid gap-2 ${photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {photos.slice(0, 6).map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#6F8A9D]/30 shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-square bg-[#AEBFC3]/20">
                    <img
                      src={photo.thumbnailUrl}
                      alt={`Verification photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-2">
                    <span className="text-white text-[10px] font-medium flex items-center gap-1">
                      <ZoomIn className="h-3 w-3" />
                      View
                    </span>
                  </div>
                </div>
              ))}
              {photos.length > 6 && (
                <div 
                  className="aspect-square bg-gradient-to-br from-[#6F8A9D]/20 to-[#AEBFC3]/20 rounded-lg flex items-center justify-center cursor-pointer hover:from-[#6F8A9D]/30 hover:to-[#AEBFC3]/30 transition-colors border border-[#6F8A9D]"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="text-center">
                    <span className="text-lg font-bold text-[#546A7A]">+{photos.length - 6}</span>
                    <p className="text-[10px] text-[#546A7A]">more</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-[#AEBFC3]/10 rounded-lg">
              <div className="p-2 bg-[#6F8A9D]/20 rounded-lg">
                <FileImage className="h-4 w-4 text-[#546A7A]" />
              </div>
              <div>
                <p className="font-semibold text-[#546A7A] text-sm">
                  {photoInfo.count} Verification Photo{photoInfo.count > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-[#757777]">Captured at {photoInfo.time}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-[#757777] pt-1 border-t border-[#AEBFC3]/30">
            <span className="flex items-center gap-1">
              <FileImage className="h-3 w-3" />
              {photoInfo.size}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {(() => {
                const date = new Date(photoInfo.time);
                return isNaN(date.getTime()) 
                  ? photoInfo.time 
                  : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              })()}
            </span>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#546A7A]" />
              Verification Photos ({photos.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#546A7A]" />
                <span className="ml-2 text-sm text-[#5D6E73]">Loading photos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="group relative bg-white rounded-lg border border-[#6F8A9D] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-[#AEBFC3]/20">
                      <img
                        src={photo.thumbnailUrl}
                        alt={`Verification photo ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      />
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedPhoto(photo)}
                            className="bg-white/90 hover:bg-white"
                          >
                            <ZoomIn className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownload(photo)}
                            className="bg-white/90 hover:bg-white"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="flex items-center justify-between text-xs text-[#5D6E73] mb-1">
                        <span className="truncate flex-1">{photo.filename}</span>
                        <span>{Math.round(photo.size / 1024)}KB</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#757777]">
                        <Clock className="h-3 w-3" />
                        <span>{(() => {
                          const date = new Date(photo.createdAt);
                          return isNaN(date.getTime()) ? photo.createdAt : date.toLocaleString();
                        })()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-sm border-[#92A2A5] text-[#546A7A]"
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt="Full size verification photo"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 hover:bg-white shadow-md"
                  onClick={() => handleDownload(selectedPhoto)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white/90 hover:bg-white shadow-md"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
