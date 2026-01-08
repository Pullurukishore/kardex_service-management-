'use client';

import { useState, useRef } from 'react';
import { arApi } from '@/lib/ar-api';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, Sparkles, UploadCloud, FileCheck, Eye, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, List, Grid3X3, AlertTriangle, Info, XCircle } from 'lucide-react';

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

interface FieldError {
  field: string;
  message: string;
}

interface ErrorDetails {
  message: string;
  details?: string;
  error?: string;
  missingColumns?: string[];
}

type Step = 'upload' | 'preview' | 'importing';

export default function ARImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const rowsPerPage = 20;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);

    try {
      const previewData = await arApi.previewExcel(selectedFile);
      setPreview(previewData);
      // Auto-select all rows initially
      const allRows = new Set<number>();
      for (let i = 0; i < (previewData.preview?.length || 0); i++) {
        allRows.add(i);
      }
      setSelectedRows(allRows);
      setStep('preview');
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Preview error:', err);
      setPreview({ totalRows: '?', headers: [], preview: [] });
      
      // Extract detailed error info
      const errorData = err.response?.data || err;
      setError({
        message: errorData.message || 'Failed to read file',
        details: errorData.details || 'Please check that the file is a valid Excel format (.xlsx or .xls)',
        error: errorData.error || err.message,
        missingColumns: errorData.missingColumns
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setStep('importing');
    setError(null);

    try {
      const importResult = await arApi.importExcel(file);
      setResult(importResult);
      setFile(null);
      setPreview(null);
      setStep('upload');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Import error:', err);
      const errorData = err.response?.data || err;
      setError({
        message: errorData.message || 'Import failed',
        details: errorData.details || 'Please check your file format and try again',
        error: errorData.error || err.message
      });
      setStep('preview');
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep('upload');
    setCurrentPage(1);
    setSelectedRows(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBackToUpload = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setCurrentPage(1);
    setSelectedRows(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === (preview?.preview?.length || 0)) {
      setSelectedRows(new Set());
    } else {
      const allRows = new Set<number>();
      for (let i = 0; i < (preview?.preview?.length || 0); i++) {
        allRows.add(i);
      }
      setSelectedRows(allRows);
    }
  };

  // Pagination
  const totalRows = preview?.preview?.length || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const currentRows = preview?.preview?.slice(startIndex, endIndex) || [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-2">
        {[
          { key: 'upload', label: 'Upload File', icon: UploadCloud },
          { key: 'preview', label: 'Review Data', icon: Eye },
          { key: 'importing', label: 'Import', icon: CheckCircle }
        ].map((s, index) => {
          const Icon = s.icon;
          const isActive = step === s.key;
          const isPast = (step === 'preview' && s.key === 'upload') || 
                         (step === 'importing' && (s.key === 'upload' || s.key === 'preview'));
          const isFuture = !isActive && !isPast;
          
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40' 
                  : isPast 
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-white/5 border border-white/10'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                    : isPast 
                      ? 'bg-emerald-500/50'
                      : 'bg-white/10'
                }`}>
                  {isPast ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/40'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-white' : isPast ? 'text-emerald-400/70' : 'text-white/40'
                }`}>{s.label}</span>
              </div>
              {index < 2 && (
                <ArrowRight className={`w-4 h-4 ${isPast ? 'text-emerald-400/50' : 'text-white/20'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          Import Invoices
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </h1>
        <p className="text-emerald-200/60 text-sm mt-1 font-medium">
          {step === 'upload' && 'Upload Excel files to import invoice data'}
          {step === 'preview' && 'Review all records before importing'}
          {step === 'importing' && 'Importing your data...'}
        </p>
      </div>

      {/* Step 1: Upload Area */}
      {step === 'upload' && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-purple-500/20 transition-all duration-300">
          <label 
            className={`flex flex-col items-center justify-center cursor-pointer py-16 border-2 border-dashed rounded-2xl transition-all duration-300 group relative overflow-hidden ${
              dragActive 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Animated background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${dragActive ? 'scale-110 rotate-3' : ''}`}
              style={{ boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)' }}
            >
              <UploadCloud className="w-10 h-10 text-white" />
            </div>
            <div className="text-center relative z-10">
              <p className="text-white font-semibold text-lg mb-2">
                {dragActive ? 'Drop your file here' : 'Drop your Excel file here'}
              </p>
              <p className="text-white/40 text-sm">or click to browse</p>
              <p className="text-white/25 text-xs mt-3">Supports .xlsx and .xls files</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Step 2: Preview Step */}
      {step === 'preview' && preview && (
        <div className="space-y-6">
          {/* File Info & Actions */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                  style={{ boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)' }}
                >
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{file?.name}</p>
                  <p className="text-emerald-400/70 text-sm">
                    {totalRows} rows found • {selectedRows.size} selected for import
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBackToUpload}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button 
                  onClick={handleClear}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {/* Validation Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Rows</p>
                <p className="text-white text-2xl font-bold">{totalRows}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <p className="text-emerald-400/60 text-xs uppercase tracking-wider">Valid Rows</p>
                </div>
                <p className="text-emerald-400 text-2xl font-bold">{preview.validRows || totalRows}</p>
              </div>
              <div className={`${(preview.invalidRows || 0) > 0 ? 'bg-red-500/10' : 'bg-white/5'} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <p className={`${(preview.invalidRows || 0) > 0 ? 'text-red-400/60' : 'text-white/40'} text-xs uppercase tracking-wider`}>Invalid Rows</p>
                </div>
                <p className={`${(preview.invalidRows || 0) > 0 ? 'text-red-400' : 'text-white/40'} text-2xl font-bold`}>{preview.invalidRows || 0}</p>
              </div>
            </div>

            {/* Missing Columns Warning */}
            {preview.missingColumns && preview.missingColumns.length > 0 && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-semibold">Missing Required Columns</p>
                    <p className="text-amber-400/70 text-sm mt-1">
                      The following columns are missing from your file: {preview.missingColumns.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Preview Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  Data Preview
                </h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleAllRows}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all"
                  >
                    {selectedRows.size === totalRows ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-white/40 text-sm">
                    Showing {startIndex + 1}-{endIndex} of {totalRows}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-white/10 max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gradient-to-r from-purple-500/20 via-fuchsia-500/15 to-purple-500/10 backdrop-blur-sm">
                      <th className="text-left py-3 px-4 text-white/50 font-semibold text-xs uppercase tracking-wider w-12">
                        #
                      </th>
                      {preview.headers?.map((header: string, i: number) => (
                        <th key={i} className="text-left py-3 px-4 text-white/50 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((row: any, i: number) => {
                      const globalIndex = startIndex + i;
                      const isSelected = selectedRows.has(globalIndex);
                      const isValid = row._isValid !== false;
                      const rowErrors: FieldError[] = row._errors || [];
                      
                      return (
                        <tr 
                          key={globalIndex}
                          onClick={() => toggleRowSelection(globalIndex)}
                          className={`border-t border-white/5 cursor-pointer transition-all duration-200 ${
                            !isValid 
                              ? 'bg-red-500/10 hover:bg-red-500/15' 
                              : isSelected 
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/15' 
                                : 'hover:bg-white/5 opacity-50'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                !isValid
                                  ? 'border-red-500 bg-red-500/30'
                                  : isSelected 
                                    ? 'border-emerald-500 bg-emerald-500' 
                                    : 'border-white/20 bg-transparent'
                              }`}>
                                {!isValid ? (
                                  <AlertTriangle className="w-3 h-3 text-red-400" />
                                ) : isSelected ? (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                ) : null}
                              </div>
                              {/* Row number */}
                              <span className="text-white/30 text-xs">{row._rowNumber || globalIndex + 2}</span>
                            </div>
                          </td>
                          {preview.headers?.filter((h: string) => !h.startsWith('_')).map((header: string, j: number) => {
                            const hasError = rowErrors.some((e: FieldError) => e.field === header);
                            return (
                              <td key={j} className={`py-3 px-4 whitespace-nowrap relative ${
                                hasError 
                                  ? 'text-red-400' 
                                  : !isValid
                                    ? 'text-red-400/70'
                                    : isSelected 
                                      ? 'text-white' 
                                      : 'text-white/50'
                              }`}>
                                {hasError && (
                                  <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                )}
                                {row[header] || <span className={hasError ? 'text-red-400 italic' : 'text-white/25'}>
                                  {hasError ? 'Missing' : '-'}
                                </span>}
                              </td>
                            );
                          })}
                          {/* Error details column */}
                          {rowErrors.length > 0 && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1" title={rowErrors.map((e: FieldError) => e.message).join(', ')}>
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-400 text-xs">{rowErrors.length} error{rowErrors.length > 1 ? 's' : ''}</span>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="text-white/40 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-white/60" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white/60 text-sm"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                              currentPage === pageNum
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-white/60'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white/60 text-sm"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Import Confirmation */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-2xl border border-emerald-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Ready to Import</p>
                  <p className="text-emerald-400/70 text-sm">
                    {selectedRows.size} of {totalRows} records will be imported
                  </p>
                </div>
              </div>
              <button
                onClick={handleImport}
                disabled={selectedRows.size === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:hover:translate-y-0"
              >
                <Upload className="w-5 h-5" />
                <span>Confirm Import</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-12 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6"
            style={{ boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)' }}
          >
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Importing Records...</h3>
          <p className="text-white/40 text-sm">Please wait while we process your data</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl overflow-hidden">
          <div className="flex items-start gap-4 p-5">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-semibold text-lg">{error.message}</p>
              {error.details && (
                <p className="text-red-400/70 text-sm mt-1">{error.details}</p>
              )}
              
              {/* Missing Columns */}
              {error.missingColumns && error.missingColumns.length > 0 && (
                <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
                  <p className="text-red-400/80 text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Missing Required Columns:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {error.missingColumns.map((col, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Error */}
              {error.error && (
                <div className="mt-3 p-3 bg-black/20 rounded-lg">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Technical Details</p>
                  <p className="text-red-400/60 text-xs font-mono break-all">{error.error}</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-all"
            >
              <X className="w-4 h-4 text-red-400/60" />
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`p-6 rounded-2xl border relative overflow-hidden ${
          result.failed === 0 
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30' 
            : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30'
        }`}>
          <div className="flex items-start gap-5">
            <div 
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                result.failed === 0 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-br from-amber-500 to-orange-500'
              }`}
              style={{ boxShadow: result.failed === 0 ? '0 8px 25px rgba(16, 185, 129, 0.3)' : '0 8px 25px rgba(251, 191, 36, 0.3)' }}
            >
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${
                result.failed === 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                Import {result.failed === 0 ? 'Completed Successfully!' : 'Partially Completed'}
              </h3>
              <div className="mt-4 grid grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Records</p>
                  <p className="text-white text-2xl font-bold">{result.total}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4">
                  <p className="text-emerald-400/60 text-xs uppercase tracking-wider mb-1">Successful</p>
                  <p className="text-emerald-400 text-2xl font-bold">{result.success}</p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4">
                  <p className="text-red-400/60 text-xs uppercase tracking-wider mb-1">Failed</p>
                  <p className="text-red-400 text-2xl font-bold">{result.failed}</p>
                </div>
              </div>
              {result.errors?.length > 0 && (
                <div className="mt-4 p-4 bg-black/20 rounded-xl max-h-32 overflow-y-auto">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Errors</p>
                  {result.errors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-red-400/80 text-sm">{err}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions - Show only on upload step */}
      {step === 'upload' && (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/20 transition-all duration-300">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Expected Columns (SAP Excel Format)
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { name: 'Doc. No.', required: true, desc: 'Invoice Number' },
              { name: 'Customer Code', required: true, desc: 'BP Code' },
              { name: 'Customer Name', required: true, desc: 'Customer Name' },
              { name: 'Amount', required: true, desc: 'Total Amount' },
              { name: 'Net', required: true, desc: 'Net Amount' },
              { name: 'Tax', required: false, desc: 'Tax Amount' },
              { name: 'Document Date', required: true, desc: 'Invoice Date' },
              { name: 'Customer Ref. No.', required: false, desc: 'PO Number' },
              { name: 'Due Date', required: false, desc: 'Payment Due Date' },
            ].map((col, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className={`w-2 h-2 rounded-full ${col.required ? 'bg-purple-400' : 'bg-white/20'}`} />
                <span className="text-white/70">{col.name}</span>
                {col.required && <span className="text-purple-400 text-xs font-semibold">Required</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
