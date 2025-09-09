import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ValidationResults = ({ validationData, onRevalidate, onOverride }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const getValidationIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'CheckCircle';
      case 'failed':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'pending':
        return 'Clock';
      default:
        return 'HelpCircle';
    }
  };

  const getValidationColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'text-success';
      case 'failed':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'pending':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed':
        return 'Aprobado';
      case 'failed':
        return 'Fallido';
      case 'warning':
        return 'Advertencia';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(new Date(date));
  };

  const getOverallStatus = () => {
    const statuses = validationData?.checks?.map(check => check?.status);
    if (statuses?.includes('failed')) return 'failed';
    if (statuses?.includes('warning')) return 'warning';
    if (statuses?.includes('pending')) return 'pending';
    return 'passed';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              overallStatus === 'passed' ? 'bg-success/10' :
              overallStatus === 'failed' ? 'bg-error/10' :
              overallStatus === 'warning' ? 'bg-warning/10' : 'bg-accent/10'
            }`}>
              <Icon 
                name={getValidationIcon(overallStatus)} 
                size={24} 
                className={getValidationColor(overallStatus)} 
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Resultados de Validación IA
              </h3>
              <p className="text-text-secondary">
                Estado general: <span className={`font-medium ${getValidationColor(overallStatus)}`}>
                  {getStatusText(overallStatus)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onRevalidate}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Revalidar
            </Button>
            {overallStatus === 'failed' && (
              <Button variant="destructive" size="sm" onClick={onOverride}>
                <Icon name="AlertTriangle" size={16} className="mr-2" />
                Anular Validación
              </Button>
            )}
          </div>
        </div>

        {/* Validation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-success">
              {validationData?.checks?.filter(c => c?.status === 'passed')?.length}
            </div>
            <div className="text-sm text-text-secondary">Aprobados</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-warning">
              {validationData?.checks?.filter(c => c?.status === 'warning')?.length}
            </div>
            <div className="text-sm text-text-secondary">Advertencias</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-error">
              {validationData?.checks?.filter(c => c?.status === 'failed')?.length}
            </div>
            <div className="text-sm text-text-secondary">Fallidos</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-accent">
              {(validationData?.overallConfidence * 100)?.toFixed(1)}%
            </div>
            <div className="text-sm text-text-secondary">Confianza</div>
          </div>
        </div>

        {/* Last Validation Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Última validación: {formatDate(validationData?.lastValidated)}
            </span>
            <span className="text-text-secondary">
              Modelo: {validationData?.aiModel} v{validationData?.modelVersion}
            </span>
          </div>
        </div>
      </div>
      {/* Detailed Validation Results */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">
          Resultados Detallados
        </h4>

        {validationData?.checks?.map((check, index) => (
          <div key={index} className="bg-card rounded-lg border border-border">
            <div 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={getValidationIcon(check?.status)} 
                    size={20} 
                    className={getValidationColor(check?.status)} 
                  />
                  <div>
                    <h5 className="font-medium text-foreground">{check?.name}</h5>
                    <p className="text-sm text-text-secondary">{check?.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    check?.status === 'passed' ? 'bg-success/10 text-success' :
                    check?.status === 'failed' ? 'bg-error/10 text-error' :
                    check?.status === 'warning' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'
                  }`}>
                    {getStatusText(check?.status)}
                  </span>
                  <Icon 
                    name={expandedSections?.[index] ? "ChevronUp" : "ChevronDown"} 
                    size={16} 
                    className="text-text-secondary" 
                  />
                </div>
              </div>
            </div>

            {expandedSections?.[index] && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="pt-4 space-y-4">
                  {/* Check Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-sm font-medium text-foreground mb-2">
                        Información de la Validación
                      </h6>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Confianza:</span>
                          <span className="text-foreground font-medium">
                            {(check?.confidence * 100)?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Tiempo de procesamiento:</span>
                          <span className="text-foreground font-medium">
                            {check?.processingTime}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Documento:</span>
                          <span className="text-foreground font-medium">
                            {check?.documentName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-sm font-medium text-foreground mb-2">
                        Datos Extraídos
                      </h6>
                      <div className="space-y-2 text-sm">
                        {Object.entries(check?.extractedData || {})?.map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-text-secondary capitalize">
                              {key?.replace('_', ' ')}:
                            </span>
                            <span className="text-foreground font-medium">
                              {typeof value === 'object' ? JSON.stringify(value) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Issues and Recommendations */}
                  {check?.issues && check?.issues?.length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-foreground mb-2">
                        Problemas Detectados
                      </h6>
                      <div className="space-y-2">
                        {check?.issues?.map((issue, issueIndex) => (
                          <div key={issueIndex} className="flex items-start space-x-2 p-3 bg-error/5 rounded-lg">
                            <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm text-foreground font-medium">
                                {issue?.title}
                              </p>
                              <p className="text-sm text-text-secondary">
                                {issue?.description}
                              </p>
                              {issue?.recommendation && (
                                <p className="text-sm text-accent mt-1">
                                  Recomendación: {issue?.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Rules Applied */}
                  {check?.rulesApplied && check?.rulesApplied?.length > 0 && (
                    <div>
                      <h6 className="text-sm font-medium text-foreground mb-2">
                        Reglas Aplicadas
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {check?.rulesApplied?.map((rule, ruleIndex) => (
                          <span key={ruleIndex} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* AI Model Information */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">
          Información del Modelo IA
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Modelo:</span>
            <span className="text-foreground font-medium ml-2">
              {validationData?.aiModel}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Versión:</span>
            <span className="text-foreground font-medium ml-2">
              {validationData?.modelVersion}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">Última actualización:</span>
            <span className="text-foreground font-medium ml-2">
              {formatDate(validationData?.modelLastUpdated)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationResults;