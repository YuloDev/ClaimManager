import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClaimOverview = ({ claim, userRole, onAction }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-error text-error-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'under_review':
        return 'bg-accent text-accent-foreground';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Claim Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                Reclamación #{claim?.claimNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim?.status)}`}>
                {claim?.status === 'approved' ? 'Aprobada' :
                 claim?.status === 'rejected' ? 'Rechazada' :
                 claim?.status === 'pending' ? 'Pendiente' :
                 claim?.status === 'under_review' ? 'En Revisión' :
                 claim?.status === 'draft' ? 'Borrador' : claim?.status}
              </span>
            </div>
            <p className="text-text-secondary">
              Enviada el {formatDate(claim?.submissionDate)}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {userRole === 'affiliate' && claim?.status === 'draft' && (
              <>
                <Button variant="outline" onClick={() => onAction('edit')}>
                  <Icon name="Edit" size={16} className="mr-2" />
                  Editar
                </Button>
                <Button variant="default" onClick={() => onAction('submit')}>
                  <Icon name="Send" size={16} className="mr-2" />
                  Enviar
                </Button>
              </>
            )}
            
            {userRole === 'affiliate' && ['pending', 'under_review']?.includes(claim?.status) && (
              <Button variant="outline" onClick={() => onAction('withdraw')}>
                <Icon name="X" size={16} className="mr-2" />
                Retirar
              </Button>
            )}
            
            {userRole === 'analyst' && claim?.status === 'pending' && (
              <>
                <Button variant="outline" onClick={() => onAction('request_info')}>
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Solicitar Info
                </Button>
                <Button variant="destructive" onClick={() => onAction('reject')}>
                  <Icon name="X" size={16} className="mr-2" />
                  Rechazar
                </Button>
                <Button variant="success" onClick={() => onAction('approve')}>
                  <Icon name="Check" size={16} className="mr-2" />
                  Aprobar
                </Button>
              </>
            )}
            
            <Button variant="ghost" onClick={() => onAction('print')}>
              <Icon name="Printer" size={16} className="mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>
      {/* Claim Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Monto Solicitado</p>
              <p className="text-xl font-semibold text-foreground">
                {formatCurrency(claim?.requestedAmount)}
              </p>
            </div>
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={20} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Monto Aprobado</p>
              <p className="text-xl font-semibold text-foreground">
                {claim?.approvedAmount ? formatCurrency(claim?.approvedAmount) : '--'}
              </p>
            </div>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={20} className="text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Documentos</p>
              <p className="text-xl font-semibold text-foreground">
                {claim?.documents?.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-secondary" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Días Transcurridos</p>
              <p className="text-xl font-semibold text-foreground">
                {Math.floor((new Date() - new Date(claim.submissionDate)) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-warning" />
            </div>
          </div>
        </div>
      </div>
      {/* Patient and Provider Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="User" size={20} className="mr-2" />
            Información del Reclamo
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Nombre:</span>
              <span className="text-foreground font-medium">{claim?.patient?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">DNI:</span>
              <span className="text-foreground font-medium">{claim?.patient?.dni}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Fecha de Nacimiento:</span>
              <span className="text-foreground font-medium">{formatDate(claim?.patient?.birthDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Póliza:</span>
              <span className="text-foreground font-medium">{claim?.patient?.policyNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Plan:</span>
              <span className="text-foreground font-medium">{claim?.patient?.plan}</span>
            </div>
          </div>
        </div>

        {/* Provider Information */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Building" size={20} className="mr-2" />
            Información del Proveedor
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Centro Médico:</span>
              <span className="text-foreground font-medium">{claim?.provider?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">CIF:</span>
              <span className="text-foreground font-medium">{claim?.provider?.cif}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Especialidad:</span>
              <span className="text-foreground font-medium">{claim?.provider?.specialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Fecha de Servicio:</span>
              <span className="text-foreground font-medium">{formatDate(claim?.serviceDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Código ICD-10:</span>
              <span className="text-foreground font-medium">{claim?.icd10Code}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Claim Description */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="FileText" size={20} className="mr-2" />
          Descripción de la Reclamación
        </h3>
        <p className="text-foreground leading-relaxed">
          {claim?.description}
        </p>
      </div>
    </div>
  );
};

export default ClaimOverview;