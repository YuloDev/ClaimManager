import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ 
  title, 
  value, 
  previousValue, 
  icon, 
  format = 'number',
  trend = 'neutral',
  className = '' 
}) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return `€${val?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    if (format === 'time') {
      return `${val} días`;
    }
    return val?.toLocaleString('es-ES');
  };

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return 0;
    return ((value - previousValue) / previousValue * 100)?.toFixed(1);
  };

  const change = calculateChange();
  const isPositive = change > 0;
  const isNegative = change < 0;

  const getTrendColor = () => {
    if (trend === 'positive' && isPositive) return 'text-success';
    if (trend === 'positive' && isNegative) return 'text-error';
    if (trend === 'negative' && isPositive) return 'text-error';
    if (trend === 'negative' && isNegative) return 'text-success';
    return 'text-text-secondary';
  };

  const getTrendIcon = () => {
    if (isPositive) return 'TrendingUp';
    if (isNegative) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-foreground">
          {formatValue(value)}
        </div>
        
        {previousValue && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              <Icon name={getTrendIcon()} size={14} />
              <span className="text-sm font-medium">
                {Math.abs(change)}%
              </span>
            </div>
            <span className="text-xs text-text-secondary">
              vs período anterior
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;