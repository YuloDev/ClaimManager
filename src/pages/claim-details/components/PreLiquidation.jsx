import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PreLiquidation = ({ liquidationData, onRecalculate, onApprove }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100)?.toFixed(1)}%`;
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
      case 'calculated':
        return 'text-accent bg-accent/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
        return 'Pendiente';
      case 'calculated':
        return 'Calculado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Liquidation Summary */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Icon name="Calculator" size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Pre-liquidación Automática
              </h3>
              <p className="text-text-secondary">
                Cálculo basado en reglas de cobertura y plan del asegurado
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liquidationData?.status)}`}>
              {getStatusText(liquidationData?.status)}
            </span>
            <Button variant="outline" size="sm" onClick={onRecalculate}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Recalcular
            </Button>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(liquidationData?.requestedAmount)}
            </div>
            <div className="text-sm text-text-secondary">Monto Solicitado</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(liquidationData?.eligibleAmount)}
            </div>
            <div className="text-sm text-text-secondary">Monto Elegible</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(liquidationData?.deductions)}
            </div>
            <div className="text-sm text-text-secondary">Deducciones</div>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(liquidationData?.finalAmount)}
            </div>
            <div className="text-sm text-success">Monto Final</div>
          </div>
        </div>

        {/* Coverage Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Información de Cobertura
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Plan:</span>
                <span className="text-foreground font-medium">{liquidationData?.plan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Cobertura:</span>
                <span className="text-foreground font-medium">{formatPercentage(liquidationData?.plan?.coverage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Deducible anual:</span>
                <span className="text-foreground font-medium">{formatCurrency(liquidationData?.plan?.deductible)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Límite anual:</span>
                <span className="text-foreground font-medium">{formatCurrency(liquidationData?.plan?.annualLimit)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Estado del Asegurado
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Deducible utilizado:</span>
                <span className="text-foreground font-medium">{formatCurrency(liquidationData?.usedDeductible)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Límite utilizado:</span>
                <span className="text-foreground font-medium">{formatCurrency(liquidationData?.usedLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Límite restante:</span>
                <span className="text-foreground font-medium">{formatCurrency(liquidationData?.remainingLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Período de espera:</span>
                <span className="text-foreground font-medium">
                  {liquidationData?.waitingPeriod ? `${liquidationData?.waitingPeriod} días` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Calculation Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-foreground">
          Desglose del Cálculo
        </h4>

        {/* Coverage Rules Applied */}
        <div className="bg-card rounded-lg border border-border">
          <div 
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('coverage')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Shield" size={20} className="text-accent" />
                <div>
                  <h5 className="font-medium text-foreground">Reglas de Cobertura</h5>
                  <p className="text-sm text-text-secondary">
                    {liquidationData?.coverageRules?.length} reglas aplicadas
                  </p>
                </div>
              </div>
              <Icon 
                name={expandedSections?.coverage ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-text-secondary" 
              />
            </div>
          </div>

          {expandedSections?.coverage && (
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4 space-y-3">
                {liquidationData?.coverageRules?.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Icon 
                      name={rule?.applied ? "CheckCircle" : "XCircle"} 
                      size={16} 
                      className={rule?.applied ? "text-success" : "text-error"} 
                    />
                    <div className="flex-1">
                      <h6 className="text-sm font-medium text-foreground">{rule?.name}</h6>
                      <p className="text-sm text-text-secondary">{rule?.description}</p>
                      {rule?.impact && (
                        <p className="text-sm text-accent mt-1">
                          Impacto: {rule?.impact}
                        </p>
                      )}
                    </div>
                    {rule?.amount && (
                      <div className="text-sm font-medium text-foreground">
                        {formatCurrency(rule?.amount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deductions */}
        <div className="bg-card rounded-lg border border-border">
          <div 
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleSection('deductions')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Minus" size={20} className="text-warning" />
                <div>
                  <h5 className="font-medium text-foreground">Deducciones</h5>
                  <p className="text-sm text-text-secondary">
                    Total: {formatCurrency(liquidationData?.deductions)}
                  </p>
                </div>
              </div>
              <Icon 
                name={expandedSections?.deductions ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-text-secondary" 
              />
            </div>
          </div>

          {expandedSections?.deductions && (
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4 space-y-3">
                {liquidationData?.deductionBreakdown?.map((deduction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="AlertTriangle" size={16} className="text-warning" />
                      <div>
                        <h6 className="text-sm font-medium text-foreground">{deduction?.type}</h6>
                        <p className="text-sm text-text-secondary">{deduction?.description}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-warning">
                      -{formatCurrency(deduction?.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Exclusions */}
        {liquidationData?.exclusions && liquidationData?.exclusions?.length > 0 && (
          <div className="bg-card rounded-lg border border-border">
            <div 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection('exclusions')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon name="X" size={20} className="text-error" />
                  <div>
                    <h5 className="font-medium text-foreground">Exclusiones</h5>
                    <p className="text-sm text-text-secondary">
                      {liquidationData?.exclusions?.length} exclusiones identificadas
                    </p>
                  </div>
                </div>
                <Icon 
                  name={expandedSections?.exclusions ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-text-secondary" 
                />
              </div>
            </div>

            {expandedSections?.exclusions && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="pt-4 space-y-3">
                  {liquidationData?.exclusions?.map((exclusion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-error/5 rounded-lg">
                      <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
                      <div className="flex-1">
                        <h6 className="text-sm font-medium text-foreground">{exclusion?.type}</h6>
                        <p className="text-sm text-text-secondary">{exclusion?.description}</p>
                        <p className="text-sm text-error mt-1">
                          Razón: {exclusion?.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Calculation History */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">
          Historial de Cálculos
        </h4>
        <div className="space-y-2">
          {liquidationData?.calculationHistory?.map((calc, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={14} className="text-text-secondary" />
                <span className="text-text-secondary">
                  {formatDate(calc?.timestamp)}
                </span>
                <span className="text-foreground">
                  por {calc?.user}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-foreground font-medium">
                  {formatCurrency(calc?.amount)}
                </span>
                {calc?.reason && (
                  <span className="text-text-secondary">
                    ({calc?.reason})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      {liquidationData?.status === 'calculated' && (
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-border">
          <Button variant="outline">
            <Icon name="MessageCircle" size={16} className="mr-2" />
            Solicitar Revisión
          </Button>
          <Button variant="destructive">
            <Icon name="X" size={16} className="mr-2" />
            Rechazar
          </Button>
          <Button variant="success" onClick={onApprove}>
            <Icon name="Check" size={16} className="mr-2" />
            Aprobar Liquidación
          </Button>
        </div>
      )}
    </div>
  );
};

export default PreLiquidation;