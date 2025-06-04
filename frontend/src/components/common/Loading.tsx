// src/components/common/Loading.tsx
import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const renderSpinner = () => (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`bg-current rounded-full animate-pulse ${sizeClasses[size]}`} />
      <div className={`bg-current rounded-full animate-pulse ${sizeClasses[size]}`} style={{ animationDelay: '0.2s' }} />
      <div className={`bg-current rounded-full animate-pulse ${sizeClasses[size]}`} style={{ animationDelay: '0.4s' }} />
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-current rounded-full animate-pulse ${sizeClasses[size]} ${className}`} />
  );

  const renderSkeleton = () => (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-300 rounded-md h-4 w-full mb-2" />
      <div className="bg-gray-300 rounded-md h-4 w-3/4 mb-2" />
      <div className="bg-gray-300 rounded-md h-4 w-1/2" />
    </div>
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center text-gray-600">
      {renderLoadingIndicator()}
      {text && (
        <p className="mt-2 text-sm font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton variants for specific use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 rounded-lg p-4">
      <div className="bg-gray-400 rounded-md h-6 w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="bg-gray-400 rounded-md h-4 w-full" />
        <div className="bg-gray-400 rounded-md h-4 w-5/6" />
        <div className="bg-gray-400 rounded-md h-4 w-4/6" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-400 px-4 py-3 flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="bg-gray-500 rounded h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3 border-t border-gray-400 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="bg-gray-400 rounded h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-300 rounded-lg p-4">
      <div className="bg-gray-400 rounded-md h-6 w-1/3 mb-4" />
      <div className="bg-gray-400 rounded-md h-64 w-full" />
    </div>
  </div>
);

export default Loading;