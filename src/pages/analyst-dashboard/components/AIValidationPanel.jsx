import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIValidationPanel = ({ validationResults, onValidationAction }) => {
  const [expandedSections, setExpandedSections] = useState({
    issues: true,
    calculations: false,
    recommendations: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const getIssueIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return { icon: 'XCircle', color: 'text-error' };
      case 'warning':
        return { icon: 'AlertTriangle', color: 'text-warning' };
      case 'info':
        return { icon: 'Info', color: 'text-accent' };
      default:
        return { icon: 'AlertCircle', color: 'text-text-secondary' };
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-error/10 text-error border-error/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'info':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Validación IA</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              validationResults?.overallScore >= 90 ? 'bg-success/10 text-success' :
              validationResults?.overallScore >= 70 ? 'bg-warning/10 text-warning': 'bg-error/10 text-error'
            }`}>
              Score: {validationResults?.overallScore}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onValidationAction('rerun')}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Re-validar
            </Button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {/* Issues Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('issues')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Icon 
                name={expandedSections?.issues ? 'ChevronDown' : 'ChevronRight'} 
                size={16} 
                className="text-text-secondary" 
              />
              <h4 className="font-medium text-foreground">
                Problemas Detectados ({validationResults?.issues?.length})
              </h4>
            </div>
            {validationResults?.issues?.filter(issue => issue?.severity === 'critical')?.length > 0 && (
              <span className="px-2 py-1 bg-error/10 text-error text-xs rounded-md">
                {validationResults?.issues?.filter(issue => issue?.severity === 'critical')?.length} Críticos
              </span>
            )}
          </button>

          {expandedSections?.issues && (
            <div className="mt-4 space-y-3">
              {validationResults?.issues?.map((issue, index) => {
                const { icon, color } = getIssueIcon(issue?.severity);
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <Icon name={icon} size={20} className={color} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getSeverityBadge(issue?.severity)}`}>
                          {issue?.severity?.toUpperCase()}
                        </span>
                        <span className="text-sm text-text-secondary">{issue?.field}</span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{issue?.description}</p>
                      {issue?.suggestion && (
                        <p className="text-sm text-accent">
                          <Icon name="Lightbulb" size={14} className="inline mr-1" />
                          {issue?.suggestion}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onValidationAction('resolve', issue)}
                      iconName="Check"
                    >
                      Resolver
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pre-liquidation Calculations */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('calculations')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Icon 
                name={expandedSections?.calculations ? 'ChevronDown' : 'ChevronRight'} 
                size={16} 
                className="text-text-secondary" 
              />
              <h4 className="font-medium text-foreground">Cálculos de Pre-liquidación</h4>
            </div>
            <span className="text-sm font-medium text-success">
              €{validationResults?.calculations?.approvedAmount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </span>
          </button>

          {expandedSections?.calculations && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-text-secondary">Monto Solicitado</p>
                  <p className="text-lg font-semibold text-foreground">
                    €{validationResults?.calculations?.requestedAmount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-sm text-success">Monto Aprobado</p>
                  <p className="text-lg font-semibold text-success">
                    €{validationResults?.calculations?.approvedAmount?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-foreground">Desglose de Cálculos:</h5>
                {validationResults?.calculations?.breakdown?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-foreground">{item?.description}</span>
                      {item?.rule && (
                        <span className="text-xs text-text-secondary bg-muted px-2 py-1 rounded">
                          {item?.rule}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      item?.type === 'deduction' ? 'text-error' : 'text-success'
                    }`}>
                      {item?.type === 'deduction' ? '-' : '+'}€{Math.abs(item?.amount)?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('recommendations')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Icon 
                name={expandedSections?.recommendations ? 'ChevronDown' : 'ChevronRight'} 
                size={16} 
                className="text-text-secondary" 
              />
              <h4 className="font-medium text-foreground">
                Recomendaciones IA ({validationResults?.recommendations?.length})
              </h4>
            </div>
          </button>

          {expandedSections?.recommendations && (
            <div className="mt-4 space-y-3">
              {validationResults?.recommendations?.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <Icon name="Lightbulb" size={20} className="text-accent mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground mb-1">{recommendation?.title}</p>
                    <p className="text-sm text-text-secondary">{recommendation?.description}</p>
                    {recommendation?.confidence && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-text-secondary">Confianza:</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent transition-all duration-300"
                            style={{ width: `${recommendation?.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-accent">{recommendation?.confidence}%</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onValidationAction('apply', recommendation)}
                  >
                    Aplicar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIValidationPanel;