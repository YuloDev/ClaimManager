import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ title, value, subtitle, trend, trendValue, icon, color = 'primary' }) => {
  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-text-secondary';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${getColorClasses(color)}`}>
              <Icon name={icon} size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            </div>
          </div>
          
          {subtitle && (
            <p className="text-sm text-text-secondary mb-2">{subtitle}</p>
          )}
          
          {trend && trendValue && (
            <div className="flex items-center space-x-2">
              <Icon 
                name={getTrendIcon(trend)} 
                size={16} 
                className={getTrendColor(trend)} 
              />
              <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {trendValue}
              </span>
              <span className="text-sm text-text-secondary">vs último mes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;