import { subDays, parse, format } from 'date-fns';
import { getZones, getCustomers, getAssets, generateReport, getUserZone } from '@/lib/server/reports';
import ReportsClient from '@/components/reports/ReportsClient';
import type { ReportFilters as ReportFiltersType } from '@/components/reports/types';

interface ReportsPageProps {
  searchParams: {
    from?: string;
    to?: string;
    zoneId?: string;
    customerId?: string;
    assetId?: string;
    reportType?: string;
  };
}

export default async function ZoneReportsPage({ searchParams }: ReportsPageProps) {
  // Get zone user's assigned zone
  const userZone = await getUserZone();
  
  // If no zone found, show error
  if (!userZone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">No Zone Assigned</h2>
            <p className="text-red-700">You are not assigned to any service zone. Please contact your administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  // Parse search params to create filters - always use user's zone
  const filters: ReportFiltersType = {
    dateRange: {
      from: searchParams.from 
        ? parse(searchParams.from, 'yyyy-MM-dd', new Date())
        : subDays(new Date(), 30),
      to: searchParams.to 
        ? parse(searchParams.to, 'yyyy-MM-dd', new Date())
        : new Date(),
    },
    reportType: searchParams.reportType || 'ticket-summary',
    zoneId: String(userZone.id), // Force zone to user's zone
    customerId: searchParams.customerId,
    assetId: searchParams.assetId,
  };

  // Fetch data filtered for user's zone only
  const [customers, assets] = await Promise.all([
    filters.reportType === 'industrial-data' ? getCustomers(String(userZone.id)) : Promise.resolve([]),
    filters.customerId ? getAssets(filters.customerId) : Promise.resolve([])
  ]);
  
  // Only pass user's zone (not all zones)
  const zones = [{ id: String(userZone.id), name: userZone.name }];
  
  // Don't auto-generate - let client handle it with proper logic for all report types
  const reportData = null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Client Component for API calls - isZoneUser flag enables zone-specific endpoints */}
      <ReportsClient 
        initialFilters={filters}
        initialReportData={reportData}
        zones={zones}
        customers={customers}
        assets={assets}
        isZoneUser={true}
      />
    </div>
  );
}