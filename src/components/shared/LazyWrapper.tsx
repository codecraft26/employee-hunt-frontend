import React, { Suspense, lazy, ComponentType } from 'react';
import { Zap, Sparkles, Trophy } from 'lucide-react';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

const GamingLoadingFallback: React.FC = () => (
  <div className="gaming-bg min-h-screen flex items-center justify-center">
    <div className="text-center space-y-6">
      {/* Animated loading icon */}
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
          <Trophy className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Zap className="h-6 w-6 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient">Loading Epic Content...</h2>
        <p className="text-gray-400 text-sm">Preparing your gaming adventure</p>
      </div>
      
      {/* Loading dots */}
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  </div>
);

const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  fallback = <GamingLoadingFallback />, 
  children 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
}

// Utility function to create lazy components with custom fallback
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
}

export default LazyWrapper; 