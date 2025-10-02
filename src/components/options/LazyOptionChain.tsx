import React, { Suspense, lazy } from 'react';
import type { OptionChainProps } from '@/shared/types';

// Lazy load the OptionChain component for better performance
const OptionChain = lazy(() => import('./OptionChain'));

// Loading skeleton component
const OptionChainSkeleton: React.FC = () => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-slate-700/50 rounded-3xl">
    {/* Header skeleton */}
    <div className="p-8 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl animate-pulse"></div>
          <div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Info row skeleton */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className="p-8">
      {/* Filters skeleton */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
        <div className="min-w-full">
          {/* Header skeleton */}
          <div className="bg-gray-50/80 dark:bg-slate-800/80 p-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <div className="grid grid-cols-11 gap-3">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Rows skeleton */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200/50 dark:border-slate-700/50 last:border-b-0">
              <div className="grid grid-cols-11 gap-3">
                {Array.from({ length: 11 }).map((_, j) => (
                  <div key={j} className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="mt-6 p-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
        <div className="flex flex-wrap gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error boundary for the lazy-loaded component
class OptionChainErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('OptionChain Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-slate-700/50 rounded-3xl p-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to load Option Chain
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There was an error loading the option chain component. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main lazy option chain component with optimizations
const LazyOptionChain: React.FC<OptionChainProps> = (props) => {
  return (
    <OptionChainErrorBoundary>
      <Suspense fallback={<OptionChainSkeleton />}>
        <OptionChain {...props} />
      </Suspense>
    </OptionChainErrorBoundary>
  );
};

export default LazyOptionChain;