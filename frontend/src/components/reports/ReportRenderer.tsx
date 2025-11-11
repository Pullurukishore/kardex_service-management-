import type { ReportData } from './types';

// Import report components directly
import { AdvancedTicketSummaryReport } from './AdvancedTicketSummaryReport';
import { AdvancedMachineAnalyticsReport } from './AdvancedMachineAnalyticsReport';
import { AdvancedZonePerformanceReport } from './AdvancedZonePerformanceReport';
import { TicketSummaryReport } from './TicketSummaryReport';
import { CustomerSatisfactionReport } from './CustomerSatisfactionReport';
import { ZonePerformanceReport } from './ZonePerformanceReport';
import { AgentProductivityReport } from './AgentProductivityReport';
import { IndustrialDataReport } from './IndustrialDataReport';
import { ExecutiveSummaryReport } from './ExecutiveSummaryReport';
import { ServicePersonAttendanceReport } from './ServicePersonAttendanceReport';
import { ServicePersonPerformanceReport } from './ServicePersonPerformanceReport';

interface ReportRendererProps {
  reportType: string;
  reportData: ReportData;
}

export function ReportRenderer({ reportType, reportData }: ReportRendererProps) {
  switch (reportType) {
    case 'ticket-summary':
      return <AdvancedTicketSummaryReport reportData={reportData} />;
    case 'customer-satisfaction':
      return <CustomerSatisfactionReport reportData={reportData} />;
    case 'zone-performance':
      // Use advanced zone performance report for comprehensive zone analytics
      return <AdvancedZonePerformanceReport reportData={reportData} />;
    case 'agent-productivity':
      return <AgentProductivityReport reportData={reportData} />;
    case 'industrial-data':
      // Use advanced machine analytics report for comprehensive machine performance data
      return <AdvancedMachineAnalyticsReport reportData={reportData} />;
    case 'executive-summary':
      return <ExecutiveSummaryReport reportData={reportData} />;
    case 'service-person-attendance':
      return <ServicePersonAttendanceReport reportData={reportData} />;
    case 'service-person-reports':
      return <ServicePersonPerformanceReport reportData={reportData} />;
    default:
      return null;
  }
}
