import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ValidationPanel = ({ 
  extractedData = null,
  onValidationComplete,
  className = '' 
}) => {
  const [validationStatus, setValidationStatus] = useState({});
  const [comments, setComments] = useState({});
  const [editedValues, setEditedValues] = useState({});

  const mockExtractedData = {
    patientInfo: {
      name: "María González Rodríguez",
      id: "12345678A",
      birthDate: "15/03/1985",
      phone: "+34 666 123 456",
      confidence: 0.95
    },
    providerInfo: {
      name: "Centro Médico San Rafael",
      nif: "B12345678",
      address: "Calle Mayor 123, 28001 Madrid",
      phone: "+34 91 123 4567",
      confidence: 0.92
    },
    serviceDetails: {
      date: "20/08/2024",
      code: "99213",
      description: "Consulta médica especializada",
      amount: "85.00",
      currency: "EUR",
      confidence: 0.88
    },
    diagnosis: {
      code: "M79.3",
      description: "Panniculitis, no especificada",
      confidence: 0.91
    },
    coverage: {
      planType: "Premium",
      copayment: "15.00",
      coverage: "70%",
      maxAmount: "500.00",
      confidence: 0.94
    }
  };

  const data = extractedData || mockExtractedData;

  const validationOptions = [
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' },
    { value: 'needs_review', label: 'Requiere Revisión' }
  ];

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-success bg-success/10';
    if (confidence >= 0.7) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.9) return 'CheckCircle';
    if (confidence >= 0.7) return 'AlertTriangle';
    return 'XCircle';
  };

  const handleFieldValidation = (field, status) => {
    setValidationStatus(prev => ({
      ...prev,
      [field]: status
    }));
  };

  const handleFieldEdit = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCommentChange = (field, comment) => {
    setComments(prev => ({
      ...prev,
      [field]: comment
    }));
  };

  const renderValidationField = (label, value, confidence, field, editable = true) => {
    const currentValue = editedValues?.[field] || value;
    const status = validationStatus?.[field];

    return (
      <div className="p-4 border border-border rounded-lg bg-background">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-foreground">{label}</h4>
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getConfidenceColor(confidence)}`}>
              <Icon name={getConfidenceIcon(confidence)} size={12} />
              <span>{Math.round(confidence * 100)}%</span>
            </div>
          </div>
          <Select
            options={validationOptions}
            value={status}
            onChange={(value) => handleFieldValidation(field, value)}
            placeholder="Validar"
            className="w-40"
          />
        </div>
        {editable ? (
          <Input
            value={currentValue}
            onChange={(e) => handleFieldEdit(field, e?.target?.value)}
            className="mb-3"
          />
        ) : (
          <div className="p-3 bg-muted rounded-md mb-3">
            <span className="text-foreground">{currentValue}</span>
          </div>
        )}
        {status && status !== 'approved' && (
          <Input
            label="Comentario"
            placeholder="Añadir comentario sobre esta validación..."
            value={comments?.[field] || ''}
            onChange={(e) => handleCommentChange(field, e?.target?.value)}
            className="mt-2"
          />
        )}
      </div>
    );
  };

  const consistencyChecks = [
    {
      id: 1,
      type: 'warning',
      title: 'Fecha de servicio reciente',
      description: 'El servicio fue realizado hace menos de 24 horas',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Proveedor verificado',
      description: 'El centro médico está registrado y verificado en el sistema',
      severity: 'low'
    },
    {
      id: 3,
      type: 'error',
      title: 'Monto inusual',
      description: 'El monto supera el promedio para este tipo de servicio',
      severity: 'high'
    }
  ];

  const getCheckIcon = (type) => {
    switch (type) {
      case 'error': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      default: return 'Info';
    }
  };

  const getCheckColor = (type) => {
    switch (type) {
      case 'error': return 'text-error bg-error/10';
      case 'warning': return 'text-warning bg-warning/10';
      default: return 'text-accent bg-accent/10';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Extraction Results Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Resultados de Extracción IA</h2>
          <div className="flex items-center space-x-2">
            <Icon name="Zap" size={20} className="text-secondary" />
            <span className="text-sm text-text-secondary">Procesado automáticamente</span>
          </div>
        </div>

        {/* Overall Confidence */}
        <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={20} className="text-primary" />
            <span className="font-medium text-foreground">Confianza General:</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-border rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-300"
                style={{ width: '92%' }}
              ></div>
            </div>
            <span className="text-sm font-medium text-success">92%</span>
          </div>
        </div>
      </div>
      {/* Patient Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="User" size={20} />
          <span>Información del Paciente</span>
        </h3>
        <div className="space-y-4">
          {renderValidationField('Nombre Completo', data?.patientInfo?.name, data?.patientInfo?.confidence, 'patient_name')}
          {renderValidationField('Documento de Identidad', data?.patientInfo?.id, data?.patientInfo?.confidence, 'patient_id')}
          {renderValidationField('Fecha de Nacimiento', data?.patientInfo?.birthDate, data?.patientInfo?.confidence, 'patient_birth')}
          {renderValidationField('Teléfono', data?.patientInfo?.phone, data?.patientInfo?.confidence, 'patient_phone')}
        </div>
      </div>
      {/* Provider Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Building2" size={20} />
          <span>Información del Proveedor</span>
        </h3>
        <div className="space-y-4">
          {renderValidationField('Nombre del Centro', data?.providerInfo?.name, data?.providerInfo?.confidence, 'provider_name')}
          {renderValidationField('NIF/CIF', data?.providerInfo?.nif, data?.providerInfo?.confidence, 'provider_nif')}
          {renderValidationField('Dirección', data?.providerInfo?.address, data?.providerInfo?.confidence, 'provider_address')}
          {renderValidationField('Teléfono', data?.providerInfo?.phone, data?.providerInfo?.confidence, 'provider_phone')}
        </div>
      </div>
      {/* Service Details */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="FileText" size={20} />
          <span>Detalles del Servicio</span>
        </h3>
        <div className="space-y-4">
          {renderValidationField('Fecha de Servicio', data?.serviceDetails?.date, data?.serviceDetails?.confidence, 'service_date')}
          {renderValidationField('Código de Servicio', data?.serviceDetails?.code, data?.serviceDetails?.confidence, 'service_code')}
          {renderValidationField('Descripción', data?.serviceDetails?.description, data?.serviceDetails?.confidence, 'service_description')}
          {renderValidationField('Monto', `${data?.serviceDetails?.amount} ${data?.serviceDetails?.currency}`, data?.serviceDetails?.confidence, 'service_amount')}
        </div>
      </div>
      {/* Coverage Analysis */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Shield" size={20} />
          <span>Análisis de Cobertura</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Tipo de Plan</span>
              <span className="font-medium text-foreground">{data?.coverage?.planType}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Copago</span>
              <span className="font-medium text-foreground">{data?.coverage?.copayment} EUR</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Cobertura</span>
              <span className="font-medium text-success">{data?.coverage?.coverage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Monto Máximo</span>
              <span className="font-medium text-foreground">{data?.coverage?.maxAmount} EUR</span>
            </div>
          </div>
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <h4 className="font-medium text-success mb-2">Cálculo de Reembolso</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monto del Servicio:</span>
                <span>85.00 EUR</span>
              </div>
              <div className="flex justify-between">
                <span>Copago:</span>
                <span>-15.00 EUR</span>
              </div>
              <div className="flex justify-between">
                <span>Cobertura (70%):</span>
                <span>49.00 EUR</span>
              </div>
              <div className="border-t border-success/20 pt-2 flex justify-between font-medium">
                <span>Total a Reembolsar:</span>
                <span className="text-success">49.00 EUR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Consistency Checks */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Search" size={20} />
          <span>Verificaciones de Consistencia</span>
        </h3>
        <div className="space-y-3">
          {consistencyChecks?.map((check) => (
            <div key={check?.id} className={`p-4 rounded-lg border ${getCheckColor(check?.type)}`}>
              <div className="flex items-start space-x-3">
                <Icon name={getCheckIcon(check?.type)} size={20} />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{check?.title}</h4>
                  <p className="text-sm opacity-80">{check?.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  check?.severity === 'high' ? 'bg-error text-error-foreground' :
                  check?.severity === 'medium' ? 'bg-warning text-warning-foreground' :
                  'bg-accent text-accent-foreground'
                }`}>
                  {check?.severity === 'high' ? 'Alta' : check?.severity === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Acciones de Validación</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="success"
            className="flex-1"
            iconName="CheckCircle"
            iconPosition="left"
            onClick={() => onValidationComplete?.('approved')}
          >
            Aprobar Reclamación
          </Button>
          <Button
            variant="warning"
            className="flex-1"
            iconName="Clock"
            iconPosition="left"
            onClick={() => onValidationComplete?.('observation')}
          >
            Solicitar Observación
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            iconName="XCircle"
            iconPosition="left"
            onClick={() => onValidationComplete?.('rejected')}
          >
            Rechazar Reclamación
          </Button>
        </div>
        
        <div className="mt-4">
          <Input
            label="Comentarios Adicionales"
            placeholder="Añadir comentarios sobre la validación general..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;