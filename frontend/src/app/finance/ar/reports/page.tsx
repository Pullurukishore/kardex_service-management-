'use client';

import { BarChart3, FileText, Download, Calendar, Sparkles, ArrowRight } from 'lucide-react';

export default function ARReportsPage() {
  const reports = [
    {
      id: 'aging',
      title: 'Aging Report',
      description: 'View outstanding invoices grouped by age buckets with detailed breakdown',
      icon: BarChart3,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      glowColor: 'rgba(139, 92, 246, 0.4)',
      borderHover: 'purple'
    },
    {
      id: 'customer-statement',
      title: 'Customer Statement',
      description: 'Generate detailed statements for individual customers with full history',
      icon: FileText,
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      glowColor: 'rgba(34, 211, 238, 0.4)',
      borderHover: 'cyan'
    },
    {
      id: 'collection',
      title: 'Collection Report',
      description: 'Track collections over a selected time period with trend analysis',
      icon: Download,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      borderHover: 'emerald'
    },
    {
      id: 'overdue',
      title: 'Overdue Report',
      description: 'List all overdue invoices with customer details and risk assessment',
      icon: Calendar,
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      borderHover: 'red'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">
          Reports
          <Sparkles className="w-5 h-5 text-purple-400" />
        </h1>
        <p className="text-purple-200/60 text-sm mt-1 font-medium">Generate and download AR reports</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              className={`text-left bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-7 hover:border-${report.borderHover}-500/40 transition-all duration-500 group relative overflow-hidden`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${report.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500`} />
              
              {/* Top gradient line */}
              <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-${report.borderHover}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Icon Container */}
              <div 
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${report.gradient} flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                style={{ boxShadow: `0 10px 30px ${report.glowColor}` }}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors relative z-10">
                {report.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed mb-5 relative z-10">
                {report.description}
              </p>
              
              {/* Generate Button */}
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 relative z-10">
                <span>Generate Report</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 text-center relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ animationDuration: '3s' }} />
        
        <div className="flex items-center justify-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white/70 font-medium">
              Premium Report Generation
            </p>
            <p className="text-white/40 text-sm">
              PDF/Excel export with charts coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
