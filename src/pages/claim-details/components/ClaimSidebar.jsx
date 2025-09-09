import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClaimSidebar = ({ claim, relatedClaims, onNotificationToggle, notifications }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })?.format(new Date(date));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-success bg-success/10';
      case 'rejected':
        return 'text-error bg-error/10';
      case 'pending':
        return 'text-warning bg-warning/10';
      case 'under_review':
        return 'text-accent bg-accent/10';
      case 'draft':
        return 'text-muted-foreground bg-muted/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'pending':
        return 'Pendiente';
      case 'under_review':
        return 'En Revisión';
      case 'draft':
        return 'Borrador';
      default:
        return status;
    }
  };

  const calculateDaysElapsed = (date) => {
    return Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Resumen Rápido
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Días transcurridos</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {calculateDaysElapsed(claim?.submissionDate)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Documentos</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {claim?.documents?.length}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="MessageCircle" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Comentarios</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {claim?.comments?.length || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Eye" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Vistas</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {claim?.viewCount || 0}
            </span>
          </div>
        </div>
      </div>
      {/* Notification Settings */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Configuración de Notificaciones
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Bell" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Cambios de estado</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNotificationToggle('status_changes')}
              className={notifications?.status_changes ? 'text-success' : 'text-text-secondary'}
            >
              <Icon name={notifications?.status_changes ? "Check" : "X"} size={16} />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="MessageCircle" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Nuevos comentarios</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNotificationToggle('new_comments')}
              className={notifications?.new_comments ? 'text-success' : 'text-text-secondary'}
            >
              <Icon name={notifications?.new_comments ? "Check" : "X"} size={16} />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Upload" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Documentos subidos</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNotificationToggle('document_uploads')}
              className={notifications?.document_uploads ? 'text-success' : 'text-text-secondary'}
            >
              <Icon name={notifications?.document_uploads ? "Check" : "X"} size={16} />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="CreditCard" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">Pagos procesados</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNotificationToggle('payment_updates')}
              className={notifications?.payment_updates ? 'text-success' : 'text-text-secondary'}
            >
              <Icon name={notifications?.payment_updates ? "Check" : "X"} size={16} />
            </Button>
          </div>
        </div>
      </div>
      {/* Related Claims */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">
            Reclamaciones Relacionadas
          </h3>
          <Button variant="ghost" size="sm">
            <Icon name="ExternalLink" size={14} />
          </Button>
        </div>
        
        {relatedClaims?.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="FileText" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-text-secondary">
              No hay reclamaciones relacionadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {relatedClaims?.slice(0, 3)?.map((relatedClaim) => (
              <div key={relatedClaim?.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">
                    #{relatedClaim?.claimNumber}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(relatedClaim?.status)}`}>
                    {getStatusText(relatedClaim?.status)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Monto:</span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(relatedClaim?.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Fecha:</span>
                    <span className="text-foreground">
                      {formatDate(relatedClaim?.date)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Proveedor:</span>
                    <span className="text-foreground truncate ml-2">
                      {relatedClaim?.provider}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {relatedClaims?.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full">
                Ver todas ({relatedClaims?.length - 3} más)
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Acciones Rápidas
        </h3>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Icon name="Download" size={16} className="mr-2" />
            Descargar PDF
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Icon name="Share" size={16} className="mr-2" />
            Compartir Enlace
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Icon name="Copy" size={16} className="mr-2" />
            Duplicar Reclamación
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Icon name="Archive" size={16} className="mr-2" />
            Archivar
          </Button>
        </div>
      </div>
      {/* Contact Support */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon name="HelpCircle" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-xs text-text-secondary">
              Contacta con nuestro equipo de soporte
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            <Icon name="MessageCircle" size={16} className="mr-2" />
            Chat en Vivo
          </Button>
          <Button variant="ghost" size="sm" className="w-full">
            <Icon name="Mail" size={16} className="mr-2" />
            Enviar Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimSidebar;