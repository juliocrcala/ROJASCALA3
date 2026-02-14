import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>

          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-bold text-blue-600 animate-pulse" style={{ fontSize: size === 'large' ? '1.5rem' : size === 'medium' ? '1rem' : '0.75rem' }}>
              RC
            </div>
          </div>
        </div>
      </div>

      <p className={`mt-4 text-gray-600 font-medium ${textSizeClasses[size]} animate-pulse`}>
        {message}
      </p>
    </div>
  );
};

export const LoadingDots: React.FC<{ message?: string }> = ({ message = 'Cargando' }) => {
  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <span className="text-gray-600 font-medium">{message}</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export const LoadingBar: React.FC<{ message?: string }> = ({ message = 'Cargando contenido...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-600 to-green-600 animate-loading-bar"></div>
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};
