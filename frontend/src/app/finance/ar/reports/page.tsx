'use client';

import { BarChart3, FileText, Download, Calendar, Sparkles, ArrowRight, TrendingUp, PieChart } from 'lucide-react';

export default function ARReportsPage() {
  const reports = [
    {
      id: 'aging',
      title: 'Aging Report',
      description: 'View outstanding invoices grouped by age buckets with detailed breakdown',
      icon: BarChart3,
      gradient: 'from-[#6F8A9D] to-[#546A7A]',
      headerGradient: 'from-[#6F8A9D]/15 to-transparent',
      accentColor: '#6F8A9D'
    },
    {
      id: 'customer-statement',
      title: 'Customer Statement',
      description: 'Generate detailed statements for individual customers with full history',
      icon: FileText,
      gradient: 'from-[#82A094] to-[#4F6A64]',
      headerGradient: 'from-[#82A094]/15 to-transparent',
      accentColor: '#82A094'
    },
    {
      id: 'collection',
      title: 'Collection Report',
      description: 'Track collections over a selected time period with trend analysis',
      icon: TrendingUp,
      gradient: 'from-[#CE9F6B] to-[#976E44]',
      headerGradient: 'from-[#CE9F6B]/15 to-transparent',
      accentColor: '#CE9F6B'
    },
    {
      id: 'overdue',
      title: 'Overdue Report',
      description: 'List all overdue invoices with customer details and risk assessment',
      icon: Calendar,
      gradient: 'from-[#E17F70] to-[#9E3B47]',
      headerGradient: 'from-[#E17F70]/15 to-transparent',
      accentColor: '#E17F70'
    }
  ];

  return (
    <div className="space-y-6 relative">
      {/* Decorative Background */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-[#6F8A9D]/10 to-[#CE9F6B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-tr from-[#82A094]/10 to-[#E17F70]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Header - Multi-color Analytics Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#546A7A] via-[#82A094] to-[#CE9F6B] p-6 shadow-xl">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-12 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute -bottom-8 right-32 w-48 h-48 border-4 border-white rounded-full" />
          <div className="absolute top-8 left-1/4 w-20 h-20 border-2 border-white rounded-full" />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
            <PieChart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              AR Reports
              <Sparkles className="w-6 h-6 text-white/80" />
            </h1>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Generate and download comprehensive AR reports
            </p>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              className={`text-left bg-white/90 backdrop-blur-xl rounded-2xl border-2 border-[#AEBFC3]/20 p-7 hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Top accent line */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${report.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} 
              />
              
              {/* Hover background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${report.headerGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Icon Container */}
              <div 
                className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${report.gradient} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl`}
                style={{ boxShadow: `0 10px 30px ${report.accentColor}40` }}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="relative text-xl font-bold text-[#546A7A] mb-2 group-hover:text-[#6F8A9D] transition-colors">
                {report.title}
              </h3>
              <p className="relative text-[#92A2A5] text-sm leading-relaxed mb-5">
                {report.description}
              </p>
              
              {/* Generate Button */}
              <div 
                className="relative flex items-center gap-2 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 px-4 py-2 rounded-full w-fit"
                style={{ color: report.accentColor, backgroundColor: `${report.accentColor}15` }}
              >
                <span>Generate Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#CE9F6B]/15 via-[#6F8A9D]/10 to-[#82A094]/15 rounded-2xl border-2 border-[#CE9F6B]/30 p-6">
        {/* Background decoration */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-[#CE9F6B]/20 to-transparent rounded-full blur-2xl" />
        
        <div className="relative flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CE9F6B] to-[#976E44] flex items-center justify-center shadow-lg shadow-[#CE9F6B]/30">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-[#546A7A] font-bold">
              Premium Report Generation
            </p>
            <p className="text-[#92A2A5] text-sm">
              PDF/Excel export with interactive charts coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
