import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Ensure you have a utility for conditional classNames

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const sizeClasses = {
  small: 'w-6 h-6',
  medium: 'w-10 h-10',
  large: 'w-16 h-16',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-gray-500 dark:text-gray-400',
        fullScreen ? 'h-screen w-full' : 'py-6'
      )}
    >
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <p className="mt-2 text-sm font-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
