import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const PatientInfoForm = ({ formData, diagnosisData, onChange, errors = {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' }
  ];

  const relationshipOptions = [
    { value: 'self', label: 'Titular' },
    { value: 'spouse', label: 'Cónyuge' },
    { value: 'child', label: 'Hijo/a' },
    { value: 'parent', label: 'Padre/Madre' },
    { value: 'other', label: 'Otro familiar' }
  ];

  const careTypeOptions = [
    { value: 'hospitalario', label: 'Hospitalario' },
    { value: 'ambulatorio', label: 'Ambulatorio' },
  ];

  const handleInputChange = (field, value) => {
    onChange('patientInfo', { ...formData, [field]: value });
  };

  const handleAmountChange = (value) => {
    onChange('diagnosis', {
      ...(diagnosisData || {}),
      totalAmount: value
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div
        className="flex items-center justify-between p-6 border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="User" size={18} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Información del reclamo</h3>
          </div>
        </div>
        <Icon
          name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
          size={20}
          className="text-text-secondary"
        />
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre Completo"
              type="text"
              placeholder="Ingrese el nombre completo"
              value={formData?.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e?.target?.value)}
              error={errors?.fullName}
              required
            />

            <Input
              label="Número de Identificación"
              type="text"
              placeholder="Cédula o DNI"
              value={formData?.identification || ''}
              onChange={(e) => handleInputChange('identification', e?.target?.value)}
              error={errors?.identification}
              required
            />

            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={formData?.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e?.target?.value)}
              error={errors?.birthDate}
              required
            />

            <Select
              label="Género"
              options={genderOptions}
              value={formData?.gender || ''}
              onChange={(value) => handleInputChange('gender', value)}
              error={errors?.gender}
              placeholder="Seleccione género"
              required
            />

            <Input
              label="Teléfono"
              type="tel"
              placeholder="+34 600 000 000"
              value={formData?.phone || ''}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              error={errors?.phone}
            />

            <Input
              label="Email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData?.email || ''}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              error={errors?.email}
            />

            <Select
              label="Relación con el Titular"
              options={relationshipOptions}
              value={formData?.relationship || ''}
              onChange={(value) => handleInputChange('relationship', value)}
              error={errors?.relationship}
              placeholder="Seleccione relación"
              required
            />

            <Input
              label="Número de Póliza"
              type="text"
              placeholder="POL-2024-XXXXX"
              value={formData?.policyNumber || ''}
              onChange={(e) => handleInputChange('policyNumber', e?.target?.value)}
              error={errors?.policyNumber}
              required
            />

            {/* NUEVO: Tipo de atención */}
            <Select
              label="Tipo de atención"
              options={careTypeOptions}
              value={formData?.careType || ''}
              onChange={(value) => handleInputChange('careType', value)}
              error={errors?.careType}
              placeholder="Seleccione el tipo de atención"
              required
            />

            {/* Monto solicitado */}
            <Input
              label="Monto solicitado (USD)"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={diagnosisData?.totalAmount ?? ''}
              onChange={(e) => handleAmountChange(e?.target?.value)}
              error={errors?.totalAmount}
              description="Ingrese el monto que solicita para reembolso"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Input
              label="Dirección Completa"
              type="text"
              placeholder="Calle, número, ciudad, código postal"
              value={formData?.address || ''}
              onChange={(e) => handleInputChange('address', e?.target?.value)}
              error={errors?.address}
              description="Dirección de residencia del paciente"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfoForm;
