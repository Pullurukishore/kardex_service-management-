'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  Activity,
  Clock,
  User,
  FileText,
  Pencil as EditIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  LogIn,
  LogOut,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  Globe,
  Monitor,
  Filter,
  Search,
  UserPlus,
  Package,
  MessageSquare,
  Plus,
  Trash2,
  Briefcase
} from 'lucide-react'
import { apiService } from '@/services/api'
import { toast } from 'sonner'
import { format, formatDistanceToNow, subDays } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Activity {
  id: number
  action: string
  actionLabel: string
  actionColor: string
  entityType: string | null
  entityId: number | null
  description: string
  details: any
  ipAddress: string | null
  userAgent: string | null
  deviceInfo: string | null
  module: string | null
  performedBy: {
    id: number
    name: string | null
    email: string
    role: string | null
  } | null
  offer: {
    id: number
    offerReferenceNumber: string
    title: string | null
    stage: string
  } | null
  createdAt: string
}

interface Stats {
  totalActivities: number
  loginsToday: number
  offerUpdatesToday: number
  stageChangesToday: number
  activeUsersToday: number
}

interface FilterUser {
  id: number
  name: string | null
  email: string
  role: string | null
}

// Activity action configuration with icons and colors
const ACTION_CONFIG: Record<string, { 
  icon: any
  color: string
  bgColor: string
}> = {
  'USER_LOGIN': { icon: LogIn, color: 'text-[#4F6A64]', bgColor: 'bg-[#A2B9AF]/20' },
  'USER_LOGOUT': { icon: LogOut, color: 'text-[#5D6E73]', bgColor: 'bg-[#AEBFC3]/20' },
  'LOGIN_FAILED': { icon: XCircle, color: 'text-[#9E3B47]', bgColor: 'bg-[#E17F70]/20' },
  'OFFER_CREATED': { icon: Plus, color: 'text-[#4F6A64]', bgColor: 'bg-[#A2B9AF]/20' },
  'OFFER_UPDATED': { icon: EditIcon, color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  'OFFER_STATUS_UPDATED': { icon: TrendingUp, color: 'text-[#976E44]', bgColor: 'bg-[#CE9F6B]/20' },
  'OFFER_DELETED': { icon: Trash2, color: 'text-[#9E3B47]', bgColor: 'bg-[#E17F70]/20' },
  'OFFER_ASSIGNED': { icon: UserPlus, color: 'text-[#546A7A]', bgColor: 'bg-[#6F8A9D]/20' },
  'SPARE_PART_ADDED': { icon: Package, color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  'SPARE_PART_UPDATED': { icon: Package, color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  'SPARE_PART_REMOVED': { icon: Package, color: 'text-[#9E3B47]', bgColor: 'bg-[#E17F70]/20' },
  'REMARK_ADDED': { icon: MessageSquare, color: 'text-[#976E44]', bgColor: 'bg-[#CE9F6B]/20' },
  'OFFER_NOTE_ADDED': { icon: FileText, color: 'text-[#976E44]', bgColor: 'bg-[#CE9F6B]/20' },
  // Spare Part Management (Global)
  'SPARE_PART_CREATED': { icon: Plus, color: 'text-[#4F6A64]', bgColor: 'bg-[#A2B9AF]/20' },
  'SPARE_PART_DELETED': { icon: Trash2, color: 'text-[#9E3B47]', bgColor: 'bg-[#E17F70]/20' },
  'BULK_PRICE_UPDATED': { icon: RefreshCw, color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  // Target actions
  'ZONE_TARGET_SET': { icon: TrendingUp, color: 'text-[#4F6A64]', bgColor: 'bg-[#A2B9AF]/20' },
  'USER_TARGET_SET': { icon: TrendingUp, color: 'text-[#4F6A64]', bgColor: 'bg-[#A2B9AF]/20' },
  'ZONE_TARGET_UPDATED': { icon: EditIcon, color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  'USER_TARGET_UPDATED': { icon: EditIcon, color: 'text-[#546A7A]', bgColor: 'bg-[#96AEC2]/20' },
  'ZONE_TARGET_DELETED': { icon: Trash2, color: 'text-[#9E3B47]', bgColor: 'bg-[#E17F70]/20' },
  'USER_TARGET_DELETED': { icon: Trash2, color: 'text-[#9E3B47]', bgColor: 'bg-[#E17F70]/20' },
}

// Stage colors
const STAGE_COLORS: Record<string, string> = {
  'INITIAL': 'bg-[#6F8A9D]',
  'PROPOSAL_SENT': 'bg-[#546A7A]',
  'NEGOTIATION': 'bg-[#976E44]',
  'FINAL_APPROVAL': 'bg-[#546A7A]',
  'PO_RECEIVED': 'bg-[#4F6A64]',
  'WON': 'bg-[#4F6A64]',
  'LOST': 'bg-[#9E3B47]',
}

const DATE_FILTERS = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
]

const ACTION_FILTERS = [
  { value: 'all', label: 'All Actions' },
  { value: 'USER_LOGIN,USER_LOGOUT', label: 'Login/Logout' },
  { value: 'OFFER_CREATED', label: 'Offer Created' },
  { value: 'OFFER_UPDATED', label: 'Offer Updated' },
  { value: 'OFFER_STATUS_UPDATED', label: 'Stage Changes' },
  { value: 'SPARE_PART_ADDED,SPARE_PART_UPDATED,SPARE_PART_REMOVED,SPARE_PART_CREATED,SPARE_PART_DELETED,BULK_PRICE_UPDATED', label: 'Spare Parts' },
  { value: 'ZONE_TARGET_SET,USER_TARGET_SET,ZONE_TARGET_UPDATED,USER_TARGET_UPDATED,ZONE_TARGET_DELETED,USER_TARGET_DELETED', label: 'Targets' },
  { value: 'REMARK_ADDED,OFFER_NOTE_ADDED', label: 'Notes/Remarks' },
]

export default function OfferActivityLogPage() {
  const router = useRouter()
  
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<FilterUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set())
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  
  // Filters
  const [dateFilter, setDateFilter] = useState('7days')
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })

  const fetchActivities = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      else setRefreshing(true)

      // Build params
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }

      // Date filter
      if (dateFilter === 'today') {
        params.startDate = format(new Date(), 'yyyy-MM-dd')
      } else if (dateFilter === '7days') {
        params.startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
      } else if (dateFilter === '30days') {
        params.startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
      }

      // Action filter
      if (actionFilter !== 'all') {
        params.action = actionFilter
      }

      // User filter
      if (userFilter !== 'all') {
        params.userId = userFilter
      }

      // Search
      if (searchQuery) {
        params.search = searchQuery
      }

      const response = await apiService.getOfferActivityLogs(params)
      
      if (response.success) {
        const newActivities = response.activities || []
        setActivities(prev => pagination.page === 1 ? newActivities : [...prev, ...newActivities])
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 0
        }))
        setHasMore(pagination.page < (response.pagination?.pages || 0))
      }
    } catch (error: any) {
      console.error('Failed to fetch activities:', error)
      toast.error('Failed to load activity log')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [pagination.page, pagination.limit, dateFilter, actionFilter, userFilter, searchQuery])

  const fetchStats = async () => {
    try {
      const response = await apiService.getOfferActivityStats()
      if (response.success) {
        setStats(response.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiService.getActivityLogUsers()
      if (response.success) {
        setUsers(response.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [dateFilter, actionFilter, userFilter, searchQuery])

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !refreshing) {
          setPagination(prev => ({ ...prev, page: prev.page + 1 }))
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, refreshing])

  const handleRefresh = () => {
    fetchActivities(false)
    fetchStats()
  }

  const toggleActivity = (activityId: number) => {
    const newExpanded = new Set(expandedActivities)
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId)
    } else {
      newExpanded.add(activityId)
    }
    setExpandedActivities(newExpanded)
  }

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || { 
      icon: Activity, 
      color: 'text-[#5D6E73]', 
      bgColor: 'bg-[#AEBFC3]/20' 
    }
  }

  const renderStageChange = (activity: Activity) => {
    const details = activity.details
    if (!details?.fromStage && !details?.toStage && !details?.changes?.stage) return null

    const fromStage = details.fromStage || details.changes?.stage?.from
    const toStage = details.toStage || details.changes?.stage?.to

    if (!fromStage || !toStage) return null

    return (
      <div className="flex items-center gap-2 text-sm mt-2">
        <span className="text-[#5D6E73] font-medium">Stage:</span>
        <Badge variant="outline" className="text-xs">
          {fromStage.replace(/_/g, ' ')}
        </Badge>
        <ArrowLeft className="h-3 w-3 text-[#979796] rotate-180" />
        <Badge className={`text-xs text-white ${STAGE_COLORS[toStage] || 'bg-[#546A7A]'}`}>
          {toStage.replace(/_/g, ' ')}
        </Badge>
      </div>
    )
  }

  const renderActivityDetails = (activity: Activity) => {
    const config = getActionConfig(activity.action)
    const ActionIcon = config.icon
    const isExpanded = expandedActivities.has(activity.id)
    const hasDetails = activity.details && Object.keys(activity.details).length > 0

    return (
      <div key={activity.id} className="group">
        <div 
          className={`flex items-start gap-4 p-4 rounded-xl border bg-white hover:shadow-md hover:border-[#979796]/50 transition-all ${
            hasDetails ? 'cursor-pointer' : ''
          }`}
          onClick={() => hasDetails && toggleActivity(activity.id)}
        >
          {/* Icon */}
          <div className={`${config.bgColor} ${config.color} p-3 rounded-xl shrink-0`}>
            <ActionIcon className="h-5 w-5" />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#546A7A]">{activity.actionLabel}</h3>
                  {activity.offer && (
                    <Badge variant="outline" className="text-xs font-mono">
                      {activity.offer.offerReferenceNumber}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-[#5D6E73] mb-2">{activity.description}</p>

                {/* Stage change display */}
                {(activity.action === 'OFFER_STATUS_UPDATED' || activity.action === 'OFFER_UPDATED') && 
                  renderStageChange(activity)
                }

                {/* User info */}
                {activity.performedBy && (
                  <div className="flex items-center gap-2 mt-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] flex items-center justify-center text-white font-semibold text-xs">
                      {(activity.performedBy.name || activity.performedBy.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[#5D6E73]">
                      {activity.performedBy.name || activity.performedBy.email}
                    </span>
                    {activity.performedBy.role && (
                      <Badge variant="secondary" className="text-xs">
                        {activity.performedBy.role.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Device info for login/logout */}
                {(activity.action === 'USER_LOGIN' || activity.action === 'USER_LOGOUT') && activity.deviceInfo && (
                  <div className="flex items-center gap-4 text-xs text-[#92A2A5]">
                    <span className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      {activity.deviceInfo}
                    </span>
                    {activity.ipAddress && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {activity.ipAddress}
                      </span>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-[#92A2A5] mt-2">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(activity.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                  <span className="text-[#AEBFC3]">•</span>
                  <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              {hasDetails && (
                <Button variant="ghost" size="sm" className="shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Expanded Details */}
            {isExpanded && hasDetails && (
              <div className="mt-4 pt-4 border-t">
                {/* Field Changes */}
                {(activity.action === 'OFFER_UPDATED' || activity.action === 'SPARE_PART_UPDATED') && activity.details.changes && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#5D6E73] flex items-center gap-2">
                      <EditIcon className="h-4 w-4" />
                      Changes Made ({Object.keys(activity.details.changes).length})
                    </p>
                    <div className="space-y-2">
                      {Object.entries(activity.details.changes).map(([field, change]: [string, any]) => (
                        <div key={field} className="bg-[#AEBFC3]/10 p-3 rounded-lg">
                          <p className="text-sm font-medium text-[#546A7A] mb-1">
                            {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-[#9E3B47] line-through">
                              {String(change.from || 'N/A')}
                            </span>
                            <ArrowLeft className="h-3 w-3 text-[#979796] rotate-180" />
                            <span className="text-[#4F6A64] font-medium">
                              {String(change.to || 'N/A')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spare Part Created/Deleted */}
                {(activity.action === 'SPARE_PART_CREATED' || activity.action === 'SPARE_PART_DELETED') && (
                  <div className="bg-[#AEBFC3]/10 p-4 rounded-lg border border-[#AEBFC3]/50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#5D6E73] font-medium mb-1 flex items-center gap-1">
                          <Package className="h-4 w-4" /> Part Number
                        </p>
                        <p className="font-semibold text-[#546A7A]">{activity.details?.partNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#5D6E73] font-medium mb-1">Description</p>
                        <p className="font-semibold text-[#546A7A]">{activity.details?.description || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#5D6E73] font-medium mb-1">Base Price</p>
                        <p className="font-semibold text-[#4F6A64]">₹{activity.details?.basePrice?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-[#5D6E73] font-medium mb-1">Stock Status</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.details?.isStocked ? 'In Stock' : 'Non-Stock'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bulk Price Updated */}
                {activity.action === 'BULK_PRICE_UPDATED' && (
                  <div className="bg-[#AEBFC3]/10 p-4 rounded-lg border border-[#AEBFC3]/50">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#AEBFC3]/50">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-[#546A7A]" />
                        <span className="font-semibold text-[#546A7A]">Bulk Price Update Detail</span>
                      </div>
                      <Badge className="bg-[#546A7A]">{activity.details?.type || 'PERCENTAGE'} Update</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[#5D6E73] mb-1">Items Affected</p>
                        <p className="text-lg font-bold text-[#546A7A]">{activity.details?.count || 0}</p>
                      </div>
                      <div>
                        <p className="text-[#5D6E73] mb-1">Change Value</p>
                        <p className={`text-lg font-bold ${activity.details?.value >= 0 ? 'text-[#4F6A64]' : 'text-[#9E3B47]'}`}>
                          {activity.details?.value > 0 ? '+' : ''}{activity.details?.value}{activity.details?.type === 'PERCENTAGE' ? '%' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#5D6E73] mb-1">Module</p>
                        <p className="font-semibold text-[#546A7A]">{activity.details?.module || 'SPARE_PARTS'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Set/Updated */}
                {(activity.action.includes('TARGET_SET') || activity.action.includes('TARGET_UPDATED')) && (
                  <div className="bg-[#AEBFC3]/10 p-4 rounded-lg border border-[#AEBFC3]/50">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#AEBFC3]/50">
                      <TrendingUp className="h-4 w-4 text-[#4F6A64]" />
                      <span className="font-semibold text-[#546A7A]">Target Configuration</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      {activity.details?.zoneName && (
                        <div>
                          <p className="text-[#5D6E73] mb-1 font-medium">Zone</p>
                          <p className="font-semibold text-[#546A7A]">{activity.details.zoneName}</p>
                        </div>
                      )}
                      {activity.details?.targetUserName && (
                        <div>
                          <p className="text-[#5D6E73] mb-1 font-medium">For User</p>
                          <p className="font-semibold text-[#546A7A]">{activity.details.targetUserName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[#5D6E73] mb-1 font-medium">Target Period</p>
                        <Badge variant="secondary" className="bg-[#546A7A]/10 text-[#546A7A]">
                          {activity.details?.period || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[#5D6E73] mb-1 font-medium">Target Value</p>
                        <p className="text-lg font-bold text-[#4F6A64]">₹{activity.details?.value?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Deleted */}
                {(activity.action === 'ZONE_TARGET_DELETED' || activity.action === 'USER_TARGET_DELETED') && (
                  <div className="bg-[#9E3B47]/5 p-4 rounded-lg border border-[#9E3B47]/30">
                    <p className="text-sm text-[#9E3B47] flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      A {activity.action.includes('ZONE') ? 'Zone' : 'User'} target was removed for the specified period.
                    </p>
                  </div>
                )}

                {/* Generic Details Display (if not specifically handled above) */}
                {!['OFFER_UPDATED', 'SPARE_PART_UPDATED', 'SPARE_PART_CREATED', 'SPARE_PART_DELETED', 'BULK_PRICE_UPDATED', 'ZONE_TARGET_SET', 'ZONE_TARGET_UPDATED', 'USER_TARGET_SET', 'USER_TARGET_UPDATED', 'ZONE_TARGET_DELETED', 'USER_TARGET_DELETED'].includes(activity.action) && (
                  <div className="p-3 bg-[#AEBFC3]/10 rounded-lg">
                    <pre className="text-xs text-[#5D6E73] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(activity.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50/30 to-[#96AEC2]/10 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#546A7A] mb-4" />
          <p className="text-[#5D6E73]">Loading activity log...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#AEBFC3]/10 via-blue-50/30 to-[#96AEC2]/10">
      <div className="container mx-auto py-8 px-4">
        {/* Premium Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/dashboard')}
            className="mb-4 hover:bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="bg-gradient-to-r from-[#976E44] via-[#CE9F6B] to-[#976E44] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    Offer Activity Log
                  </h1>
                  <p className="text-amber-100 mt-1">
                    Complete audit trail of all offer activities and user sessions
                  </p>
                </div>
              </div>

              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-[#976E44] to-[#CE9F6B] text-white overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm text-amber-100 mb-1">Total Activities</p>
                    <p className="text-3xl font-bold">{stats.totalActivities.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-[#4F6A64] to-[#4F6A64] text-white overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm text-[#A2B9AF] mb-1">Logins Today</p>
                    <p className="text-3xl font-bold">{stats.loginsToday}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <LogIn className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-[#546A7A] to-[#6F8A9D] text-white overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm text-[#96AEC2] mb-1">Offer Updates</p>
                    <p className="text-3xl font-bold">{stats.offerUpdatesToday}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-[#6F8A9D] to-[#546A7A] text-white overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm text-[#96AEC2] mb-1">Stage Changes</p>
                    <p className="text-3xl font-bold">{stats.stageChangesToday}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-[#82A094] to-[#4F6A64] text-white overflow-hidden">
              <CardContent className="pt-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm text-[#A2B9AF] mb-1">Active Users</p>
                    <p className="text-3xl font-bold">{stats.activeUsersToday}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <User className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#92A2A5]" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="h-4 w-4 mr-2 text-[#92A2A5]" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FILTERS.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Filter */}
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-[#92A2A5]" />
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_FILTERS.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* User Filter */}
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[180px]">
                  <User className="h-4 w-4 mr-2 text-[#92A2A5]" />
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#CE9F6B]/10 to-[#CE9F6B]/5">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#976E44]" />
              Activity Timeline
            </CardTitle>
            <CardDescription>
              Showing {activities.length} of {pagination.total} activities
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {activities.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#CE9F6B]/20 rounded-full mb-4">
                  <Activity className="h-8 w-8 text-[#976E44]" />
                </div>
                <h3 className="text-lg font-medium text-[#546A7A] mb-2">No activities found</h3>
                <p className="text-[#5D6E73] max-w-md mx-auto">
                  Try adjusting your filters or check back later for new activity.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="relative">
                    {/* Timeline connector */}
                    {index !== activities.length - 1 && (
                      <div className="absolute left-[26px] top-[60px] w-0.5 h-full bg-[#CE9F6B]/30 -z-10" />
                    )}
                    {renderActivityDetails(activity)}
                  </div>
                ))}

                {/* Loading Sentinel */}
                <div ref={observerTarget} className="py-8 flex justify-center">
                  {loading && pagination.page > 1 && (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[#546A7A] mb-2" />
                      <p className="text-xs text-[#5D6E73]">Loading more activities...</p>
                    </div>
                  )}
                  {!hasMore && activities.length > 0 && (
                    <p className="text-sm text-[#AEBFC3]">You've reached the end of the activity log</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
