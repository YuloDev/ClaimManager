import React from 'react';

const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses?.[size]} ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 border-2 border-secondary/20 rounded-full"></div>
        
        {/* Spinning segment */}
        <div className="absolute inset-0 border-2 border-transparent border-t-secondary rounded-full animate-spin"></div>
        
        {/* Inner dot */}
        <div className="absolute inset-2 bg-secondary rounded-full opacity-60 animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;