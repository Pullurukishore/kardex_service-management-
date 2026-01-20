'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import apiClient from '@/lib/api/api-client';

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
  ticketId: number;
  ticketTitle: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ImageManagementPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<ImageStats>('/image-management/stats');
      // Response is wrapped in ApiResponse, but backend returns raw data
      // So check both response.data (wrapped) and response itself (raw)
      const statsData = (response as any)?.data || response;
      if (statsData?.totalImages !== undefined) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchImages = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '100' });
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);

      const response = await apiClient.get<{ images: ImageItem[]; pagination: Pagination }>(`/image-management/images?${params}`);
      // Response could be wrapped in ApiResponse or raw data
      const imagesData = (response as any)?.data || response;
      if (imagesData?.images) {
        setImages(imagesData.images || []);
        setPagination(imagesData.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchImages();
  }, []);

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
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map(img => img.id)));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;
    
    setDownloading(true);
    try {
      // Helper to get cookie (same as api-client.ts)
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift() || null;
        }
        return null;
      };
      
      // Get token from multiple sources (exact same as api-client.ts)
      const token = localStorage.getItem('accessToken') || 
                   localStorage.getItem('token') ||
                   getCookie('accessToken') || 
                   getCookie('token') ||
                   localStorage.getItem('cookie_accessToken');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
      const res = await fetch(`${apiUrl}/image-management/bulk-download`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds: Array.from(selectedIds) }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `images_export_${format(new Date(), 'yyyyMMdd')}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        setSelectedIds(new Set());
      } else {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const error = await res.json();
          alert(`Download failed: ${error.error || 'Unknown error'}`);
        } else {
          alert('Download failed: Server error');
        }
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download images');
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setDeleting(true);
    try {
      // Helper to get cookie (same as api-client.ts)
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift() || null;
        }
        return null;
      };
      
      // Get token from multiple sources (exact same as api-client.ts)
      const token = localStorage.getItem('accessToken') || 
                   localStorage.getItem('token') ||
                   getCookie('accessToken') || 
                   getCookie('token') ||
                   localStorage.getItem('cookie_accessToken');
                   
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';
      const res = await fetch(`${apiUrl}/image-management/bulk-delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds: Array.from(selectedIds), confirmDelete: true }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Deleted ${result.deletedCount} images. Freed ${result.freedFormatted}`);
        setSelectedIds(new Set());
        setShowDeleteConfirm(false);
        fetchStats();
        fetchImages(pagination?.page || 1);
      } else {
        const error = await res.json();
        alert(`Delete failed: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete images');
    } finally {
      setDeleting(false);
    }
  };

  const handleFilter = () => {
    fetchImages(1);
    setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5D6E73] via-slate-800 to-[#5D6E73] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📦 Image Storage Management</h1>
          <p className="text-[#979796]">Bulk download and delete images to manage storage space</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold">{stats.totalImages.toLocaleString()}</div>
              <div className="text-[#96AEC2]">Total Images</div>
            </div>
            <div className="bg-gradient-to-br from-[#82A094] to-[#4F6A64] rounded-xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold">{formatBytes(stats.totalSizeBytes)}</div>
              <div className="text-emerald-100">Total Storage Used</div>
            </div>
            <div className="bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl p-6 text-white shadow-lg">
              <div className="text-4xl font-bold">{stats.byMonth.length}</div>
              <div className="text-[#6F8A9D]">Months with Data</div>
            </div>
          </div>
        )}

        {/* Storage by Month */}
        {stats && stats.byMonth.length > 0 && (
          <div className="bg-[#546A7A]/50 backdrop-blur rounded-xl p-6 mb-8 border border-[#5D6E73]">
            <h2 className="text-xl font-semibold text-white mb-4">📅 Storage by Month</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {stats.byMonth.slice(0, 12).map(m => (
                <div key={m.month} className="bg-[#5D6E73]/50 rounded-lg p-3 text-center">
                  <div className="text-sm text-[#979796]">{m.month}</div>
                  <div className="text-lg font-semibold text-white">{m.count}</div>
                  <div className="text-xs text-[#757777]">{formatBytes(m.sizeBytes)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-[#546A7A]/50 backdrop-blur rounded-xl p-6 mb-6 border border-[#5D6E73]">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-[#979796] mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-[#5D6E73] border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-[#979796] mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-[#5D6E73] border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <button
              onClick={handleFilter}
              className="bg-[#6F8A9D] hover:bg-[#546A7A] text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Filter
            </button>
            <div className="flex-1" />
            <div className="text-[#979796] text-sm">
              Selected: <span className="text-white font-bold">{selectedIds.size}</span> images
            </div>
            <button
              onClick={handleBulkDownload}
              disabled={selectedIds.size === 0 || downloading}
              className="bg-[#4F6A64] hover:bg-[#4F6A64] disabled:bg-[#5D6E73] disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              {downloading ? '⏳ Downloading...' : '⬇️ Download ZIP'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedIds.size === 0}
              className="bg-[#9E3B47] hover:bg-[#75242D] disabled:bg-[#5D6E73] disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
            >
              🗑️ Delete Selected
            </button>
          </div>
        </div>

        {/* Images Table */}
        <div className="bg-[#546A7A]/50 backdrop-blur rounded-xl border border-[#5D6E73] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#5D6E73]/50">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={images.length > 0 && selectedIds.size === images.length}
                      onChange={selectAll}
                      className="w-5 h-5 rounded"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-[#92A2A5]">Preview</th>
                  <th className="p-4 text-left text-sm font-medium text-[#92A2A5]">Filename</th>
                  <th className="p-4 text-left text-sm font-medium text-[#92A2A5]">Size</th>
                  <th className="p-4 text-left text-sm font-medium text-[#92A2A5]">Date</th>
                  <th className="p-4 text-left text-sm font-medium text-[#92A2A5]">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#979796]">
                      Loading images...
                    </td>
                  </tr>
                ) : images.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#979796]">
                      No images found
                    </td>
                  </tr>
                ) : (
                  images.map(img => (
                    <tr
                      key={img.id}
                      className={`border-t border-[#5D6E73] hover:bg-[#5D6E73]/30 transition ${
                        selectedIds.has(img.id) ? 'bg-[#546A7A]/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(img.id)}
                          onChange={() => toggleSelect(img.id)}
                          className="w-5 h-5 rounded"
                        />
                      </td>
                      <td className="p-4">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5003'}${img.url}`}
                          alt={img.filename}
                          className="w-16 h-16 object-cover rounded-lg bg-[#5D6E73]"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.png'; }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm font-mono truncate max-w-xs">{img.filename}</div>
                      </td>
                      <td className="p-4 text-[#92A2A5]">{img.sizeFormatted}</td>
                      <td className="p-4 text-[#92A2A5]">
                        {format(new Date(img.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="p-4">
                        <a
                          href={`/admin/tickets/${img.ticketId}/list`}
                          className="text-[#6F8A9D] hover:text-[#96AEC2]"
                        >
                          #{img.ticketId}
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-[#5D6E73]">
              {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => fetchImages(page)}
                  className={`px-4 py-2 rounded-lg transition ${
                    page === pagination.page
                      ? 'bg-[#6F8A9D] text-white'
                      : 'bg-[#5D6E73] text-[#92A2A5] hover:bg-[#5D6E73]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#546A7A] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[#5D6E73]">
            <h3 className="text-2xl font-bold text-white mb-4">⚠️ Confirm Delete</h3>
            <p className="text-[#92A2A5] mb-6">
              Are you sure you want to delete <strong className="text-[#E17F70]">{selectedIds.size}</strong> images?
              <br /><br />
              <span className="text-[#E17F70] font-medium">This action cannot be undone!</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-[#5D6E73] hover:bg-[#5D6E73] text-white py-3 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex-1 bg-[#9E3B47] hover:bg-[#75242D] disabled:bg-[#75242D] text-white py-3 rounded-lg font-medium transition"
              >
                {deleting ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
