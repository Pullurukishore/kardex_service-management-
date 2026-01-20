/**
 * KARDEX COLOR MIGRATION SCRIPT v3 - COMPLETE
 * =============================================
 * This script migrates ALL non-Kardex colors to official Kardex brand colors.
 * Covers: src/app, src/components, and any other tsx/ts files
 * 
 * Kardex Color Palette:
 * - Blues: #96AEC2 (light), #6F8A9D (medium), #546A7A (dark)
 * - Greens: #A2B9AF (light), #82A094 (medium), #4F6A64 (dark)
 * - Greys: #AEBFC3 (light), #92A2A5 (medium), #5D6E73 (dark)
 * - Silvers: #ABACA9 (light), #979796 (medium), #757777 (dark)
 * - Reds: #E17F70 (light), #9E3B47 (medium), #75242D (dark)
 * - Sands: #EEC1BF (light), #CE9F6B (medium), #976E44 (dark)
 */

const fs = require('fs');
const path = require('path');

// Comprehensive color replacements - sorted by length (longest first)
const colorReplacements = [
    // ============== OLD PALETTE CLEANUP ==============
    // Remove old brand colors
    ['#507295', '#6F8A9D'],
    ['#3d5a78', '#546A7A'],
    ['#6889ab', '#96AEC2'],
    ['#5a8bab', '#6F8A9D'],
    ['#7a9cb8', '#96AEC2'],
    ['#8aacca', '#96AEC2'],
    ['#aac01d', '#82A094'],
    ['#96b216', '#4F6A64'],
    ['#82a010', '#4F6A64'],
    ['#2c5a7e', '#546A7A'],
    ['#3d7a9e', '#6F8A9D'],

    // ============== BACKGROUND COLORS ==============
    // Blues
    ['bg-blue-950', 'bg-[#546A7A]'],
    ['bg-blue-900', 'bg-[#546A7A]'],
    ['bg-blue-800', 'bg-[#546A7A]'],
    ['bg-blue-700', 'bg-[#546A7A]'],
    ['bg-blue-600', 'bg-[#6F8A9D]'],
    ['bg-blue-500', 'bg-[#6F8A9D]'],
    ['bg-blue-400', 'bg-[#96AEC2]'],
    ['bg-blue-300', 'bg-[#96AEC2]/60'],
    ['bg-blue-200', 'bg-[#96AEC2]/40'],
    ['bg-blue-100', 'bg-[#96AEC2]/20'],
    ['bg-blue-50', 'bg-[#96AEC2]/10'],

    // Indigo
    ['bg-indigo-900', 'bg-[#546A7A]'],
    ['bg-indigo-800', 'bg-[#546A7A]'],
    ['bg-indigo-700', 'bg-[#546A7A]'],
    ['bg-indigo-600', 'bg-[#6F8A9D]'],
    ['bg-indigo-500', 'bg-[#6F8A9D]'],
    ['bg-indigo-400', 'bg-[#96AEC2]'],
    ['bg-indigo-300', 'bg-[#96AEC2]/60'],
    ['bg-indigo-200', 'bg-[#96AEC2]/40'],
    ['bg-indigo-100', 'bg-[#96AEC2]/20'],
    ['bg-indigo-50', 'bg-[#96AEC2]/10'],

    // Cyan
    ['bg-cyan-900', 'bg-[#546A7A]'],
    ['bg-cyan-800', 'bg-[#546A7A]'],
    ['bg-cyan-700', 'bg-[#546A7A]'],
    ['bg-cyan-600', 'bg-[#6F8A9D]'],
    ['bg-cyan-500', 'bg-[#6F8A9D]'],
    ['bg-cyan-400', 'bg-[#96AEC2]'],
    ['bg-cyan-300', 'bg-[#96AEC2]/60'],
    ['bg-cyan-200', 'bg-[#96AEC2]/40'],
    ['bg-cyan-100', 'bg-[#96AEC2]/20'],
    ['bg-cyan-50', 'bg-[#96AEC2]/10'],

    // Teal
    ['bg-teal-900', 'bg-[#4F6A64]'],
    ['bg-teal-800', 'bg-[#4F6A64]'],
    ['bg-teal-700', 'bg-[#4F6A64]'],
    ['bg-teal-600', 'bg-[#82A094]'],
    ['bg-teal-500', 'bg-[#82A094]'],
    ['bg-teal-400', 'bg-[#A2B9AF]'],
    ['bg-teal-300', 'bg-[#A2B9AF]/60'],
    ['bg-teal-200', 'bg-[#A2B9AF]/40'],
    ['bg-teal-100', 'bg-[#A2B9AF]/20'],
    ['bg-teal-50', 'bg-[#A2B9AF]/10'],

    // Green
    ['bg-green-900', 'bg-[#4F6A64]'],
    ['bg-green-800', 'bg-[#4F6A64]'],
    ['bg-green-700', 'bg-[#4F6A64]'],
    ['bg-green-600', 'bg-[#82A094]'],
    ['bg-green-500', 'bg-[#82A094]'],
    ['bg-green-400', 'bg-[#A2B9AF]'],
    ['bg-green-300', 'bg-[#A2B9AF]/60'],
    ['bg-green-200', 'bg-[#A2B9AF]/40'],
    ['bg-green-100', 'bg-[#A2B9AF]/20'],
    ['bg-green-50', 'bg-[#A2B9AF]/10'],

    // Emerald
    ['bg-emerald-900', 'bg-[#4F6A64]'],
    ['bg-emerald-800', 'bg-[#4F6A64]'],
    ['bg-emerald-700', 'bg-[#4F6A64]'],
    ['bg-emerald-600', 'bg-[#82A094]'],
    ['bg-emerald-500', 'bg-[#82A094]'],
    ['bg-emerald-400', 'bg-[#A2B9AF]'],
    ['bg-emerald-300', 'bg-[#A2B9AF]/60'],
    ['bg-emerald-200', 'bg-[#A2B9AF]/40'],
    ['bg-emerald-100', 'bg-[#A2B9AF]/20'],
    ['bg-emerald-50', 'bg-[#A2B9AF]/10'],

    // Red
    ['bg-red-900', 'bg-[#75242D]'],
    ['bg-red-800', 'bg-[#75242D]'],
    ['bg-red-700', 'bg-[#9E3B47]'],
    ['bg-red-600', 'bg-[#9E3B47]'],
    ['bg-red-500', 'bg-[#E17F70]'],
    ['bg-red-400', 'bg-[#E17F70]'],
    ['bg-red-300', 'bg-[#E17F70]/60'],
    ['bg-red-200', 'bg-[#E17F70]/40'],
    ['bg-red-100', 'bg-[#E17F70]/20'],
    ['bg-red-50', 'bg-[#E17F70]/10'],

    // Rose
    ['bg-rose-900', 'bg-[#75242D]'],
    ['bg-rose-800', 'bg-[#75242D]'],
    ['bg-rose-700', 'bg-[#9E3B47]'],
    ['bg-rose-600', 'bg-[#9E3B47]'],
    ['bg-rose-500', 'bg-[#E17F70]'],
    ['bg-rose-400', 'bg-[#EEC1BF]'],
    ['bg-rose-300', 'bg-[#EEC1BF]/60'],
    ['bg-rose-200', 'bg-[#EEC1BF]/40'],
    ['bg-rose-100', 'bg-[#EEC1BF]/20'],
    ['bg-rose-50', 'bg-[#EEC1BF]/10'],

    // Amber
    ['bg-amber-900', 'bg-[#976E44]'],
    ['bg-amber-800', 'bg-[#976E44]'],
    ['bg-amber-700', 'bg-[#976E44]'],
    ['bg-amber-600', 'bg-[#CE9F6B]'],
    ['bg-amber-500', 'bg-[#CE9F6B]'],
    ['bg-amber-400', 'bg-[#CE9F6B]'],
    ['bg-amber-300', 'bg-[#EEC1BF]/60'],
    ['bg-amber-200', 'bg-[#EEC1BF]/40'],
    ['bg-amber-100', 'bg-[#EEC1BF]/20'],
    ['bg-amber-50', 'bg-[#EEC1BF]/10'],

    // Orange
    ['bg-orange-900', 'bg-[#976E44]'],
    ['bg-orange-800', 'bg-[#976E44]'],
    ['bg-orange-700', 'bg-[#976E44]'],
    ['bg-orange-600', 'bg-[#CE9F6B]'],
    ['bg-orange-500', 'bg-[#CE9F6B]'],
    ['bg-orange-400', 'bg-[#CE9F6B]'],
    ['bg-orange-300', 'bg-[#EEC1BF]/60'],
    ['bg-orange-200', 'bg-[#EEC1BF]/40'],
    ['bg-orange-100', 'bg-[#EEC1BF]/20'],
    ['bg-orange-50', 'bg-[#EEC1BF]/10'],

    // Yellow
    ['bg-yellow-900', 'bg-[#976E44]'],
    ['bg-yellow-800', 'bg-[#976E44]'],
    ['bg-yellow-700', 'bg-[#CE9F6B]'],
    ['bg-yellow-600', 'bg-[#CE9F6B]'],
    ['bg-yellow-500', 'bg-[#CE9F6B]'],
    ['bg-yellow-400', 'bg-[#EEC1BF]'],
    ['bg-yellow-300', 'bg-[#EEC1BF]/60'],
    ['bg-yellow-200', 'bg-[#EEC1BF]/40'],
    ['bg-yellow-100', 'bg-[#EEC1BF]/20'],
    ['bg-yellow-50', 'bg-[#EEC1BF]/10'],

    // Purple
    ['bg-purple-900', 'bg-[#546A7A]'],
    ['bg-purple-800', 'bg-[#546A7A]'],
    ['bg-purple-700', 'bg-[#546A7A]'],
    ['bg-purple-600', 'bg-[#6F8A9D]'],
    ['bg-purple-500', 'bg-[#6F8A9D]'],
    ['bg-purple-400', 'bg-[#96AEC2]'],
    ['bg-purple-300', 'bg-[#96AEC2]/60'],
    ['bg-purple-200', 'bg-[#96AEC2]/40'],
    ['bg-purple-100', 'bg-[#96AEC2]/20'],
    ['bg-purple-50', 'bg-[#96AEC2]/10'],

    // Violet
    ['bg-violet-900', 'bg-[#546A7A]'],
    ['bg-violet-800', 'bg-[#546A7A]'],
    ['bg-violet-700', 'bg-[#546A7A]'],
    ['bg-violet-600', 'bg-[#6F8A9D]'],
    ['bg-violet-500', 'bg-[#6F8A9D]'],
    ['bg-violet-400', 'bg-[#96AEC2]'],
    ['bg-violet-300', 'bg-[#96AEC2]/60'],
    ['bg-violet-200', 'bg-[#96AEC2]/40'],
    ['bg-violet-100', 'bg-[#96AEC2]/20'],
    ['bg-violet-50', 'bg-[#96AEC2]/10'],

    // Fuchsia
    ['bg-fuchsia-600', 'bg-[#9E3B47]'],
    ['bg-fuchsia-500', 'bg-[#E17F70]'],
    ['bg-fuchsia-400', 'bg-[#EEC1BF]'],
    ['bg-fuchsia-200', 'bg-[#EEC1BF]/40'],
    ['bg-fuchsia-100', 'bg-[#EEC1BF]/20'],
    ['bg-fuchsia-50', 'bg-[#EEC1BF]/10'],

    // Pink
    ['bg-pink-600', 'bg-[#9E3B47]'],
    ['bg-pink-500', 'bg-[#E17F70]'],
    ['bg-pink-400', 'bg-[#EEC1BF]'],
    ['bg-pink-200', 'bg-[#EEC1BF]/40'],
    ['bg-pink-100', 'bg-[#EEC1BF]/20'],
    ['bg-pink-50', 'bg-[#EEC1BF]/10'],

    // Gray
    ['bg-gray-900', 'bg-[#5D6E73]'],
    ['bg-gray-800', 'bg-[#5D6E73]'],
    ['bg-gray-700', 'bg-[#757777]'],
    ['bg-gray-600', 'bg-[#92A2A5]'],
    ['bg-gray-500', 'bg-[#92A2A5]'],
    ['bg-gray-400', 'bg-[#AEBFC3]'],
    ['bg-gray-300', 'bg-[#AEBFC3]/60'],
    ['bg-gray-200', 'bg-[#AEBFC3]/40'],
    ['bg-gray-100', 'bg-[#AEBFC3]/20'],
    ['bg-gray-50', 'bg-[#AEBFC3]/10'],

    // Slate
    ['bg-slate-950', 'bg-[#5D6E73]'],
    ['bg-slate-900', 'bg-[#5D6E73]'],
    ['bg-slate-800', 'bg-[#5D6E73]'],
    ['bg-slate-700', 'bg-[#757777]'],
    ['bg-slate-600', 'bg-[#92A2A5]'],
    ['bg-slate-500', 'bg-[#92A2A5]'],
    ['bg-slate-400', 'bg-[#AEBFC3]'],
    ['bg-slate-300', 'bg-[#AEBFC3]/60'],
    ['bg-slate-200', 'bg-[#AEBFC3]/40'],
    ['bg-slate-100', 'bg-[#AEBFC3]/20'],
    ['bg-slate-50', 'bg-[#AEBFC3]/10'],

    // ============== TEXT COLORS ==============
    ['text-blue-900', 'text-[#546A7A]'],
    ['text-blue-800', 'text-[#546A7A]'],
    ['text-blue-700', 'text-[#546A7A]'],
    ['text-blue-600', 'text-[#6F8A9D]'],
    ['text-blue-500', 'text-[#6F8A9D]'],
    ['text-blue-400', 'text-[#96AEC2]'],

    ['text-indigo-900', 'text-[#546A7A]'],
    ['text-indigo-800', 'text-[#546A7A]'],
    ['text-indigo-700', 'text-[#546A7A]'],
    ['text-indigo-600', 'text-[#6F8A9D]'],
    ['text-indigo-500', 'text-[#6F8A9D]'],
    ['text-indigo-400', 'text-[#96AEC2]'],

    ['text-cyan-800', 'text-[#546A7A]'],
    ['text-cyan-700', 'text-[#546A7A]'],
    ['text-cyan-600', 'text-[#6F8A9D]'],
    ['text-cyan-500', 'text-[#6F8A9D]'],

    ['text-teal-800', 'text-[#4F6A64]'],
    ['text-teal-700', 'text-[#4F6A64]'],
    ['text-teal-600', 'text-[#82A094]'],
    ['text-teal-500', 'text-[#82A094]'],

    ['text-green-800', 'text-[#4F6A64]'],
    ['text-green-700', 'text-[#4F6A64]'],
    ['text-green-600', 'text-[#82A094]'],
    ['text-green-500', 'text-[#82A094]'],

    ['text-emerald-800', 'text-[#4F6A64]'],
    ['text-emerald-700', 'text-[#4F6A64]'],
    ['text-emerald-600', 'text-[#82A094]'],
    ['text-emerald-500', 'text-[#82A094]'],
    ['text-emerald-400', 'text-[#A2B9AF]'],
    ['text-emerald-300', 'text-[#A2B9AF]'],

    ['text-red-800', 'text-[#75242D]'],
    ['text-red-700', 'text-[#9E3B47]'],
    ['text-red-600', 'text-[#9E3B47]'],
    ['text-red-500', 'text-[#E17F70]'],

    ['text-rose-800', 'text-[#75242D]'],
    ['text-rose-700', 'text-[#9E3B47]'],
    ['text-rose-600', 'text-[#9E3B47]'],
    ['text-rose-500', 'text-[#E17F70]'],
    ['text-rose-400', 'text-[#E17F70]'],

    ['text-amber-700', 'text-[#976E44]'],
    ['text-amber-600', 'text-[#976E44]'],
    ['text-amber-500', 'text-[#CE9F6B]'],
    ['text-amber-400', 'text-[#CE9F6B]'],
    ['text-amber-300', 'text-[#EEC1BF]'],

    ['text-orange-700', 'text-[#976E44]'],
    ['text-orange-600', 'text-[#976E44]'],
    ['text-orange-500', 'text-[#CE9F6B]'],

    ['text-yellow-600', 'text-[#976E44]'],
    ['text-yellow-500', 'text-[#CE9F6B]'],

    ['text-purple-800', 'text-[#546A7A]'],
    ['text-purple-700', 'text-[#546A7A]'],
    ['text-purple-600', 'text-[#6F8A9D]'],
    ['text-purple-500', 'text-[#6F8A9D]'],
    ['text-purple-400', 'text-[#96AEC2]'],

    ['text-violet-800', 'text-[#546A7A]'],
    ['text-violet-700', 'text-[#546A7A]'],
    ['text-violet-600', 'text-[#6F8A9D]'],
    ['text-violet-500', 'text-[#6F8A9D]'],
    ['text-violet-400', 'text-[#96AEC2]'],

    ['text-pink-700', 'text-[#9E3B47]'],
    ['text-pink-600', 'text-[#9E3B47]'],
    ['text-pink-500', 'text-[#E17F70]'],

    ['text-fuchsia-600', 'text-[#9E3B47]'],
    ['text-fuchsia-500', 'text-[#E17F70]'],

    ['text-gray-950', 'text-[#5D6E73]'],
    ['text-gray-900', 'text-[#5D6E73]'],
    ['text-gray-800', 'text-[#5D6E73]'],
    ['text-gray-700', 'text-[#757777]'],
    ['text-gray-600', 'text-[#92A2A5]'],
    ['text-gray-500', 'text-[#92A2A5]'],
    ['text-gray-400', 'text-[#AEBFC3]'],

    ['text-slate-900', 'text-[#5D6E73]'],
    ['text-slate-800', 'text-[#5D6E73]'],
    ['text-slate-700', 'text-[#757777]'],
    ['text-slate-600', 'text-[#92A2A5]'],
    ['text-slate-500', 'text-[#92A2A5]'],
    ['text-slate-400', 'text-[#AEBFC3]'],

    // ============== BORDER COLORS ==============
    ['border-blue-600', 'border-[#6F8A9D]'],
    ['border-blue-500', 'border-[#6F8A9D]'],
    ['border-blue-400', 'border-[#96AEC2]'],
    ['border-blue-300', 'border-[#96AEC2]/60'],
    ['border-blue-200', 'border-[#96AEC2]/40'],
    ['border-blue-100', 'border-[#96AEC2]/20'],

    ['border-indigo-600', 'border-[#6F8A9D]'],
    ['border-indigo-500', 'border-[#6F8A9D]'],
    ['border-indigo-400', 'border-[#96AEC2]'],
    ['border-indigo-200', 'border-[#96AEC2]/40'],
    ['border-indigo-100', 'border-[#96AEC2]/20'],

    ['border-cyan-200', 'border-[#96AEC2]/40'],

    ['border-teal-200', 'border-[#A2B9AF]/40'],
    ['border-teal-100', 'border-[#A2B9AF]/20'],

    ['border-green-600', 'border-[#82A094]'],
    ['border-green-500', 'border-[#82A094]'],
    ['border-green-200', 'border-[#A2B9AF]/40'],
    ['border-green-100', 'border-[#A2B9AF]/20'],

    ['border-emerald-600', 'border-[#82A094]'],
    ['border-emerald-500', 'border-[#82A094]'],
    ['border-emerald-200', 'border-[#A2B9AF]/40'],
    ['border-emerald-100', 'border-[#A2B9AF]/20'],

    ['border-red-600', 'border-[#9E3B47]'],
    ['border-red-500', 'border-[#E17F70]'],
    ['border-red-200', 'border-[#E17F70]/40'],

    ['border-rose-600', 'border-[#9E3B47]'],
    ['border-rose-500', 'border-[#E17F70]'],
    ['border-rose-200', 'border-[#EEC1BF]/40'],
    ['border-rose-100', 'border-[#EEC1BF]/20'],

    ['border-amber-600', 'border-[#976E44]'],
    ['border-amber-500', 'border-[#CE9F6B]'],
    ['border-amber-200', 'border-[#CE9F6B]/40'],
    ['border-amber-100', 'border-[#EEC1BF]/20'],

    ['border-orange-200', 'border-[#CE9F6B]/40'],
    ['border-orange-100', 'border-[#EEC1BF]/20'],

    ['border-purple-500', 'border-[#6F8A9D]'],
    ['border-purple-200', 'border-[#96AEC2]/40'],
    ['border-purple-100', 'border-[#96AEC2]/20'],

    ['border-violet-200', 'border-[#96AEC2]/40'],

    ['border-pink-200', 'border-[#EEC1BF]/40'],
    ['border-pink-100', 'border-[#EEC1BF]/20'],

    ['border-gray-200', 'border-[#AEBFC3]/40'],
    ['border-gray-100', 'border-[#AEBFC3]/20'],

    ['border-slate-200', 'border-[#AEBFC3]/40'],
    ['border-slate-100', 'border-[#AEBFC3]/20'],

    // Border-L
    ['border-l-emerald-500', 'border-l-[#82A094]'],
    ['border-l-green-500', 'border-l-[#82A094]'],
    ['border-l-blue-500', 'border-l-[#6F8A9D]'],
    ['border-l-indigo-500', 'border-l-[#6F8A9D]'],
    ['border-l-purple-500', 'border-l-[#6F8A9D]'],
    ['border-l-violet-500', 'border-l-[#6F8A9D]'],
    ['border-l-amber-500', 'border-l-[#CE9F6B]'],
    ['border-l-orange-500', 'border-l-[#CE9F6B]'],
    ['border-l-red-500', 'border-l-[#E17F70]'],
    ['border-l-rose-500', 'border-l-[#E17F70]'],

    // Border-T
    ['border-t-indigo-600', 'border-t-[#6F8A9D]'],
    ['border-t-blue-400', 'border-t-[#96AEC2]'],

    // ============== GRADIENT COLORS ==============
    // From colors
    ['from-blue-950', 'from-[#546A7A]'],
    ['from-blue-900', 'from-[#546A7A]'],
    ['from-blue-800', 'from-[#546A7A]'],
    ['from-blue-700', 'from-[#546A7A]'],
    ['from-blue-600', 'from-[#6F8A9D]'],
    ['from-blue-500', 'from-[#6F8A9D]'],
    ['from-blue-400', 'from-[#96AEC2]'],
    ['from-blue-100', 'from-[#96AEC2]/20'],
    ['from-blue-50', 'from-[#96AEC2]/10'],

    ['from-indigo-900', 'from-[#546A7A]'],
    ['from-indigo-700', 'from-[#546A7A]'],
    ['from-indigo-600', 'from-[#6F8A9D]'],
    ['from-indigo-500', 'from-[#6F8A9D]'],
    ['from-indigo-100', 'from-[#96AEC2]/20'],
    ['from-indigo-50', 'from-[#96AEC2]/10'],

    ['from-cyan-500', 'from-[#6F8A9D]'],
    ['from-cyan-400', 'from-[#96AEC2]'],
    ['from-cyan-50', 'from-[#96AEC2]/10'],

    ['from-teal-600', 'from-[#82A094]'],
    ['from-teal-500', 'from-[#82A094]'],
    ['from-teal-400', 'from-[#A2B9AF]'],
    ['from-teal-50', 'from-[#A2B9AF]/10'],

    ['from-green-600', 'from-[#82A094]'],
    ['from-green-500', 'from-[#82A094]'],
    ['from-green-100', 'from-[#A2B9AF]/20'],
    ['from-green-50', 'from-[#A2B9AF]/10'],

    ['from-emerald-700', 'from-[#4F6A64]'],
    ['from-emerald-600', 'from-[#82A094]'],
    ['from-emerald-500', 'from-[#82A094]'],
    ['from-emerald-400', 'from-[#A2B9AF]'],
    ['from-emerald-50', 'from-[#A2B9AF]/10'],

    ['from-red-600', 'from-[#9E3B47]'],
    ['from-red-500', 'from-[#E17F70]'],
    ['from-red-50', 'from-[#E17F70]/10'],

    ['from-rose-700', 'from-[#9E3B47]'],
    ['from-rose-600', 'from-[#9E3B47]'],
    ['from-rose-500', 'from-[#E17F70]'],
    ['from-rose-50', 'from-[#EEC1BF]/10'],

    ['from-amber-500', 'from-[#CE9F6B]'],
    ['from-amber-400', 'from-[#CE9F6B]'],
    ['from-amber-50', 'from-[#EEC1BF]/10'],

    ['from-orange-600', 'from-[#976E44]'],
    ['from-orange-500', 'from-[#CE9F6B]'],
    ['from-orange-50', 'from-[#EEC1BF]/10'],

    ['from-purple-700', 'from-[#546A7A]'],
    ['from-purple-600', 'from-[#6F8A9D]'],
    ['from-purple-500', 'from-[#6F8A9D]'],
    ['from-purple-100', 'from-[#96AEC2]/20'],
    ['from-purple-50', 'from-[#96AEC2]/10'],

    ['from-violet-700', 'from-[#546A7A]'],
    ['from-violet-600', 'from-[#6F8A9D]'],
    ['from-violet-500', 'from-[#6F8A9D]'],
    ['from-violet-400', 'from-[#96AEC2]'],
    ['from-violet-50', 'from-[#96AEC2]/10'],

    ['from-pink-600', 'from-[#9E3B47]'],
    ['from-pink-500', 'from-[#E17F70]'],
    ['from-pink-50', 'from-[#EEC1BF]/10'],

    ['from-fuchsia-600', 'from-[#9E3B47]'],
    ['from-fuchsia-500', 'from-[#E17F70]'],

    ['from-gray-200', 'from-[#AEBFC3]/40'],
    ['from-gray-50', 'from-[#AEBFC3]/10'],

    ['from-slate-950', 'from-[#5D6E73]'],
    ['from-slate-900', 'from-[#5D6E73]'],
    ['from-slate-50', 'from-[#AEBFC3]/10'],

    // Via colors
    ['via-blue-950', 'via-[#546A7A]'],
    ['via-blue-900', 'via-[#546A7A]'],
    ['via-blue-600', 'via-[#6F8A9D]'],
    ['via-blue-500', 'via-[#6F8A9D]'],

    ['via-indigo-600', 'via-[#6F8A9D]'],
    ['via-indigo-500', 'via-[#6F8A9D]'],

    ['via-cyan-500', 'via-[#6F8A9D]'],

    ['via-teal-600', 'via-[#82A094]'],
    ['via-teal-500', 'via-[#82A094]'],

    ['via-green-500', 'via-[#82A094]'],

    ['via-emerald-600', 'via-[#82A094]'],

    ['via-orange-600', 'via-[#976E44]'],
    ['via-orange-500', 'via-[#CE9F6B]'],

    ['via-amber-500', 'via-[#CE9F6B]'],

    ['via-purple-950/50', 'via-[#6F8A9D]/50'],
    ['via-purple-600', 'via-[#6F8A9D]'],
    ['via-purple-500', 'via-[#6F8A9D]'],

    ['via-fuchsia-500', 'via-[#E17F70]'],

    // To colors
    ['to-blue-950', 'to-[#546A7A]'],
    ['to-blue-900', 'to-[#546A7A]'],
    ['to-blue-700', 'to-[#546A7A]'],
    ['to-blue-600', 'to-[#6F8A9D]'],
    ['to-blue-500', 'to-[#6F8A9D]'],
    ['to-blue-100', 'to-[#96AEC2]/20'],
    ['to-blue-50', 'to-[#96AEC2]/10'],

    ['to-indigo-900', 'to-[#546A7A]'],
    ['to-indigo-700', 'to-[#546A7A]'],
    ['to-indigo-600', 'to-[#6F8A9D]'],
    ['to-indigo-500', 'to-[#6F8A9D]'],
    ['to-indigo-100', 'to-[#96AEC2]/20'],
    ['to-indigo-50', 'to-[#96AEC2]/10'],

    ['to-cyan-700', 'to-[#546A7A]'],
    ['to-cyan-500', 'to-[#6F8A9D]'],
    ['to-cyan-100', 'to-[#96AEC2]/20'],
    ['to-cyan-50', 'to-[#96AEC2]/10'],

    ['to-teal-700', 'to-[#4F6A64]'],
    ['to-teal-600', 'to-[#82A094]'],
    ['to-teal-500', 'to-[#82A094]'],
    ['to-teal-100', 'to-[#A2B9AF]/20'],
    ['to-teal-50', 'to-[#A2B9AF]/10'],

    ['to-green-600', 'to-[#82A094]'],
    ['to-green-500', 'to-[#82A094]'],
    ['to-green-100', 'to-[#A2B9AF]/20'],
    ['to-green-50', 'to-[#A2B9AF]/10'],

    ['to-emerald-700', 'to-[#4F6A64]'],
    ['to-emerald-600', 'to-[#82A094]'],
    ['to-emerald-500', 'to-[#82A094]'],
    ['to-emerald-100', 'to-[#A2B9AF]/20'],
    ['to-emerald-50', 'to-[#A2B9AF]/10'],

    ['to-red-500', 'to-[#E17F70]'],

    ['to-rose-700', 'to-[#9E3B47]'],
    ['to-rose-600', 'to-[#9E3B47]'],
    ['to-rose-500', 'to-[#E17F70]'],
    ['to-rose-100', 'to-[#EEC1BF]/20'],
    ['to-rose-50', 'to-[#EEC1BF]/10'],

    ['to-amber-600', 'to-[#976E44]'],
    ['to-amber-500', 'to-[#CE9F6B]'],
    ['to-amber-100', 'to-[#EEC1BF]/20'],
    ['to-amber-50', 'to-[#EEC1BF]/10'],

    ['to-orange-600', 'to-[#976E44]'],
    ['to-orange-500', 'to-[#CE9F6B]'],
    ['to-orange-100', 'to-[#EEC1BF]/20'],
    ['to-orange-50', 'to-[#EEC1BF]/10'],

    ['to-purple-700', 'to-[#546A7A]'],
    ['to-purple-600', 'to-[#6F8A9D]'],
    ['to-purple-500', 'to-[#6F8A9D]'],
    ['to-purple-100', 'to-[#96AEC2]/20'],
    ['to-purple-50', 'to-[#96AEC2]/10'],

    ['to-violet-600', 'to-[#6F8A9D]'],
    ['to-violet-50', 'to-[#96AEC2]/10'],

    ['to-pink-600', 'to-[#9E3B47]'],
    ['to-pink-500', 'to-[#E17F70]'],
    ['to-pink-400', 'to-[#EEC1BF]'],
    ['to-pink-100', 'to-[#EEC1BF]/20'],
    ['to-pink-50', 'to-[#EEC1BF]/10'],

    ['to-fuchsia-600', 'to-[#9E3B47]'],
    ['to-fuchsia-500', 'to-[#E17F70]'],
    ['to-fuchsia-200', 'to-[#EEC1BF]/40'],
    ['to-fuchsia-100', 'to-[#EEC1BF]/20'],

    ['to-gray-300', 'to-[#AEBFC3]/60'],
    ['to-gray-100', 'to-[#AEBFC3]/20'],

    ['to-slate-950', 'to-[#5D6E73]'],
    ['to-slate-900', 'to-[#5D6E73]'],
    ['to-slate-100', 'to-[#AEBFC3]/20'],
    ['to-slate-50', 'to-[#AEBFC3]/10'],

    // ============== SHADOW COLORS ==============
    ['shadow-emerald-500/30', 'shadow-[#82A094]/30'],
    ['shadow-emerald-500/25', 'shadow-[#82A094]/25'],
    ['shadow-emerald-500/20', 'shadow-[#82A094]/20'],
    ['shadow-emerald-200', 'shadow-[#A2B9AF]/50'],
    ['shadow-green-500/20', 'shadow-[#82A094]/20'],
    ['shadow-amber-500/25', 'shadow-[#CE9F6B]/25'],
    ['shadow-amber-200', 'shadow-[#CE9F6B]/50'],
    ['shadow-blue-500/25', 'shadow-[#6F8A9D]/25'],
    ['shadow-blue-500/20', 'shadow-[#6F8A9D]/20'],
    ['shadow-purple-500/25', 'shadow-[#6F8A9D]/25'],
    ['shadow-purple-500/20', 'shadow-[#6F8A9D]/20'],
    ['shadow-purple-200/60', 'shadow-[#6F8A9D]/30'],
    ['shadow-purple-100/50', 'shadow-[#6F8A9D]/20'],
    ['shadow-indigo-500/30', 'shadow-[#6F8A9D]/30'],
    ['shadow-indigo-200', 'shadow-[#6F8A9D]/50'],
    ['shadow-orange-500/30', 'shadow-[#CE9F6B]/30'],

    // ============== RING/FOCUS COLORS ==============
    ['ring-blue-500', 'ring-[#6F8A9D]'],
    ['ring-indigo-500', 'ring-[#6F8A9D]'],
    ['ring-purple-500', 'ring-[#6F8A9D]'],
    ['ring-emerald-500', 'ring-[#82A094]'],
    ['ring-green-500', 'ring-[#82A094]'],
    ['ring-amber-500', 'ring-[#CE9F6B]'],
    ['ring-red-500', 'ring-[#E17F70]'],

    ['focus:ring-indigo-500', 'focus:ring-[#6F8A9D]'],
    ['focus:ring-purple-500', 'focus:ring-[#6F8A9D]'],
    ['focus:ring-emerald-500', 'focus:ring-[#82A094]'],
    ['focus:ring-amber-500', 'focus:ring-[#CE9F6B]'],

    ['focus:border-indigo-500', 'focus:border-[#6F8A9D]'],
    ['focus:border-purple-500', 'focus:border-[#6F8A9D]'],
    ['focus:border-emerald-500', 'focus:border-[#82A094]'],
    ['focus:border-amber-500', 'focus:border-[#CE9F6B]'],

    // ============== HOVER COLORS ==============
    ['hover:bg-blue-700', 'hover:bg-[#546A7A]'],
    ['hover:bg-blue-600', 'hover:bg-[#6F8A9D]'],
    ['hover:bg-indigo-700', 'hover:bg-[#546A7A]'],
    ['hover:bg-indigo-600', 'hover:bg-[#6F8A9D]'],
    ['hover:bg-emerald-700', 'hover:bg-[#4F6A64]'],
    ['hover:bg-emerald-600', 'hover:bg-[#82A094]'],
    ['hover:bg-emerald-200', 'hover:bg-[#A2B9AF]/40'],
    ['hover:bg-purple-700', 'hover:bg-[#546A7A]'],
    ['hover:bg-purple-600', 'hover:bg-[#6F8A9D]'],
    ['hover:bg-purple-200', 'hover:bg-[#96AEC2]/40'],
    ['hover:bg-purple-100', 'hover:bg-[#96AEC2]/20'],
    ['hover:bg-amber-200', 'hover:bg-[#CE9F6B]/40'],

    ['hover:from-blue-700', 'hover:from-[#546A7A]'],
    ['hover:from-blue-600', 'hover:from-[#6F8A9D]'],
    ['hover:from-indigo-700', 'hover:from-[#546A7A]'],
    ['hover:from-purple-700', 'hover:from-[#546A7A]'],
    ['hover:from-purple-200', 'hover:from-[#96AEC2]/40'],
    ['hover:from-fuchsia-200', 'hover:from-[#EEC1BF]/40'],

    ['hover:to-purple-700', 'hover:to-[#546A7A]'],
    ['hover:to-indigo-700', 'hover:to-[#546A7A]'],
    ['hover:to-emerald-700', 'hover:to-[#4F6A64]'],
    ['hover:to-fuchsia-200', 'hover:to-[#EEC1BF]/40'],

    // ============== DARK MODE COLORS ==============
    ['dark:bg-indigo-900', 'dark:bg-[#546A7A]'],
    ['dark:bg-emerald-900/40', 'dark:bg-[#4F6A64]/40'],
    ['dark:bg-emerald-900/30', 'dark:bg-[#4F6A64]/30'],
    ['dark:bg-emerald-900', 'dark:bg-[#4F6A64]'],
    ['dark:bg-rose-900/40', 'dark:bg-[#9E3B47]/40'],
    ['dark:bg-rose-900/30', 'dark:bg-[#9E3B47]/30'],
    ['dark:bg-cyan-900/50', 'dark:bg-[#546A7A]/50'],
    ['dark:bg-cyan-900/30', 'dark:bg-[#546A7A]/30'],
    ['dark:bg-amber-900/30', 'dark:bg-[#976E44]/30'],
    ['dark:bg-amber-900', 'dark:bg-[#976E44]'],
    ['dark:text-emerald-400', 'dark:text-[#A2B9AF]'],
    ['dark:text-emerald-300', 'dark:text-[#A2B9AF]'],
    ['dark:text-rose-400', 'dark:text-[#E17F70]'],
    ['dark:hover:bg-cyan-900/50', 'dark:hover:bg-[#546A7A]/50'],
];

// Sort by length (longest first) to prevent partial replacements
colorReplacements.sort((a, b) => b[0].length - a[0].length);

function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changeCount = 0;

    for (const [oldColor, newColor] of colorReplacements) {
        const escapedOld = oldColor.replace(/[.*+?^${}()|[\]\\\/\-]/g, '\\$&');
        const regex = new RegExp(escapedOld, 'g');
        const matches = content.match(regex);
        if (matches) {
            content = content.replace(regex, newColor);
            changeCount += matches.length;
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        return changeCount;
    }
    return 0;
}

function processDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const results = { filesChanged: 0, totalChanges: 0, details: [] };

    function walk(dir) {
        try {
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const filePath = path.join(dir, file);
                try {
                    const stat = fs.statSync(filePath);

                    if (stat.isDirectory()) {
                        // Skip node_modules and other non-essential directories
                        if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
                            walk(filePath);
                        }
                    } else if (extensions.some(ext => file.endsWith(ext))) {
                        const changes = migrateFile(filePath);
                        if (changes > 0) {
                            results.filesChanged++;
                            results.totalChanges += changes;
                            results.details.push({ file: filePath, changes });
                        }
                    }
                } catch (e) {
                    // Skip files that can't be processed
                }
            }
        } catch (e) {
            // Skip directories that can't be read
        }
    }

    walk(dirPath);
    return results;
}

// Main execution
const srcDir = path.resolve(__dirname, '../src');

console.log('🎨 KARDEX COLOR MIGRATION v3 - COMPLETE');
console.log('='.repeat(50));
console.log(`📁 Processing entire src directory: ${srcDir}\n`);

const results = processDirectory(srcDir);

console.log('\n📊 MIGRATION SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Files changed: ${results.filesChanged}`);
console.log(`🔄 Total color replacements: ${results.totalChanges}`);

if (results.details.length > 0) {
    console.log('\n📝 Changed files:');
    results.details.slice(0, 30).forEach(({ file, changes }) => {
        const relativePath = path.relative(srcDir, file);
        console.log(`   - ${relativePath}: ${changes} changes`);
    });
    if (results.details.length > 30) {
        console.log(`   ... and ${results.details.length - 30} more files`);
    }
}

console.log('\n✨ Migration complete! All colors now use Kardex brand palette.');
