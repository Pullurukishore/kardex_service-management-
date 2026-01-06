'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCog, 
  Wrench, 
  MapPin, 
  Mail, 
  Phone, 
  Clock,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api/axios';
import { formatDistanceToNow } from 'date-fns';

interface Zone {
  id: number;
  name: string;
}

interface ZoneUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'ZONE_USER' | 'ZONE_MANAGER';
  roleLabel: string;
  isActive: boolean;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  zones: Zone[];
  activeOffers: number;
}

interface ServiceTechnician {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'SERVICE_PERSON';
  roleLabel: string;
  isActive: boolean;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  zones: Zone[];
  activeTickets: number;
  ticketsByPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface TeamMembersSummary {
  totalZoneUsers: number;
  totalZoneManagers: number;
  totalZoneUserOnly: number;
  totalServiceTechnicians: number;
  techniciansWithActiveTickets: number;
}

interface TeamMembersData {
  zoneUsers: ZoneUser[];
  serviceTechnicians: ServiceTechnician[];
  summary: TeamMembersSummary;
}

export default function TeamMembersSection() {
  const [data, setData] = useState<TeamMembersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showZoneUsers, setShowZoneUsers] = useState(true);
  const [showTechnicians, setShowTechnicians] = useState(true);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/team-members');
      setData(response.data);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const formatLastActive = (date: string | null) => {
    if (!date) return 'Never';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl animate-pulse">
          <CardHeader className="pb-4">
            <div className="h-8 bg-slate-200 rounded w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchTeamMembers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Zone Users</p>
                <p className="text-2xl font-bold">{data.summary.totalZoneUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Zone Managers</p>
                <p className="text-2xl font-bold">{data.summary.totalZoneManagers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Technicians</p>
                <p className="text-2xl font-bold">{data.summary.totalServiceTechnicians}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-rose-600 text-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Active Tech</p>
                <p className="text-2xl font-bold">{data.summary.techniciansWithActiveTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Users Section */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl overflow-hidden">
        <CardHeader 
          className="pb-4 cursor-pointer hover:bg-white/40 transition-colors"
          onClick={() => setShowZoneUsers(!showZoneUsers)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Zone Users & Zone Managers
                </CardTitle>
                <p className="text-sm text-slate-500">
                  {data.summary.totalZoneUsers} users ({data.summary.totalZoneManagers} managers, {data.summary.totalZoneUserOnly} users)
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {showZoneUsers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>
        
        {showZoneUsers && (
          <CardContent className="pt-0">
            {data.zoneUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No zone users found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.zoneUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="bg-white/80 rounded-xl p-4 border border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                          user.role === 'ZONE_MANAGER' 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                            : 'bg-gradient-to-br from-purple-500 to-pink-600'
                        }`}>
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{user.name}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              user.role === 'ZONE_MANAGER' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {user.roleLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>
                          {user.zones.length > 0 
                            ? user.zones.map(z => z.name).join(', ')
                            : 'No zone assigned'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Active {formatLastActive(user.lastActiveAt || user.lastLoginAt)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Active Offers</span>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {user.activeOffers}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Service Technicians Section */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl overflow-hidden">
        <CardHeader 
          className="pb-4 cursor-pointer hover:bg-white/40 transition-colors"
          onClick={() => setShowTechnicians(!showTechnicians)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">
                  Service Technicians
                </CardTitle>
                <p className="text-sm text-slate-500">
                  {data.summary.totalServiceTechnicians} technicians ({data.summary.techniciansWithActiveTickets} with active tickets)
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {showTechnicians ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>
        
        {showTechnicians && (
          <CardContent className="pt-0">
            {data.serviceTechnicians.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No service technicians found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.serviceTechnicians.map((tech) => (
                  <div 
                    key={tech.id}
                    className="bg-white/80 rounded-xl p-4 border border-slate-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                          {tech.name?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{tech.name}</h4>
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-emerald-100 text-emerald-700"
                          >
                            {tech.roleLabel}
                          </Badge>
                        </div>
                      </div>
                      {tech.activeTickets > 0 && (
                        <Badge className="bg-orange-500 text-white">
                          {tech.activeTickets} Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{tech.email}</span>
                      </div>
                      {tech.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{tech.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>
                          {tech.zones.length > 0 
                            ? tech.zones.map(z => z.name).join(', ')
                            : 'No zone assigned'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>Active {formatLastActive(tech.lastActiveAt || tech.lastLoginAt)}</span>
                      </div>
                    </div>
                    
                    {tech.activeTickets > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs text-slate-500 mb-2">Tickets by Priority</div>
                        <div className="flex gap-2 flex-wrap">
                          {tech.ticketsByPriority.critical > 0 && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              {tech.ticketsByPriority.critical} Critical
                            </Badge>
                          )}
                          {tech.ticketsByPriority.high > 0 && (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">
                              {tech.ticketsByPriority.high} High
                            </Badge>
                          )}
                          {tech.ticketsByPriority.medium > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                              {tech.ticketsByPriority.medium} Medium
                            </Badge>
                          )}
                          {tech.ticketsByPriority.low > 0 && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              {tech.ticketsByPriority.low} Low
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
