import { ReportFilters } from './types';

interface ReportHeaderProps {
  filters: ReportFilters;
  reportData: any;
}

export function ReportHeader({ 
  filters, 
  reportData
}: ReportHeaderProps) {

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#546A7A] mb-2">Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Generate and view detailed reports for your Kardex operations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="text-xs sm:text-sm text-muted-foreground bg-[#AEBFC3]/20 px-3 py-2 rounded-lg">
            Report Type: <span className="font-medium">{filters.reportType}</span>
          </div>
          {reportData && (
            <div className="text-xs sm:text-sm text-[#4F6A64] bg-[#A2B9AF]/10 px-3 py-2 rounded-lg">
              ✓ Generated
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
