'use client';

import React from 'react';

export default function DashboardErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="bg-[#E17F70]/10 rounded-lg p-6 max-w-2xl mx-auto my-8">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-3 bg-[#E17F70]/20 rounded-full">
          <div className="w-8 h-8 text-[#9E3B47]">!</div>
        </div>
        <h3 className="text-lg font-medium text-[#75242D]">Failed to load dashboard</h3>
        <p className="text-[#75242D]">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 border border-[#E17F70] text-[#75242D] rounded-md hover:bg-[#E17F70]/10 mt-2 flex items-center gap-2"
        >
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
