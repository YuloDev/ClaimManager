import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  closable = true,
  className = '' 
}) => {
  const alertStyles = {
    success: {
      container: 'bg-green-50 border border-green-200 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-400'
    },
    error: {
      container: 'bg-red-50 border border-red-200 text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-400'
    },
    warning: {
      container: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400'
    },
    info: {
      container: 'bg-blue-50 border border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-400'
    }
  };

  const style = alertStyles?.[type];
  const IconComponent = style?.icon;

  return (
    <div className={`rounded-lg p-4 ${style?.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${style?.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          {message && (
            <p className={`text-sm ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          )}
        </div>
        {closable && onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-opacity-20 hover:bg-gray-600 ${style?.iconColor}`}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;