'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  Filter,
  Loader2,
  Package,
  DollarSign,
  Tag,
  Grid3x3,
  List,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Eye,
  Calendar,
  Hash,
  Info,
  X,
} from 'lucide-react'
import { apiService } from '@/services/api'
import { toast } from 'sonner'

const statuses = ['All Status', 'ACTIVE', 'INACTIVE', 'DISCONTINUED']
const categories = ['All Categories', 'Hardware', 'Software', 'Consumables', 'Tools', 'Accessories']

interface SparePartsListProps {
  defaultView?: 'grid' | 'list'
  readOnly?: boolean
}

export default function SparePartsList({ defaultView = 'list', readOnly = false }: SparePartsListProps) {
  const [spareParts, setSpareParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView)
  const [pagination, setPagination] = useState({ page: 1, limit: 1000, total: 0, pages: 0 })
  const [pageSize, setPageSize] = useState(1000)
  const [showAll, setShowAll] = useState(false)
  
  // View modal state
  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')


  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchSpareParts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedStatus, selectedCategory, pagination.page, pageSize, showAll])

  const fetchSpareParts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {
        page: showAll ? 1 : pagination.page,
        limit: showAll ? 10000 : pageSize,
      }

      if (debouncedSearchTerm) params.search = debouncedSearchTerm
      if (selectedStatus !== 'All Status') params.status = selectedStatus
      if (selectedCategory !== 'All Categories') params.category = selectedCategory

      const response = await apiService.getSpareParts(params)
      setSpareParts(response.spareParts || [])
      setPagination(response.pagination || { page: 1, limit: showAll ? 10000 : pageSize, total: 0, pages: 0 })
    } catch (error: any) {
      console.error('Failed to fetch spare parts:', error)
      toast.error(error.response?.data?.error || 'Failed to fetch spare parts')
      setSpareParts([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pageSize, debouncedSearchTerm, selectedStatus, selectedCategory, showAll])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Kardex Company Colors for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-[#4F6A64] bg-[#A2B9AF]/20 border-[#A2B9AF]'    // Green
      case 'INACTIVE':
        return 'text-[#757777] bg-[#979796]/20 border-[#979796]'    // Grey
      case 'DISCONTINUED':
        return 'text-[#9E3B47] bg-[#E17F70]/20 border-[#E17F70]'    // Red
      default:
        return 'text-[#757777] bg-[#979796]/20 border-[#979796]'
    }
  }

  // Kardex Company Colors for category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hardware':
        return 'text-[#546A7A] bg-[#96AEC2]/20'     // Blue 1
      case 'Software':
        return 'text-[#6F8A9D] bg-[#6F8A9D]/20'     // Blue 2
      case 'Consumables':
        return 'text-[#976E44] bg-[#CE9F6B]/20'     // Sand
      case 'Tools':
        return 'text-[#4F6A64] bg-[#82A094]/20'     // Green 2
      case 'Accessories':
        return 'text-[#546A7A] bg-[#96AEC2]/20'     // Blue 3
      default:
        return 'text-[#757777] bg-[#979796]/20'     // Grey
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setSelectedStatus('All Status')
    setSelectedCategory('All Categories')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageSizeChange = (newSize: number) => {
    if (newSize === 9999) {
      setShowAll(true)
      setPagination(prev => ({ ...prev, page: 1 }))
    } else {
      setShowAll(false)
      setPageSize(newSize)
      setPagination(prev => ({ ...prev, page: 1, limit: newSize }))
    }
  }

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalActive = useMemo(() => spareParts.filter(p => p.status === 'ACTIVE').length, [spareParts])
  const avgPrice = useMemo(() => {
    return spareParts.length > 0
      ? formatCurrency(spareParts.reduce((sum, p) => sum + Number(p.basePrice || 0), 0) / spareParts.length)
      : '₹0'
  }, [spareParts])
  const totalCategories = useMemo(() => new Set(spareParts.map(p => p.category).filter(Boolean)).size, [spareParts])

  return (
    <>
    <div className="space-y-8 p-6 bg-gradient-to-br from-[#AEBFC3]/10 via-[#96AEC2]/10/30 to-[#6F8A9D]/10/50 min-h-screen">
      {/* Premium Hero Header - Kardex Colors */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#96AEC2] via-[#6F8A9D] to-[#546A7A] p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/30 shadow-xl">
                <Package className="w-12 h-12 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                Spare Parts Catalog
                <Sparkles className="w-8 h-8 text-[#CE9F6B] animate-pulse" />
              </h1>
              <p className="text-[#96AEC2] text-lg max-w-xl">
                Browse spare parts inventory and pricing for SPP offers
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white px-6 py-6 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg" onClick={fetchSpareParts}>
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#AEBFC3]/30 hover:border-[#96AEC2]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F8A9D]/5 to-[#6F8A9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6F8A9D]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[#546A7A] uppercase tracking-widest mb-1">Total Parts</p>
                <p className="text-4xl font-black text-[#546A7A]">{pagination.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#96AEC2] to-[#6F8A9D] rounded-xl shadow-lg shadow-[#96AEC2]/30 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#AEBFC3]/30 hover:border-[#82A094]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#A2B9AF]/5 to-[#82A094]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#A2B9AF]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[#4F6A64] uppercase tracking-widest mb-1">Active Parts</p>
                <p className="text-4xl font-black text-[#546A7A]">{totalActive}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#A2B9AF] to-[#82A094] rounded-xl shadow-lg shadow-[#A2B9AF]/30 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#AEBFC3]/30 hover:border-[#CE9F6B]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EEC1BF]/5 to-[#CE9F6B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#EEC1BF]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[#976E44] uppercase tracking-widest mb-1">Avg. Price</p>
                <p className="text-4xl font-black text-[#546A7A]">{avgPrice}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#EEC1BF] to-[#CE9F6B] rounded-xl shadow-lg shadow-[#EEC1BF]/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#AEBFC3]/30 hover:border-[#6F8A9D]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6F8A9D]/5 to-[#546A7A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6F8A9D]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[#546A7A] uppercase tracking-widest mb-1">Categories</p>
                <p className="text-4xl font-black text-[#546A7A]">{totalCategories}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] rounded-xl shadow-lg shadow-[#6F8A9D]/30 group-hover:scale-110 transition-transform">
                <Tag className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-[#AEBFC3]/10 to-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#546A7A]" />
              <CardTitle className="text-lg">Search & Filters</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-semibold text-[#5D6E73]">Search Parts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#979796]" />
                <Input
                  id="search"
                  placeholder="Search by name or part number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#5D6E73]">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {status !== 'All Status' && (
                          <div className={`w-2 h-2 rounded-full ${
                            status === 'ACTIVE' ? 'bg-[#82A094]' :
                            status === 'INACTIVE' ? 'bg-[#979796]' :
                            status === 'DISCONTINUED' ? 'bg-[#E17F70]' : ''
                          }`} />
                        )}
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#5D6E73]">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-11 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#96AEC2]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${showAll ? 'bg-[#A2B9AF]/20 text-[#4F6A64]' : 'bg-[#96AEC2]/20 text-[#546A7A]'}`}>
                {showAll ? `Showing all ${spareParts.length} parts` : `Showing ${((pagination.page - 1) * pageSize) + 1}-${Math.min(pagination.page * pageSize, pagination.total)} of ${pagination.total} parts`}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-[#5D6E73]">Per page:</Label>
                <Select value={showAll ? '9999' : pageSize.toString()} onValueChange={(val) => handlePageSizeChange(Number(val))}>
                  <SelectTrigger className="h-9 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="9999">✨ Show All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 border-2 border-[#92A2A5] rounded-lg p-1 bg-white">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-9 px-4"
                >
                  <Grid3x3 className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-9 px-4"
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
              <Button variant="outline" onClick={clearFilters} className="shadow-sm hover:shadow-md transition-shadow">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spare Parts Display */}
      {loading ? (
        <Card className="shadow-lg border-0">
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-[#6F8A9D] mb-4" />
              <p className="text-xl font-semibold text-[#5D6E73]">Loading spare parts...</p>
              <p className="text-sm text-[#AEBFC3]0 mt-2">Please wait while we fetch the data</p>
            </div>
          </CardContent>
        </Card>
      ) : spareParts.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center">
              <div className="p-6 bg-gradient-to-br from-[#96AEC2]/10 to-[#6F8A9D]/10 rounded-2xl mb-6">
                <Package className="h-20 w-20 text-[#6F8A9D]" />
              </div>
              <h3 className="text-2xl font-bold text-[#546A7A] mb-2">No spare parts found</h3>
              <p className="text-[#5D6E73] mb-2">Try adjusting your filters</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {spareParts.map((part: any) => (
              <Card key={part.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-[#6F8A9D] bg-white">
                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative h-52 bg-gradient-to-br from-[#AEBFC3]/10 via-gray-100 to-gray-200 overflow-hidden">
                    {part.imageUrl ? (
                      <img
                        src={part.imageUrl}
                        alt={part.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-24 w-24 text-[#92A2A5]" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 shadow-lg backdrop-blur-sm ${getStatusColor(part.status)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          part.status === 'ACTIVE' ? 'bg-[#82A094]' :
                          part.status === 'INACTIVE' ? 'bg-[#979796]' :
                          'bg-[#E17F70]'
                        }`} />
                        {part.status}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-[#546A7A] text-lg line-clamp-2 group-hover:text-[#546A7A] transition-colors leading-tight">
                        {part.name}
                      </h3>
                      <p className="text-xs text-[#AEBFC3]0 font-mono bg-[#AEBFC3]/20 px-2 py-1 rounded mt-2 inline-block">
                        #{part.partNumber}
                      </p>
                    </div>

                    {part.category && (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getCategoryColor(part.category)}`}>
                        <Tag className="h-3 w-3" />
                        {part.category}
                      </div>
                    )}

                    {part.description && part.description !== part.name && (
                      <p className="text-sm text-[#5D6E73] line-clamp-2 leading-relaxed">{part.description}</p>
                    )}

                    <div className="pt-3 border-t-2 border-[#AEBFC3]/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#5D6E73]">Price</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-5 w-5 text-[#4F6A64]" />
                          <span className="text-2xl font-bold text-[#546A7A]">
                            {formatCurrency(Number(part.basePrice))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#AEBFC3]0 pt-2">
                      {!readOnly && (
                        <span className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-[#979796]" />
                          Added {new Date(part.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPart(part);
                          setIsViewModalOpen(true);
                        }}
                        className="h-7 px-2 text-xs border-[#96AEC2] text-[#546A7A] hover:bg-[#96AEC2]/10"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination for Grid View */}
          {!showAll && pagination.pages > 1 && (
            <Card className="shadow-lg border-0 mt-6">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#5D6E73]">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => goToPage(1)} disabled={pagination.page === 1}>First</Button>
                    <Button variant="outline" size="sm" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>Previous</Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum
                        if (pagination.pages <= 5) pageNum = i + 1
                        else if (pagination.page <= 3) pageNum = i + 1
                        else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                        else pageNum = pagination.page - 2 + i
                        return (
                          <Button key={pageNum} variant={pagination.page === pageNum ? 'default' : 'outline'} size="sm" onClick={() => goToPage(pageNum)} className="w-10">
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}>Next</Button>
                    <Button variant="outline" size="sm" onClick={() => goToPage(pagination.pages)} disabled={pagination.page === pagination.pages}>Last</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="shadow-2xl border-0 overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Part Details</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Base Price</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                    {!readOnly && <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Created</th>}
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {spareParts.map((part: any) => (
                    <tr key={part.id} className="hover:bg-[#96AEC2]/10 transition-colors">
                      <td className="px-6 py-4">
                        {part.imageUrl ? (
                          <img src={part.imageUrl} alt={part.name} className="w-16 h-16 object-cover rounded-xl border-2 border-[#92A2A5] shadow-sm" />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-[#AEBFC3]/20 to-gray-200 rounded-xl border-2 border-[#92A2A5] flex items-center justify-center shadow-sm">
                            <Package className="h-8 w-8 text-[#979796]" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[#546A7A]">{part.name}</p>
                          <p className="text-xs text-[#AEBFC3]0 font-mono bg-[#AEBFC3]/20 px-2 py-0.5 rounded inline-block">#{part.partNumber}</p>
                          {part.description && (
                            <p className="text-xs text-[#AEBFC3]0 mt-1 max-w-xs truncate">{part.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {part.category && (
                          <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getCategoryColor(part.category)}`}>
                            {part.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-[#4F6A64]" />
                          <span className="text-sm font-bold text-[#546A7A]">{formatCurrency(Number(part.basePrice))}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 shadow-sm ${getStatusColor(part.status)}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            part.status === 'ACTIVE' ? 'bg-[#82A094]' :
                            part.status === 'INACTIVE' ? 'bg-[#979796]' :
                            'bg-[#E17F70]'
                          }`} />
                          {part.status}
                        </div>
                      </td>
                      {!readOnly && (
                        <td className="px-6 py-4 text-sm text-[#5D6E73]">
                          {new Date(part.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPart(part);
                            setIsViewModalOpen(true);
                          }}
                          className="h-8 px-3 border-[#96AEC2] text-[#546A7A] hover:bg-[#96AEC2]/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          {/* Pagination for List View */}
          {!showAll && pagination.pages > 1 && (
            <CardContent className="border-t py-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#5D6E73]">
                  Page {pagination.page} of {pagination.pages} • {pagination.total} total parts
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => goToPage(1)} disabled={pagination.page === 1}>First</Button>
                  <Button variant="outline" size="sm" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page === 1}>Previous</Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum
                      if (pagination.pages <= 5) pageNum = i + 1
                      else if (pagination.page <= 3) pageNum = i + 1
                      else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i
                      else pageNum = pagination.page - 2 + i
                      return (
                        <Button key={pageNum} variant={pagination.page === pageNum ? 'default' : 'outline'} size="sm" onClick={() => goToPage(pageNum)} className="w-10">
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}>Next</Button>
                  <Button variant="outline" size="sm" onClick={() => goToPage(pagination.pages)} disabled={pagination.page === pagination.pages}>Last</Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>

      {/* View Spare Part Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-[#96AEC2]/20 rounded-lg">
                <Package className="h-5 w-5 text-[#546A7A]" />
              </div>
              Spare Part Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this spare part
            </DialogDescription>
          </DialogHeader>
          
          {selectedPart && (
            <div className="space-y-6 mt-4">
              {/* Image and Basic Info */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {selectedPart.imageUrl ? (
                    <img 
                      src={selectedPart.imageUrl} 
                      alt={selectedPart.name}
                      className="w-32 h-32 object-cover rounded-xl border-2 border-[#92A2A5] shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-[#AEBFC3]/20 to-gray-200 rounded-xl border-2 border-[#92A2A5] flex items-center justify-center shadow-lg">
                      <Package className="h-12 w-12 text-[#979796]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#546A7A]">{selectedPart.name}</h3>
                    <p className="text-sm text-[#AEBFC3]0 font-mono bg-[#AEBFC3]/20 px-2 py-1 rounded inline-block mt-1">
                      #{selectedPart.partNumber}
                    </p>
                  </div>
                  {selectedPart.description && (
                    <p className="text-[#5D6E73] text-sm">{selectedPart.description}</p>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="p-4 bg-[#AEBFC3]/10 rounded-xl border border-[#AEBFC3]/30">
                  <div className="flex items-center gap-2 text-[#AEBFC3]0 text-sm mb-1">
                    <Tag className="h-4 w-4" />
                    Category
                  </div>
                  <p className="font-semibold text-[#546A7A]">{selectedPart.category || 'N/A'}</p>
                </div>

                {/* Status */}
                <div className="p-4 bg-[#AEBFC3]/10 rounded-xl border border-[#AEBFC3]/30">
                  <div className="flex items-center gap-2 text-[#AEBFC3]0 text-sm mb-1">
                    <Info className="h-4 w-4" />
                    Status
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(selectedPart.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      selectedPart.status === 'ACTIVE' ? 'bg-[#82A094]' :
                      selectedPart.status === 'INACTIVE' ? 'bg-[#979796]' :
                      'bg-[#E17F70]'
                    }`} />
                    {selectedPart.status}
                  </div>
                </div>

                {/* Base Price */}
                <div className={`p-4 bg-gradient-to-r from-[#A2B9AF]/20 to-[#82A094]/20 rounded-xl border border-[#A2B9AF] ${readOnly ? 'col-span-2' : ''}`}>
                  <div className="flex items-center gap-2 text-[#4F6A64] text-sm mb-1">
                    <DollarSign className="h-4 w-4" />
                    Base Price
                  </div>
                  <p className="font-bold text-2xl text-[#4F6A64]">{formatCurrency(Number(selectedPart.basePrice))}</p>
                </div>

                {/* Created Date - Only for non-readOnly users */}
                {!readOnly && (
                  <div className="p-4 bg-[#AEBFC3]/10 rounded-xl border border-[#AEBFC3]/30">
                    <div className="flex items-center gap-2 text-[#AEBFC3]0 text-sm mb-1">
                      <Calendar className="h-4 w-4" />
                      Added On
                    </div>
                    <p className="font-semibold text-[#546A7A]">
                      {new Date(selectedPart.createdAt).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gradient-to-r from-[#6F8A9D] to-[#546A7A] hover:from-[#546A7A] hover:to-[#4F6A64]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
