import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import BreadcrumbNavigation from '../../../components/ui/BreadcrumbNavigation';

const ValidationHeader = ({ 
  claimData = null,
  onBackToQueue,
  className = '' 
}) => {
  const mockClaimData = {
    id: "CLM-2024-0156",
    patientName: "María González Rodríguez",
    submissionDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    amount: "85.00",
    currency: "EUR",
    status: "pending_validation",
    priority: "normal",
    assignedAnalyst: "Ana Martín López"
  };

  const claim = claimData || mockClaimData;

  const customBreadcrumbs = [
    { label: 'Dashboard', path: '/analyst-dashboard', isActive: false },
    { label: 'Cola de Validación', path: '/analyst-dashboard', isActive: false },
    { label: `Validación ${claim?.id}`, path: '/document-validation', isActive: true }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_validation':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'in_review':
        return 'text-accent bg-accent/10 border-accent/20';
      case 'approved':
        return 'text-success bg-success/10 border-success/20';
      case 'rejected':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-text-secondary bg-muted border-border';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_validation':
        return 'Pendiente de Validación';
      case 'in_review':
        return 'En Revisión';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      default:
        return 'text-accent bg-accent/10';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      default:
        return 'Normal';
    }
  };

  return (
    <div className={`bg-card border-b border-border ${className}`}>
      <div className="p-6">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation customBreadcrumbs={customBreadcrumbs} className="mb-4" />

        {/* Header Content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onBackToQueue}
              className="flex-shrink-0"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Validación de Documentos
                </h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(claim?.status)}`}>
                  {getStatusText(claim?.status)}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Icon name="FileText" size={16} />
                  <span>Reclamación: <strong className="text-foreground">{claim?.id}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="User" size={16} />
                  <span>Paciente: <strong className="text-foreground">{claim?.patientName}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={16} />
                  <span>Enviado: <strong className="text-foreground">
                    {claim?.submissionDate?.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Euro" size={16} />
                  <span>Monto: <strong className="text-foreground">{claim?.amount} {claim?.currency}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Priority Badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(claim?.priority)}`}>
              <div className="flex items-center space-x-1">
                <Icon name="Flag" size={14} />
                <span>Prioridad {getPriorityText(claim?.priority)}</span>
              </div>
            </div>

            {/* Assigned Analyst */}
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="UserCheck" size={16} />
              <span>Asignado a: <strong className="text-foreground">{claim?.assignedAnalyst}</strong></span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                iconName="MessageSquare"
                iconPosition="left"
              >
                Comentarios
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="History"
                iconPosition="left"
              >
                Historial
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progreso de Validación</span>
            <span className="text-sm text-text-secondary">Paso 2 de 4</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-secondary">
            <span>Recibido</span>
            <span className="text-primary font-medium">Validando</span>
            <span>Revisión</span>
            <span>Completado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationHeader;