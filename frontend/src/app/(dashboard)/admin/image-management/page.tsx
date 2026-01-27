'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  Filter, 
  LayoutGrid, 
  List, 
  FileText, 
  CheckCircle2, 
  X, 
  Maximize2,
  HardDrive,
  Image,
  RefreshCcw,
  ExternalLink,
  Info
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { apiClient } from '@/lib/api/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageStats {
  totalImages: number;
  totalSizeBytes: number;
  byMonth: { month: string; count: number; sizeBytes: number }[];
  byType: { type: string; count: number; sizeBytes: number }[];
}

interface ImageItem {
  id: number;
  filename: string;
  url: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  type: string;
  ticketId: number | null;
  ticketTitle: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ImageManagementPage() {
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<ImageStats>('/image-management/stats');
      const data = (response as any).data || response;
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchImages = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: '60',
        ...(dateFrom && { from: dateFrom }),
        ...(dateTo && { to: dateTo })
      });

      const response = await apiClient.get<{ images: ImageItem[]; pagination: Pagination }>(`/image-management/images?${params}`);
      const data = (response as any).data || response;
      if (data?.images) {
        setImages(data.images);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch images:', err);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchImages();
  }, [dateFrom, dateTo]);

  const filteredImages = useMemo(() => {
    if (!searchQuery) return images;
    const lowerQuery = searchQuery.toLowerCase();
    return images.filter(img => 
      img.filename.toLowerCase().includes(lowerQuery) || 
      (img.ticketId && String(img.ticketId).includes(lowerQuery)) ||
      img.ticketTitle.toLowerCase().includes(lowerQuery)
    );
  }, [images, searchQuery]);

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredImages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredImages.map(img => img.id)));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;
    setIsDownloading(true);
    try {
      const response = await apiClient.post('/image-management/bulk-download', 
        { imageIds: Array.from(selectedIds) },
        { responseType: 'blob' }
      );
      
      const blob = response instanceof Blob ? response : (response as any).data || response;
      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `storage_export_${format(new Date(), 'ddMMM_HHmm')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Download started successfully');
    } catch (err) {
      toast.error('Failed to download images');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await apiClient.delete('/image-management/bulk-delete', {
        data: { imageIds: Array.from(selectedIds), confirmDelete: true }
      });
      const data = (response as any).data || response;
      toast.success(`Deleted ${data.deletedCount} images. Freed ${data.freedFormatted}`);
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
      fetchStats();
      fetchImages(pagination?.page || 1);
    } catch (err) {
      toast.error('Failed to delete images');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadIndividual = async (img: ImageItem) => {
    try {
      const url = getFullUrl(img.url);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = img.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
      toast.success('Download started');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download image. Opening in new tab instead.');
      window.open(getFullUrl(img.url), '_blank');
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    
    const apiRaw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
    // Strip /api if it exists to get the server root
    const baseUrl = apiRaw.replace(/\/api\/?$/, '');
    
    // Ensure we don't have double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBaseUrl}${cleanUrl}`;
  };

  return (
    <div className="min-h-screen bg-[#F0F4F7] p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-[#546A7A] tracking-tight">Image Management</h1>
            <p className="text-[#AEBFC3] font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Monitor and manage your internal storage efficiency
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="bg-white border-[#96AEC2]/30 text-[#6F8A9D] hover:bg-[#96AEC2]/10"
              onClick={() => { fetchStats(); fetchImages(); }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button 
              disabled={selectedIds.size === 0 || isDownloading}
              onClick={handleBulkDownload}
              className="bg-[#6F8A9D] hover:bg-[#546A7A] text-white shadow-md shadow-blue-900/10"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Downloading...' : `Download (${selectedIds.size})`}
            </Button>
            <Button 
              variant="destructive"
              disabled={selectedIds.size === 0}
              onClick={() => setShowDeleteConfirm(true)}
              className="shadow-md shadow-red-900/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Bulk Delete
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-xl bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <Image className="h-16 w-16 text-[#6F8A9D]" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[#AEBFC3] font-bold uppercase tracking-wider text-xs">Total Assets</CardDescription>
              <CardTitle className="text-3xl font-black text-[#546A7A]">{stats?.totalImages.toLocaleString() || '0'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min((stats?.totalImages || 0) / 100, 100)} className="h-2 bg-[#96AEC2]/10" />
              <p className="mt-2 text-xs text-[#AEBFC3]">Compressed image files stored locally</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
              <HardDrive className="h-16 w-16 text-[#82A094]" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[#AEBFC3] font-bold uppercase tracking-wider text-xs">Storage Volume</CardDescription>
              <CardTitle className="text-3xl font-black text-[#4F6A64]">{stats ? formatBytes(stats.totalSizeBytes) : '0 B'}</CardTitle>
            </CardHeader>
            <CardContent>
               <Progress value={Math.min((stats?.totalSizeBytes || 0) / (1024 * 1024 * 1024), 100)} className="h-2 bg-emerald-50" />
              <p className="mt-2 text-xs text-[#AEBFC3]">Optimized WebP/JPEG storage footprint</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#AEBFC3] font-bold uppercase tracking-wider text-xs">Storage Trend (Month over Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-24 pt-4">
                {stats?.byMonth.slice(-12).map((m, i) => (
                  <TooltipProvider key={m.month}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex-1 bg-gradient-to-t from-[#6F8A9D] to-[#96AEC2] rounded-t-sm transition-all hover:brightness-110 cursor-pointer"
                          style={{ height: `${Math.max(10, (m.sizeBytes / stats.byMonth[0]?.sizeBytes) * 100)}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-bold">{m.month}</p>
                        <p className="text-xs text-[#AEBFC3]">{m.count} images • {formatBytes(m.sizeBytes)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {(!stats || stats.byMonth.length === 0) && (
                  <div className="w-full flex items-center justify-center text-[#AEBFC3] italic">No historical data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          <div className="h-1 w-full bg-[#6F8A9D]"></div>
          
          <div className="p-6 border-b border-[#96AEC2]/10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AEBFC3]" />
              <Input 
                placeholder="Search by filename or Ticket ID..." 
                className="pl-10 h-11 bg-[#F0F4F7] border-none focus-visible:ring-2 focus-visible:ring-[#6F8A9D]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center bg-[#F0F4F7] p-1 rounded-lg">
                <Button 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className={`h-9 px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#6F8A9D]' : 'text-[#AEBFC3]'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className={`h-9 px-3 ${viewMode === 'list' ? 'bg-white shadow-sm text-[#6F8A9D]' : 'text-[#AEBFC3]'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-8 w-px bg-[#96AEC2]/20 mx-2 hidden lg:block" />

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#AEBFC3]" />
                <Input 
                  type="date" 
                  className="h-10 w-40 bg-[#F0F4F7] border-none text-xs"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="text-[#AEBFC3]">to</span>
                <Input 
                  type="date" 
                  className="h-10 w-40 bg-[#F0F4F7] border-none text-xs"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {/* Action Bar */}
            <div className="px-6 py-3 bg-[#F0F4F7]/50 border-b border-[#96AEC2]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="select-all" 
                  checked={filteredImages.length > 0 && selectedIds.size === filteredImages.length}
                  onCheckedChange={selectAll}
                />
                <label htmlFor="select-all" className="text-sm font-bold text-[#546A7A] cursor-pointer cursor-default">
                  Select All <span className="text-[#AEBFC3] font-medium ml-1">({filteredImages.length} visible)</span>
                </label>
              </div>
              
              {selectedIds.size > 0 && (
                <Badge className="bg-[#6F8A9D] text-white hover:bg-[#6F8A9D] px-3 py-1 animate-in zoom-in-95">
                  {selectedIds.size} Items Selected
                </Badge>
              )}
            </div>

            <div className="min-h-[600px] p-6">
              {loading ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h:grid-cols-10 gap-4" 
                  : "space-y-4"
                }>
                  {Array.from({ length: 12 }).map((_, i) => (
                    viewMode === 'grid' ? (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ) : (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    )
                  ))}
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-[#F0F4F7] flex items-center justify-center">
                    <Image className="h-10 w-10 text-[#AEBFC3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#546A7A]">No Images Found</h3>
                    <p className="text-[#AEBFC3]">Adjust your search or filter to find what you're looking for</p>
                  </div>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); }}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <Tabs value={viewMode} className="w-full">
                  <TabsContent value="grid" className="mt-0 outline-none">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-4">
                      {filteredImages.map((img) => (
                        <div 
                          key={img.id} 
                          className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all 
                            ${selectedIds.has(img.id) ? 'border-[#6F8A9D] ring-4 ring-[#6F8A9D]/10' : 'border-[#96AEC2]/10 hover:border-[#96AEC2]/30'}
                          `}
                        >
                          <img 
                            src={getFullUrl(img.url)} 
                            alt={img.filename}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                            onClick={() => setPreviewImage(img)}
                          />
                          
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none">
                            <div className="flex justify-between pointer-events-auto">
                              <Checkbox 
                                checked={selectedIds.has(img.id)}
                                onCheckedChange={() => toggleSelect(img.id)}
                                className="border-white data-[state=checked]:bg-[#6F8A9D] data-[state=checked]:border-[#6F8A9D]"
                              />
                              <div className="flex gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6 text-white hover:bg-white/20"
                                  onClick={(e) => { e.stopPropagation(); handleDownloadIndividual(img); }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-6 w-6 text-white hover:bg-white/20"
                                  onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-[10px] text-white font-medium truncate pointer-events-none bg-black/20 backdrop-blur-sm p-1 rounded">
                              {img.filename}
                            </div>
                          </div>
                          
                          {selectedIds.has(img.id) && (
                            <div className="absolute top-2 right-2 flex items-center justify-center p-1 rounded-full bg-[#6F8A9D] text-white shadow-lg pointer-events-none">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="list" className="mt-0 outline-none">
                    <div className="rounded-xl border border-[#96AEC2]/10 overflow-hidden bg-white">
                      <table className="w-full">
                        <thead className="bg-[#F0F4F7]">
                          <tr>
                            <th className="px-6 py-4 text-left w-10">Select</th>
                            <th className="px-6 py-4 text-left">Preview</th>
                            <th className="px-6 py-4 text-left">Filename & Context</th>
                            <th className="px-6 py-4 text-left">Dimensions & Size</th>
                            <th className="px-6 py-4 text-left">Uploaded</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredImages.map((img) => (
                            <tr key={img.id} className="border-t border-[#96AEC2]/10 hover:bg-[#F0F4F7]/30 transition-colors group">
                              <td className="px-6 py-4">
                                <Checkbox 
                                  checked={selectedIds.has(img.id)}
                                  onCheckedChange={() => toggleSelect(img.id)}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div 
                                  className="w-12 h-12 rounded-lg bg-[#F0F4F7] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#6F8A9D] transition-all"
                                  onClick={() => setPreviewImage(img)}
                                >
                                  <img src={getFullUrl(img.url)} alt="" className="w-full h-full object-cover" />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[#546A7A] text-sm break-all">{img.filename}</div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] py-0 bg-blue-50/50 border-blue-100 text-[#6F8A9D]">
                                      Ticket #{img.ticketId}
                                    </Badge>
                                    <span className="text-[11px] text-[#AEBFC3] truncate max-w-[200px]">{img.ticketTitle}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-[#4F6A64]">
                                {img.sizeFormatted}
                              </td>
                              <td className="px-6 py-4 text-sm text-[#AEBFC3]">
                                {format(new Date(img.createdAt), 'dd MMM yyyy, HH:mm')}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-[#AEBFC3] hover:text-[#6F8A9D] opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDownloadIndividual(img)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-[#AEBFC3] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => { setSelectedIds(new Set([img.id])); setShowDeleteConfirm(true); }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-6 border-t border-[#96AEC2]/10 flex items-center justify-between">
                <div className="text-sm text-[#AEBFC3]">
                  Showing page <span className="font-bold text-[#546A7A]">{pagination.page}</span> of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={pagination.page <= 1}
                    onClick={() => fetchImages(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                       let p = i + 1;
                       if (pagination.totalPages > 5 && pagination.page > 3) {
                         p = pagination.page - 3 + i;
                         if (p > pagination.totalPages) p = pagination.totalPages - (4 - i);
                       }
                       if (p < 1) return null;
                       return (
                        <Button 
                          key={p}
                          variant={pagination.page === p ? 'default' : 'outline'} 
                          size="sm"
                          className={`w-9 h-9 ${pagination.page === p ? 'bg-[#6F8A9D]' : ''}`}
                          onClick={() => fetchImages(p)}
                        >
                          {p}
                        </Button>
                      );
                    })}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchImages(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail/Lightbox Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl border-none shadow-2xl p-0 overflow-hidden bg-white rounded-2xl">
          {previewImage && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              <div className="flex-1 bg-[#F0F4F7] flex items-center justify-center p-4 relative group">
                <img 
                  src={getFullUrl(previewImage.url)} 
                  alt={previewImage.filename}
                  className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg"
                />
                <a 
                  href={getFullUrl(previewImage.url)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute bottom-6 right-6 p-3 rounded-full bg-white/80 backdrop-blur shadow-xl text-[#6F8A9D] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              
              <div className="w-full md:w-80 p-8 flex flex-col justify-between border-l border-[#96AEC2]/10">
                <div className="space-y-8">
                  <header>
                    <Badge className="mb-2 bg-[#6F8A9D]/10 text-[#6F8A9D] hover:bg-[#6F8A9D]/20 border-none px-2 py-0.5 uppercase tracking-widest text-[10px] font-black">
                      Metadata Details
                    </Badge>
                    <h3 className="text-xl font-black text-[#546A7A] leading-tight break-all">
                      {previewImage.filename}
                    </h3>
                  </header>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#6F8A9D] shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#AEBFC3] uppercase tracking-wider">Associated Ticket</p>
                        <p className="text-sm font-bold text-[#546A7A]">#{previewImage.ticketId}</p>
                        <p className="text-xs text-[#AEBFC3] leading-relaxed mt-0.5">{previewImage.ticketTitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#82A094] shrink-0">
                        <Info className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#AEBFC3] uppercase tracking-wider">Storage Info</p>
                        <p className="text-sm font-bold text-[#546A7A]">{previewImage.sizeFormatted}</p>
                        <p className="text-xs text-[#AEBFC3] mt-0.5">{format(new Date(previewImage.createdAt), 'dd MMMM yyyy')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 flex flex-col gap-3">
                  <Button 
                    className="w-full bg-[#6F8A9D] hover:bg-[#546A7A]"
                    onClick={() => handleDownloadIndividual(previewImage)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Original
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100"
                    onClick={() => {
                      setPreviewImage(null);
                      setSelectedIds(new Set([previewImage.id]));
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Asset
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md border-none shadow-2xl p-8 bg-white rounded-2xl text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <Trash2 className="h-10 w-10 text-red-500" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#546A7A] text-center">Irreversible Deletion</DialogTitle>
            <DialogDescription className="text-center text-[#AEBFC3] pt-2 pb-6">
              You are about to permanently delete <strong className="text-red-500">{selectedIds.size}</strong> image assets. This will free up storage space but those images cannot be recovered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-xl text-base" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              No, Keep Them
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 h-12 rounded-xl text-base shadow-lg shadow-red-900/20" 
              disabled={isDeleting}
              onClick={handleBulkDelete}
            >
              {isDeleting ? 'Processing...' : 'Yes, Delete Assets'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
