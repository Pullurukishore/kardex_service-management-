'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/user.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  MoreHorizontal, 
  Pencil as Edit, 
  Trash2, 
  Plus,
  RefreshCw,
  Loader2,
  Eye,
  Building2,
  TrendingUp,
  Package,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  Wrench,
  Calendar,
  Sparkles,
  XCircle,
  Flag,
  Ticket,
  Shield,
  Headphones
} from 'lucide-react'
import Link from 'next/link'
import { apiService } from '@/services/api'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Ticket statuses
const statuses = [
  'All Status',
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'ONSITE_VISIT_PLANNED',
  'ONSITE_VISIT',
  'CLOSED_PENDING',
  'CLOSED',
  'SPARE_PARTS_NEEDED',
  'SPARE_PARTS_BOOKED',
  'SPARE_PARTS_DELIVERED',
  'PO_NEEDED',
  'PO_RECEIVED'
]

const priorities = ['All Priority', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const views = ['All', 'Unassigned', 'Assigned to Zone', 'Assigned to Service Person']

export default function AdminTicketsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  // All state hooks at the top
  const [tickets, setTickets] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0, totalPages: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedZone, setSelectedZone] = useState('All Zones')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedPriority, setSelectedPriority] = useState('All Priority')
  const [selectedView, setSelectedView] = useState('All')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Memoized values
  const hasActiveFilters = useMemo(() => 
    searchTerm || 
    selectedZone !== 'All Zones' || 
    selectedStatus !== 'All Status' || 
    selectedPriority !== 'All Priority' || 
    selectedView !== 'All',
    [searchTerm, selectedZone, selectedStatus, selectedPriority, selectedView]
  )

  // Authentication check effect
  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push('/auth/login?callbackUrl=' + encodeURIComponent('/admin/tickets'))
      return
    }
    
    if (user?.role !== UserRole.ADMIN) {
      router.push('/admin/dashboard')
    }
  }, [authLoading, isAuthenticated, user?.role, router])

  const fetchZones = async () => {
    try {
      const response = await apiService.getZones()
      const zonesData = response?.data?.zones || response?.zones || response?.data || response || []
      setZones(Array.isArray(zonesData) ? zonesData : [])
    } catch (error: any) {
      console.error('Failed to fetch zones:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch zones')
      setZones([])
    }
  }

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      
      if (searchTerm) params.search = searchTerm
      if (selectedZone !== 'All Zones') {
        const zid = parseInt(selectedZone)
        if (!isNaN(zid)) params.zoneId = zid
      }
      if (selectedStatus !== 'All Status') params.status = selectedStatus
      if (selectedPriority !== 'All Priority') params.priority = selectedPriority
      if (selectedView === 'Unassigned') params.view = 'unassigned'
      if (selectedView === 'Assigned to Zone') params.view = 'assigned-to-zone'
      if (selectedView === 'Assigned to Service Person') params.view = 'assigned-to-service-person'
      if (selectedView === 'Assigned to Zone Manager') params.view = 'assigned-to-zone-manager'
      if (selectedView === 'Assigned to Expert Helpdesk') params.view = 'assigned-to-expert-helpdesk'

      const response = await apiService.getTickets(params)
      setTickets(response.data || [])
      setPagination(response.pagination || { page: 1, limit: 100, total: 0, totalPages: 0 })
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error)
      toast.error(error.response?.data?.error || 'Failed to fetch tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  // Data fetching effects
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== UserRole.ADMIN) {
      return
    }
    
    const timeoutId = setTimeout(() => {
      fetchTickets()
    }, searchTerm ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedZone, selectedStatus, selectedPriority, selectedView, pagination.page, authLoading, isAuthenticated, user?.role])

  // Fetch zones on mount and when auth changes
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== UserRole.ADMIN) {
      return
    }
    
    const loadZones = async () => {
      try {
        const response = await apiService.getZones()
        const zonesData = response?.data?.zones || response?.zones || response?.data || response || []
        setZones(Array.isArray(zonesData) ? zonesData : [])
      } catch (error: any) {
        console.error('Failed to fetch zones:', error)
        toast.error(error.response?.data?.message || 'Failed to fetch zones')
        setZones([])
      }
    }
    
    loadZones()
  }, [authLoading, isAuthenticated, user?.role])

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#9E3B47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D6E73] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not ADMIN
  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return null
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedZone('All Zones')
    setSelectedStatus('All Status')
    setSelectedPriority('All Priority')
    setSelectedView('All')
    setPagination(prev => ({ ...prev, page: 1 }))
  }


  // Sort tickets
  const sortedTickets = useMemo(() => {
    if (!sortField) return tickets
    
    return [...tickets].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      // Handle nested properties
      if (sortField === 'customer') {
        aValue = a.customer?.companyName || ''
        bValue = b.customer?.companyName || ''
      } else if (sortField === 'zone') {
        aValue = a.zone?.name || ''
        bValue = b.zone?.name || ''
      } else if (sortField === 'assignedTo') {
        aValue = a.assignedTo?.name || ''
        bValue = b.assignedTo?.name || ''
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [tickets, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Calculate statistics
  const stats = {
    total: pagination.total,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => ['ASSIGNED', 'IN_PROGRESS', 'ONSITE_VISIT_PLANNED', 'ONSITE_VISIT'].includes(t.status)).length,
    closed: tickets.filter(t => ['CLOSED', 'CLOSED_PENDING'].includes(t.status)).length,
    critical: tickets.filter(t => t.priority === 'CRITICAL').length,
  }

  // Kardex Company Colors for status
  const getStatusStyle = (status: string) => {
    switch (status) {
      // Open/New - Blue 1
      case 'OPEN':
        return 'bg-[#96AEC2] text-white'
      // Assignment - Blue 2
      case 'ASSIGNED':
        return 'bg-[#6F8A9D] text-white'
      // In Progress - Blue 3
      case 'IN_PROGRESS':
        return 'bg-[#546A7A] text-white'
      // Onsite Visit stages - Green palette
      case 'ONSITE_VISIT_PLANNED':
        return 'bg-[#A2B9AF] text-white'
      case 'ONSITE_VISIT':
        return 'bg-[#82A094] text-white'
      case 'ONSITE_VISIT_STARTED':
        return 'bg-[#A2B9AF] text-white'
      case 'ONSITE_VISIT_REACHED':
        return 'bg-[#82A094] text-white'
      case 'ONSITE_VISIT_IN_PROGRESS':
        return 'bg-[#EEC18F] text-white'
      case 'ONSITE_VISIT_RESOLVED':
        return 'bg-[#4F6A64] text-white'
      case 'ONSITE_VISIT_PENDING':
        return 'bg-[#CE9F6B] text-white'
      case 'ONSITE_VISIT_COMPLETED':
        return 'bg-[#4F6A64] text-white'
      // Spare Parts stages - Sand palette
      case 'SPARE_PARTS_NEEDED':
        return 'bg-[#E17F70] text-white'
      case 'SPARE_PARTS_BOOKED':
        return 'bg-[#CE9F6B] text-white'
      case 'SPARE_PARTS_DELIVERED':
        return 'bg-[#82A094] text-white'
      // PO stages - Sand/Blue palette
      case 'PO_NEEDED':
        return 'bg-[#976E44] text-white'
      case 'PO_REACHED':
        return 'bg-[#6F8A9D] text-white'
      case 'PO_RECEIVED':
        return 'bg-[#546A7A] text-white'
      // Closure stages - Grey/Silver palette
      case 'CLOSED_PENDING':
        return 'bg-[#EEC18F] text-white'
      case 'CLOSED':
        return 'bg-[#979796] text-white'
      case 'CANCELLED':
        return 'bg-[#9E3B47] text-white'
      case 'RESOLVED':
        return 'bg-[#82A094] text-white'
      // Other - Grey palette
      case 'REOPENED':
        return 'bg-[#6F8A9D] text-white'
      case 'ON_HOLD':
        return 'bg-[#757777] text-white'
      case 'ESCALATED':
        return 'bg-[#E17F70] text-white'
      case 'WAITING_CUSTOMER':
        return 'bg-[#CE9F6B] text-white'
      case 'PENDING':
        return 'bg-[#EEC18F] text-white'
      default:
        return 'bg-[#979796] text-white'
    }
  }

  // Kardex Company Colors for priority
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#9E3B47]/20 text-[#75242D] border-[#9E3B47]'
      case 'HIGH':
        return 'bg-[#E17F70]/20 text-[#9E3B47] border-[#E17F70]'
      case 'MEDIUM':
        return 'bg-[#EEC18F]/20 text-[#976E44] border-[#EEC18F]'
      case 'LOW':
        return 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#A2B9AF]'
      default:
        return 'bg-[#979796]/20 text-[#757777] border-[#979796]'
    }
  }

  return (
    <div className="min-h-screen bg-[#AEBFC3]/10">
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Compact Header with Stats - Vibrant Coral & Blue Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#9E3B47] via-[#E17F70] to-[#6F8A9D] rounded-2xl shadow-xl p-4 sm:p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#546A7A]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-white/25 backdrop-blur-sm rounded-xl ring-2 ring-white/40 shadow-lg">
                <Ticket className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold drop-shadow-md">Support Tickets</h1>
                <p className="text-white/90 text-sm sm:text-base mt-1">Manage and track all support tickets</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                <div className="bg-white/20 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/30 text-center shadow-lg">
                  <p className="text-white/90 text-[10px] sm:text-xs font-medium">Total</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-[#CE9F6B]/40 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/30 text-center shadow-lg">
                  <p className="text-white/90 text-[10px] sm:text-xs font-medium">Open</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.open}</p>
                </div>
                <div className="bg-[#6F8A9D]/40 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/30 text-center shadow-lg">
                  <p className="text-white/90 text-[10px] sm:text-xs font-medium">In Progress</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="bg-[#82A094]/40 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/30 text-center shadow-lg hidden sm:block">
                  <p className="text-white/90 text-[10px] sm:text-xs font-medium">Closed</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.closed}</p>
                </div>
                <div className="bg-[#75242D]/50 backdrop-blur-md rounded-lg px-2 sm:px-4 py-2 border border-white/30 text-center shadow-lg hidden sm:block">
                  <p className="text-white/90 text-[10px] sm:text-xs font-medium">Critical</p>
                  <p className="text-lg sm:text-2xl font-bold">{stats.critical}</p>
                </div>
              </div>
              <Button onClick={() => router.push('/admin/tickets/create')} className="bg-white text-[#9E3B47] hover:bg-[#EEC1BF] hover:text-[#75242D] shadow-lg hover:shadow-xl transition-all font-semibold w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* View Tabs - Kardex Colors - Mobile Scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <Button
            variant={selectedView === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedView('All')}
            className={`flex-shrink-0 text-xs sm:text-sm ${selectedView === 'All' ? 'bg-[#546A7A] hover:bg-[#5D6E73]' : 'hover:bg-[#96AEC2]/10'}`}
          >
            <AlertCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            All
          </Button>
          <Button
            variant={selectedView === 'Unassigned' ? 'default' : 'outline'}
            onClick={() => setSelectedView('Unassigned')}
            className={`flex-shrink-0 text-xs sm:text-sm ${selectedView === 'Unassigned' ? 'bg-[#CE9F6B] hover:bg-[#976E44]' : 'hover:bg-[#EEC18F]/10'}`}
          >
            <Clock className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Unassigned
          </Button>
          <Button
            variant={selectedView === 'Assigned to Zone' ? 'default' : 'outline'}
            onClick={() => setSelectedView('Assigned to Zone')}
            className={`flex-shrink-0 text-xs sm:text-sm ${selectedView === 'Assigned to Zone' ? 'bg-[#96AEC2] hover:bg-[#6F8A9D]' : 'hover:bg-[#96AEC2]/10'}`}
          >
            <Users className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Zone Users</span>
            <span className="sm:hidden">Zone</span>
          </Button>
          <Button
            variant={selectedView === 'Assigned to Service Person' ? 'default' : 'outline'}
            onClick={() => setSelectedView('Assigned to Service Person')}
            className={`flex-shrink-0 text-xs sm:text-sm ${selectedView === 'Assigned to Service Person' ? 'bg-[#82A094] hover:bg-[#4F6A64]' : 'hover:bg-[#A2B9AF]/10'}`}
          >
            <Wrench className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Service Person</span>
            <span className="sm:hidden">Service</span>
          </Button>
          <Button
            variant={selectedView === 'Assigned to Zone Manager' ? 'default' : 'outline'}
            onClick={() => setSelectedView('Assigned to Zone Manager')}
            className={`flex-shrink-0 text-xs sm:text-sm ${selectedView === 'Assigned to Zone Manager' ? 'bg-[#6F8A9D] hover:bg-[#546A7A]' : 'hover:bg-[#6F8A9D]/10'}`}
          >
            <Shield className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Zone Manager</span>
            <span className="sm:hidden">Manager</span>
          </Button>
          <Button
            variant={selectedView === 'Assigned to Expert Helpdesk' ? 'default' : 'outline'}
            onClick={() => setSelectedView('Assigned to Expert Helpdesk')}
            className={`flex-shrink-0 text-xs sm:text-sm ${selectedView === 'Assigned to Expert Helpdesk' ? 'bg-[#92A2A5] hover:bg-[#757777]' : 'hover:bg-[#92A2A5]/10'}`}
          >
            <Headphones className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Expert Helpdesk</span>
            <span className="sm:hidden">Expert</span>
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white" style={{backgroundColor: 'white'}}>
          <CardHeader className="bg-white border-b border-[#92A2A5]" style={{backgroundColor: 'white'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#9E3B47]" />
                <CardTitle className="text-lg">Search & Filter</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">Active</Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#9E3B47] hover:text-[#75242D] hover:bg-[#E17F70]/10">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 bg-white" style={{backgroundColor: 'white'}}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#9E3B47]" />
                  Search Tickets
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#979796]" />
                  <Input
                    id="search"
                    placeholder="Search by ticket #, title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11 border-[#92A2A5] focus:border-[#9E3B47] focus:ring-[#E17F70] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Zone Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#976E44]" />
                  Zone
                </Label>
                <Select value={selectedZone} onValueChange={setSelectedZone} disabled={loading}>
                  <SelectTrigger className="h-11 border-[#92A2A5] focus:border-orange-500 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="All Zones">All Zones</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id?.toString?.() ?? String(zone.id)}>{zone.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#546A7A]" />
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={loading}>
                  <SelectTrigger className="h-11 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#6F8A9D] disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Flag className="h-4 w-4 text-[#9E3B47]" />
                  Priority
                </Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority} disabled={loading}>
                  <SelectTrigger className="h-11 border-[#92A2A5] focus:border-pink-500 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {priorities.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table - Premium Design */}
        <Card className="border-0 shadow-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#75242D] via-[#9E3B47] to-[#546A7A] text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      Ticket #
                      {sortField === 'id' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5 text-[#E17F70]" />
                      Title
                      {sortField === 'title' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('customer')}>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#A2B9AF]" />
                      Customer
                      {sortField === 'customer' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('zone')}>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#6F8A9D]" />
                      Zone
                      {sortField === 'zone' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-[#6F8A9D]" />
                      Status
                      {sortField === 'status' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('priority')}>
                    <div className="flex items-center gap-1.5">
                      <Flag className="h-3.5 w-3.5 text-[#CE9F6B]" />
                      Priority
                      {sortField === 'priority' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('assignedTo')}>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-cyan-400" />
                      Assigned
                      {sortField === 'assignedTo' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-[#82A094]" />
                      Response
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#5D6E73]/50 transition-colors" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-pink-400" />
                      Created
                      {sortField === 'createdAt' && (
                        <span className="text-[#E17F70]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center bg-gradient-to-br from-[#AEBFC3]/10 to-red-50/30">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#E17F70] to-[#976E44] flex items-center justify-center shadow-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-[#546A7A]">Loading tickets...</p>
                          <p className="text-sm text-[#AEBFC3]0 mt-1">Please wait while we fetch the data</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center bg-gradient-to-br from-[#AEBFC3]/10 to-red-50/30">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#AEBFC3]/40 to-[#AEBFC3]/60 flex items-center justify-center">
                          <Ticket className="h-8 w-8 text-[#AEBFC3]0" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-[#546A7A]">No tickets found</p>
                          <p className="text-sm text-[#AEBFC3]0 mt-1">Try adjusting your filters or create a new ticket</p>
                        </div>
                        <Button onClick={() => router.push('/admin/tickets/create')} className="mt-4 bg-gradient-to-r from-[#9E3B47] to-[#976E44]">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Ticket
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedTickets.map((ticket: any, index: number) => (
                  <tr 
                    key={ticket.id} 
                    className={`
                      ${index % 2 === 0 ? 'bg-white' : 'bg-[#AEBFC3]/10/50'}
                      hover:bg-gradient-to-r hover:from-[#E17F70]/10 hover:to-[#EEC1BF]/10/50 
                      transition-all duration-200 group
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/tickets/${ticket.id}/list`} className="font-mono font-bold text-[#9E3B47] hover:text-[#75242D] text-sm hover:underline">
                          #{ticket.ticketNumber ?? ticket.id}
                        </Link>
                        {ticket.status === 'OPEN' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#96AEC2]/20 text-[#546A7A] rounded">NEW</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <Link href={`/admin/tickets/${ticket.id}/list`} className="font-semibold text-[#546A7A] hover:text-[#9E3B47] text-sm truncate max-w-[200px] block hover:underline">
                          {ticket.title}
                        </Link>
                        {ticket.description && <p className="text-xs text-[#979796] truncate max-w-[200px]">{ticket.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#82A094] to-[#82A094] flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                          {(ticket.customer?.companyName || 'U')?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#546A7A] text-sm truncate max-w-[120px]">{ticket.customer?.companyName || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#96AEC2]/100 flex-shrink-0"></div>
                        <span className="text-[#5D6E73] text-sm font-medium">{ticket.zone?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <span className={`
                        inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-sm
                        ${getStatusStyle(ticket.status)}
                      `}>
                        {ticket.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-bold rounded-md border
                        ${getPriorityStyle(ticket.priority)}
                      `}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {ticket.assignedTo ? (
                          <>
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[#5D6E73] font-semibold text-[10px] flex-shrink-0">
                              {ticket.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-[#5D6E73] text-sm truncate max-w-[80px]">{ticket.assignedTo?.name?.split(' ')[0]}</span>
                          </>
                        ) : (
                          <span className="text-[#979796] text-sm italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.assignedTo ? (
                        ticket.assignmentStatus === 'PENDING' ? (
                          <Badge className="bg-[#CE9F6B]/20 text-[#976E44] border-amber-300 text-[10px] px-2 py-0.5 animate-pulse">
                            Pending
                          </Badge>
                        ) : ticket.assignmentStatus === 'ACCEPTED' ? (
                          <Badge className="bg-[#A2B9AF]/20 text-[#4F6A64] border-[#82A094] text-[10px] px-2 py-0.5">
                            ✓ Accepted
                          </Badge>
                        ) : ticket.assignmentStatus === 'REJECTED' ? (
                          <Badge className="bg-[#E17F70]/20 text-[#75242D] border-[#E17F70] text-[10px] px-2 py-0.5">
                            ✗ Rejected
                          </Badge>
                        ) : (
                          <span className="text-[#979796] text-xs">-</span>
                        )
                      ) : (
                        <span className="text-[#979796] text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#AEBFC3]0 text-sm">{ticket.createdAt ? format(new Date(ticket.createdAt), 'dd MMM') : '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-[#92A2A5]/30 rounded-lg">
                            <MoreHorizontal className="h-4 w-4 text-[#5D6E73]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-[#92A2A5]">
                          <DropdownMenuItem 
                            onClick={() => router.push(`/admin/tickets/${ticket.id}/list`)}
                            className="cursor-pointer rounded-lg"
                          >
                            <Eye className="h-4 w-4 mr-2 text-[#546A7A]" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => router.push(`/admin/tickets/${ticket.id}/edit`)}
                            className="cursor-pointer rounded-lg"
                          >
                            <Edit className="h-4 w-4 mr-2 text-[#546A7A]" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && tickets.length > 0 && (
            <div className="bg-gradient-to-r from-[#AEBFC3]/10 via-red-50 to-[#EEC1BF]/10/30 px-6 py-4 border-t border-[#92A2A5]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#5D6E73] font-medium">
                  Showing <span className="font-bold text-[#546A7A]">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold">{pagination.total}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="hover:bg-[#E17F70]/10 hover:border-[#E17F70] disabled:opacity-50 rounded-xl transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#5D6E73] font-medium px-3">
                    Page <span className="font-bold text-[#546A7A]">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="hover:bg-[#E17F70]/10 hover:border-[#E17F70] disabled:opacity-50 rounded-xl transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
