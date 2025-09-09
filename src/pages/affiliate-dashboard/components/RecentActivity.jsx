import React from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = ({ activities = [], className = '' }) => {
  const getActivityIcon = (type) => {
    const icons = {
      claim_submitted: 'FileText',
      document_uploaded: 'Upload',
      status_changed: 'RefreshCw',
      payment_processed: 'CreditCard',
      comment_added: 'MessageCircle',
      validation_completed: 'CheckCircle'
    };
    return icons?.[type] || 'Bell';
  };

  const getActivityColor = (type) => {
    const colors = {
      claim_submitted: 'text-accent',
      document_uploaded: 'text-warning',
      status_changed: 'text-primary',
      payment_processed: 'text-success',
      comment_added: 'text-secondary',
      validation_completed: 'text-success'
    };
    return colors?.[type] || 'text-text-secondary';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diff = now - activityTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    
    return activityTime?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Actividad Reciente</h3>
      </div>
      <div className="p-6">
        {activities?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">Sin actividad reciente</h4>
            <p className="text-text-secondary">
              La actividad de tus reclamos aparecerá aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity) => (
              <div key={activity?.id} className="flex items-start space-x-3">
                <div className={`mt-1 ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity?.title}</span>
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {activity?.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-text-secondary">
                      {formatTimestamp(activity?.timestamp)}
                    </span>
                    {activity?.claimId && (
                      <>
                        <span className="text-xs text-text-secondary">•</span>
                        <span className="text-xs text-accent font-medium">
                          {activity?.claimId}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {activities?.length > 0 && (
        <div className="px-6 py-4 border-t border-border">
          <button className="text-sm text-accent hover:text-accent/80 font-medium transition-colors">
            Ver toda la actividad
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;