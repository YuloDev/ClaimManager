import React from 'react';
import Modal from './Modal';
import Icon from '../AppIcon';

const ResponseModal = ({ isOpen, onClose, responseData, fullResponseData }) => {
  console.log('ResponseModal renderizado - isOpen:', isOpen, 'responseData:', responseData);
  
  if (!responseData) {
    console.log('No hay responseData, no renderizando modal');
    return null;
  }

  // Determinar el estado basado en la respuesta del N8N
  const determineStatus = (data) => {
    // La nueva estructura tiene: { response: { totalReimbursement: ..., justification: ... } }
    const response = data.response;
    
    if (!response) return { status: 'unknown', message: 'Sin información' };
    
    // Determinar estado basado en el totalReimbursement
    const totalReimbursement = response.totalReimbursement || 0;
    const justification = response.justification || '';
    
    if (totalReimbursement > 0) {
      return { 
        status: 'approved', 
        message: `Reembolso aprobado por ${totalReimbursement}. ${justification}` 
      };
    } else {
      return { 
        status: 'rejected', 
        message: `Reembolso rechazado. ${justification}` 
      };
    }
  };

  const statusInfo = determineStatus(responseData);

  const getStatusIcon = () => {
    switch (statusInfo.status) {
      case 'approved':
        return <Icon name="CheckCircle" size={24} className="text-success" />;
      case 'rejected':
        return <Icon name="XCircle" size={24} className="text-error" />;
      case 'review':
        return <Icon name="Clock" size={24} className="text-warning" />;
      default:
        return <Icon name="HelpCircle" size={24} className="text-text-secondary" />;
    }
  };

  const getStatusColor = () => {
    switch (statusInfo.status) {
      case 'approved':
        return 'text-success';
      case 'rejected':
        return 'text-error';
      case 'review':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusText = () => {
    switch (statusInfo.status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'review':
        return 'En Revisión';
      default:
        return 'Estado Desconocido';
    }
  };

  const renderResponseDetails = () => {
    const response = responseData.response;
    
    if (!response) {
      return (
        <div className="p-3 bg-muted rounded border">
          <div className="text-sm text-foreground">Sin información disponible</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Información del paciente */}
        {response.patient && (
          <div className="p-3 bg-muted rounded border">
            <div className="text-sm font-medium text-text-secondary mb-2">Información del Paciente</div>
            <div className="text-sm text-foreground">
              <div><strong>Nombre:</strong> {response.patient.name}</div>
              <div><strong>Póliza:</strong> {response.patient.policyNumber}</div>
            </div>
          </div>
        )}

        {/* Diagnóstico */}
        {response.diagnosis && (
          <div className="p-3 bg-muted rounded border">
            <div className="text-sm font-medium text-text-secondary mb-2">Diagnóstico</div>
            <div className="text-sm text-foreground">
              <div><strong>Código:</strong> {response.diagnosis.code}</div>
              <div><strong>Descripción:</strong> {response.diagnosis.description}</div>
            </div>
          </div>
        )}

        {/* Ítems aprobados */}
        {response.approvedItems && response.approvedItems.length > 0 && (
          <div className="p-3 bg-muted rounded border">
            <div className="text-sm font-medium text-text-secondary mb-2">Ítems Aprobados</div>
            <div className="space-y-1">
              {response.approvedItems.map((item, index) => (
                <div key={index} className="text-sm text-foreground">
                  {item.item} (x{item.quantity}) - ${item.total}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Total */}
        {response.score_Total && (
          <div className="p-3 bg-muted rounded border">
            <div className="text-sm font-medium text-text-secondary mb-1">Score Total</div>
            <div className="text-sm text-foreground">{response.score_Total}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="space-y-6">
        {/* Status Header - Simplified */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            {getStatusIcon()}
          </div>
          <h3 className={`text-xl font-semibold ${getStatusColor()} mb-2`}>
            {getStatusText()}
          </h3>
          <p className="text-sm text-text-secondary">
            {statusInfo.message}
          </p>
        </div>

        {/* Key Information - Streamlined */}
        {responseData && responseData.response && (
          <div className="space-y-4">
            {responseData.response.patient && (
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Paciente</div>
                <div className="font-medium">
                  {responseData.response.patient.name}
                </div>
                <div className="text-sm text-text-secondary">
                  Póliza: {responseData.response.patient.policyNumber}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-center">
              {responseData.response.score_Total && (
                <div>
                  <div className="text-sm text-text-secondary mb-1">Score</div>
                  <div className="text-lg font-semibold">
                    {responseData.response.score_Total}
                  </div>
                </div>
              )}

              {responseData.response.totalReimbursement !== undefined && (
                <div>
                  <div className="text-sm text-text-secondary mb-1">Reembolso</div>
                  <div className="text-lg font-semibold">
                    ${responseData.response.totalReimbursement}
                  </div>
                </div>
              )}
            </div>

            {responseData.response.justification && (
              <div>
                <div className="text-sm text-text-secondary mb-2 text-center">Justificación</div>
                <div className="text-sm text-foreground leading-relaxed p-3 bg-gray-50 rounded-lg">
                  {responseData.response.justification}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detalles adicionales */}
        {renderResponseDetails()}

        {/* Action Button - Simplified */}
        <div className="flex justify-center pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResponseModal;
