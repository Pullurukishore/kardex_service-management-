'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashboardStats {
  totalOffers: number;
  openOffers: number;
  wonOffers: number;
  winRate: number | string;
  totalValue: number;
  wonValue: number;
}

interface Offer {
  id: number;
  title: string;
  status: string;
  offerNumber: string;
  createdAt: string | Date;
  estimatedValue?: number;
  currency?: string;
  customer?: {
    companyName?: string | null;
  } | null;
  zone?: {
    name?: string | null;
  } | null;
}

interface AdminDashboardClientProps {
  initialStats: DashboardStats;
  initialRecentOffers: Offer[];
}

export default function AdminDashboardClient({ 
  initialStats, 
  initialRecentOffers 
}: AdminDashboardClientProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-[#96AEC2]/20 text-[#546A7A]',
      IN_PROGRESS: 'bg-[#CE9F6B]/20 text-[#976E44]',
      WON: 'bg-[#A2B9AF]/20 text-[#4F6A64]',
      LOST: 'bg-[#E17F70]/20 text-[#75242D]',
      ON_HOLD: 'bg-[#AEBFC3]/20 text-[#546A7A]',
    };
    return colors[status] || 'bg-[#AEBFC3]/20 text-[#546A7A]';
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Offers"
          value={initialStats?.totalOffers || 0}
          description="All time"
        />
        <StatsCard
          title="Open Offers"
          value={initialStats?.openOffers || 0}
          description="Currently active"
        />
        <StatsCard
          title="Won Offers"
          value={initialStats?.wonOffers || 0}
          description={`Win rate: ${initialStats?.winRate || '0%'}`}
        />
        <StatsCard
          title="Total Value"
          value={formatCurrency(initialStats?.totalValue || 0)}
          description={`Won: ${formatCurrency(initialStats?.wonValue || 0)}`}
        />
      </div>

      {/* Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Offers</CardTitle>
          <CardDescription>Latest offers across all zones</CardDescription>
        </CardHeader>
        <CardContent>
          {initialRecentOffers.length === 0 ? (
            <p className="text-center text-[#AEBFC3]0 py-8">No offers yet</p>
          ) : (
            <div className="space-y-4">
              {initialRecentOffers.map((offer) => (
                <a
                  key={offer.id}
                  href={`/admin/offers/${offer.id}`}
                  className="block border rounded-lg p-4 hover:bg-[#AEBFC3]/10 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-[#546A7A]">
                          {offer.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            offer.status
                          )}`}
                        >
                          {offer.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-[#5D6E73] mt-1">
                        {offer.customer?.companyName || 'Unknown Customer'} • {offer.zone?.name || 'No Zone'}
                      </p>
                      <p className="text-xs text-[#AEBFC3]0 mt-1">
                        {offer.offerNumber} • {formatDate(offer.createdAt)}
                      </p>
                    </div>
                    {offer.estimatedValue != null && (
                      <div className="text-right">
                        <p className="font-semibold text-[#546A7A]">
                          {formatCurrency(offer.estimatedValue)}
                        </p>
                        <p className="text-xs text-[#AEBFC3]0">Estimated Value</p>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
