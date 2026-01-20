'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for gracefully handling errors in report components.
 * Prevents the entire page from crashing when a report component fails to render.
 */
class ReportErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Report component error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-[#E17F70] bg-[#E17F70]/10">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-[#E17F70] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#75242D] mb-2">
              Unable to load report
            </h3>
            <p className="text-[#75242D] mb-4">
              {this.state.error?.message || 'An unexpected error occurred while rendering the report.'}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={this.handleRetry}
                className="border-[#E17F70] text-[#75242D] hover:bg-[#E17F70]/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="text-[#75242D] hover:bg-[#E17F70]/20"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ReportErrorBoundary;
