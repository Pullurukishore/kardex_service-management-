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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  MoreHorizontal, 
  Plus,
  Loader2,
  Eye,
  Building2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Users,
  Calendar,
  Flag,
  Ticket,
  Headphones,
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api/axios'
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

export default function ExpertTicketsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  // All hooks must be declared before any conditional returns
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0, totalPages: 0 })

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedPriority, setSelectedPriority] = useState('All Priority')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Protect this page - only EXPERT_HELPDESK can access
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?callbackUrl=' + encodeURIComponent('/expert/tickets'))
        return
      }
      if (user?.role !== UserRole.EXPERT_HELPDESK) {
        router.push('/expert/dashboard')
        return
      }
    }
  }, [authLoading, isAuthenticated, user?.role, router])

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== UserRole.EXPERT_HELPDESK) return
    const timeoutId = setTimeout(() => {
      fetchTickets()
    }, searchTerm ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedStatus, selectedPriority, pagination.page, authLoading, isAuthenticated, user?.role])

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-purple-50/30 to-fuchsia-50/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6F8A9D] to-[#9E3B47] opacity-20 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#6F8A9D] to-[#9E3B47] flex items-center justify-center shadow-lg shadow-[#6F8A9D]/25">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-[#5D6E73] font-medium mt-4">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not EXPERT_HELPDESK
  if (!isAuthenticated || user?.role !== UserRole.EXPERT_HELPDESK) {
    return null
  }

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      
      if (searchTerm) params.search = searchTerm
      if (selectedStatus !== 'All Status') params.status = selectedStatus
      if (selectedPriority !== 'All Priority') params.priority = selectedPriority
      // Backend automatically filters by assignedToId for expert helpdesk users

      const response = await api.get('/tickets', { params })
      setTickets(response.data?.data || [])
      setPagination(response.data?.pagination || { page: 1, limit: 100, total: 0, totalPages: 0 })
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error)
      toast.error(error.response?.data?.error || 'Failed to fetch tickets')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedStatus('All Status')
    setSelectedPriority('All Priority')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = searchTerm || selectedStatus !== 'All Status' || selectedPriority !== 'All Priority'

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      // Open/New
      case 'OPEN':
        return 'bg-[#96AEC2]/100 text-white'
      // Assignment
      case 'ASSIGNED':
        return 'bg-[#82A094]/100 text-white'
      // In Progress
      case 'IN_PROGRESS':
        return 'bg-[#546A7A]/100 text-white'
      // Onsite Visit stages
      case 'ONSITE_VISIT_PLANNED':
        return 'bg-[#96AEC2]/100 text-white'
      case 'ONSITE_VISIT':
        return 'bg-[#82A094]/100 text-white'
      case 'ONSITE_VISIT_STARTED':
        return 'bg-sky-500 text-white'
      case 'ONSITE_VISIT_REACHED':
        return 'bg-[#6F8A9D] text-white'
      case 'ONSITE_VISIT_IN_PROGRESS':
        return 'bg-[#CE9F6B]/100 text-white'
      case 'ONSITE_VISIT_RESOLVED':
        return 'bg-lime-500 text-white'
      case 'ONSITE_VISIT_PENDING':
        return 'bg-[#CE9F6B] text-white'
      case 'ONSITE_VISIT_COMPLETED':
        return 'bg-[#4F6A64] text-white'
      // Spare Parts stages
      case 'SPARE_PARTS_NEEDED':
        return 'bg-[#EEC1BF]/100 text-white'
      case 'SPARE_PARTS_BOOKED':
        return 'bg-[#E17F70] text-white'
      case 'SPARE_PARTS_DELIVERED':
        return 'bg-[#4F6A64] text-white'
      // PO stages
      case 'PO_NEEDED':
        return 'bg-[#976E44] text-white'
      case 'PO_REACHED':
        return 'bg-[#6F8A9D]/100 text-white'
      case 'PO_RECEIVED':
        return 'bg-[#4F6A64] text-white'
      // Closure stages
      case 'CLOSED_PENDING':
        return 'bg-[#EEC1BF]/100 text-white'
      case 'CLOSED':
        return 'bg-[#AEBFC3]/100 text-white'
      case 'CANCELLED':
        return 'bg-[#E17F70]/100 text-white'
      case 'RESOLVED':
        return 'bg-[#A2B9AF]/100 text-white'
      // Other
      case 'REOPENED':
        return 'bg-[#546A7A] text-white'
      case 'ON_HOLD':
        return 'bg-[#AEBFC3]/100 text-white'
      case 'ESCALATED':
        return 'bg-[#9E3B47] text-white'
      case 'WAITING_CUSTOMER':
        return 'bg-[#CE9F6B] text-white'
      case 'PENDING':
        return 'bg-[#CE9F6B] text-white'
      default:
        return 'bg-[#92A2A5] text-white'
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-[#E17F70]/20 text-[#75242D] border-[#E17F70]'
      case 'HIGH':
        return 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]'
      case 'MEDIUM':
        return 'bg-[#CE9F6B]/20 text-[#976E44] border-[#CE9F6B]'
      case 'LOW':
        return 'bg-[#A2B9AF]/20 text-[#4F6A64] border-[#82A094]'
      default:
        return 'bg-[#AEBFC3]/20 text-[#5D6E73] border-[#92A2A5]'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-purple-50/30 to-fuchsia-50/20">
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Premium Header with Glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#6F8A9D] via-fuchsia-600 to-[#9E3B47] rounded-2xl shadow-2xl shadow-[#6F8A9D]/20 p-6 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#EEC1BF]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl ring-2 ring-white/30">
                <Headphones className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">My Assigned Tickets</h1>
                <p className="text-[#6F8A9D] mt-1">Tickets assigned to you as Expert Helpdesk</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-5 gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-center">
                  <p className="text-[#6F8A9D] text-xs font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-center">
                  <p className="text-[#6F8A9D] text-xs font-medium">Open</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-center">
                  <p className="text-[#6F8A9D] text-xs font-medium">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-center">
                  <p className="text-[#6F8A9D] text-xs font-medium">Closed</p>
                  <p className="text-2xl font-bold">{stats.closed}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-center">
                  <p className="text-[#6F8A9D] text-xs font-medium">Critical</p>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                </div>
              </div>
              <Button onClick={() => router.push('/expert/tickets/create')} className="bg-white text-[#546A7A] hover:bg-[#6F8A9D]/10 shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* No view tabs needed - users only see their assigned tickets */}

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white" style={{backgroundColor: 'white'}}>
          <CardHeader className="bg-white border-b border-[#92A2A5]" style={{backgroundColor: 'white'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#546A7A]" />
                <CardTitle className="text-lg">Search & Filter</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">Active</Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[#546A7A] hover:text-[#546A7A] hover:bg-[#6F8A9D]/10">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 bg-white" style={{backgroundColor: 'white'}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#546A7A]" />
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
                    className="pl-10 h-11 border-[#92A2A5] focus:border-[#6F8A9D] focus:ring-[#6F8A9D] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#5D6E73] flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#9E3B47]" />
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={loading}>
                  <SelectTrigger className="h-11 border-[#92A2A5] focus:border-fuchsia-500 focus:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed">
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
                <tr className="bg-gradient-to-r from-[#546A7A] via-fuchsia-700 to-purple-800 text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#546A7A]/50 transition-colors" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      Ticket #
                      {sortField === 'id' && (
                        <span className="text-pink-300">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#546A7A]/50 transition-colors" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5 text-pink-300" />
                      Title
                      {sortField === 'title' && (
                        <span className="text-pink-300">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#546A7A]/50 transition-colors" onClick={() => handleSort('customer')}>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-[#6F8A9D]" />
                      Customer
                      {sortField === 'customer' && (
                        <span className="text-pink-300">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#546A7A]/50 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-fuchsia-300" />
                      Status
                      {sortField === 'status' && (
                        <span className="text-pink-300">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#546A7A]/50 transition-colors" onClick={() => handleSort('priority')}>
                    <div className="flex items-center gap-1.5">
                      <Flag className="h-3.5 w-3.5 text-[#EEC1BF]" />
                      Priority
                      {sortField === 'priority' && (
                        <span className="text-pink-300">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#546A7A]/50 transition-colors" onClick={() => handleSort('zone')}>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-cyan-300" />
                      Zone
                      {sortField === 'zone' && (
                        <span className="text-pink-300">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Flag className="h-3.5 w-3.5 text-[#82A094]" />
                      Response
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#546A7A]/50 transition-colors" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-pink-300" />
                      Created
                      {sortField === 'createdAt' && (
                        <span className="text-pink-300">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center bg-gradient-to-br from-[#AEBFC3]/10 to-[#96AEC2]/10/30">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#6F8A9D] to-[#9E3B47] flex items-center justify-center shadow-lg">
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
                    <td colSpan={9} className="px-6 py-16 text-center bg-gradient-to-br from-[#AEBFC3]/10 to-[#96AEC2]/10/30">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#AEBFC3]/40 to-[#AEBFC3]/60 flex items-center justify-center">
                          <Ticket className="h-8 w-8 text-[#AEBFC3]0" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-[#546A7A]">No tickets found</p>
                          <p className="text-sm text-[#AEBFC3]0 mt-1">Try adjusting your filters or create a new ticket</p>
                        </div>
                        <Button onClick={() => router.push('/expert/tickets/create')} className="mt-4 bg-gradient-to-r from-[#6F8A9D] to-[#9E3B47]">
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
                      hover:bg-gradient-to-r hover:from-[#96AEC2]/10 hover:to-fuchsia-50/50 
                      transition-all duration-200 group
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/expert/tickets/${ticket.id}/list`} className="font-mono font-bold text-[#546A7A] hover:text-[#546A7A] text-sm hover:underline">
                          #{ticket.ticketNumber ?? ticket.id}
                        </Link>
                        {ticket.status === 'OPEN' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#96AEC2]/20 text-[#546A7A] rounded">NEW</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <Link href={`/expert/tickets/${ticket.id}/list`} className="font-semibold text-[#546A7A] hover:text-[#546A7A] text-sm truncate max-w-[200px] block hover:underline">
                          {ticket.title}
                        </Link>
                        {ticket.description && <p className="text-xs text-[#979796] truncate max-w-[200px]">{ticket.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6F8A9D] to-[#9E3B47] flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                          {(ticket.customer?.companyName || 'U')?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#546A7A] text-sm truncate max-w-[120px]">{ticket.customer?.companyName || 'N/A'}</p>
                        </div>
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
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#6F8A9D]/100 flex-shrink-0"></div>
                        <span className="text-[#5D6E73] text-sm font-medium">{ticket.zone?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.assignmentStatus === 'PENDING' ? (
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
                            onClick={() => router.push(`/expert/tickets/${ticket.id}/list`)}
                            className="cursor-pointer rounded-lg"
                          >
                            <Eye className="h-4 w-4 mr-2 text-[#546A7A]" />
                            View Details
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
            <div className="bg-gradient-to-r from-[#AEBFC3]/10 via-purple-50 to-fuchsia-50/30 px-6 py-4 border-t border-[#92A2A5]">
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
                    className="hover:bg-[#6F8A9D]/10 hover:border-[#6F8A9D] disabled:opacity-50 rounded-xl transition-all"
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
                    className="hover:bg-[#6F8A9D]/10 hover:border-[#6F8A9D] disabled:opacity-50 rounded-xl transition-all"
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
