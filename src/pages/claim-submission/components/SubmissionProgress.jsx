import React from 'react';
import Icon from '../../../components/AppIcon';

const SubmissionProgress = ({ currentStep = 1, totalSteps = 4 }) => {
  const steps = [
    { id: 1, label: 'Información del Paciente', icon: 'User' },
    { id: 2, label: 'Detalles del Proveedor', icon: 'Building2' },
    { id: 3, label: 'Diagnóstico', icon: 'Stethoscope' },
    { id: 4, label: 'Documentos', icon: 'Upload' }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getStepClasses = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground border-success';
      case 'current':
        return 'bg-primary text-primary-foreground border-primary';
      default:
        return 'bg-muted text-text-secondary border-border';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Progreso de Envío</h3>
        <span className="text-sm text-text-secondary">
          Paso {currentStep} de {totalSteps}
        </span>
      </div>
      <div className="space-y-4">
        {steps?.map((step, index) => {
          const status = getStepStatus(step?.id);
          const isLast = index === steps?.length - 1;

          return (
            <div key={step?.id} className="relative">
              <div className="flex items-center space-x-4">
                {/* Step Icon */}
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${getStepClasses(status)}`}>
                  {status === 'completed' ? (
                    <Icon name="Check" size={20} />
                  ) : (
                    <Icon name={step?.icon} size={20} />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <p className={`font-medium ${
                    status === 'current' ? 'text-primary' : 
                    status === 'completed' ? 'text-success' : 'text-text-secondary'
                  }`}>
                    {step?.label}
                  </p>
                  {status === 'current' && (
                    <p className="text-sm text-text-secondary">En progreso...</p>
                  )}
                  {status === 'completed' && (
                    <p className="text-sm text-success">Completado</p>
                  )}
                </div>

                {/* Status Indicator */}
                {status === 'current' && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              {/* Connector Line */}
              {!isLast && (
                <div className={`ml-5 w-0.5 h-6 ${
                  status === 'completed' ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      {/* Progress Bar */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
          <span>Progreso general</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SubmissionProgress;