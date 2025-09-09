import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProviderDetailsForm = ({ formData, onChange, errors = {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const providerTypeOptions = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clínica' },
    { value: 'doctor', label: 'Médico Particular' },
    { value: 'pharmacy', label: 'Farmacia' },
    { value: 'laboratory', label: 'Laboratorio' },
    { value: 'specialist', label: 'Especialista' }
  ];

  const specialtyOptions = [
    { value: 'general', label: 'Medicina General' },
    { value: 'cardiology', label: 'Cardiología' },
    { value: 'dermatology', label: 'Dermatología' },
    { value: 'neurology', label: 'Neurología' },
    { value: 'orthopedics', label: 'Traumatología' },
    { value: 'pediatrics', label: 'Pediatría' },
    { value: 'gynecology', label: 'Ginecología' },
    { value: 'ophthalmology', label: 'Oftalmología' },
    { value: 'dentistry', label: 'Odontología' },
    { value: 'psychology', label: 'Psicología' }
  ];

  const handleInputChange = (field, value) => {
    onChange('providerDetails', { ...formData, [field]: value });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div 
        className="flex items-center justify-between p-6 border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Building2" size={18} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Detalles del Proveedor</h3>
            <p className="text-sm text-text-secondary">Información del centro médico o profesional</p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-text-secondary" 
        />
      </div>
      {isExpanded && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre del Proveedor"
              type="text"
              placeholder="Hospital San Juan, Dr. García, etc."
              value={formData?.providerName || ''}
              onChange={(e) => handleInputChange('providerName', e?.target?.value)}
              error={errors?.providerName}
              required
            />

            <Select
              label="Tipo de Proveedor"
              options={providerTypeOptions}
              value={formData?.providerType || ''}
              onChange={(value) => handleInputChange('providerType', value)}
              error={errors?.providerType}
              placeholder="Seleccione tipo"
              required
            />

            <Input
              label="Número de Colegiado/Licencia"
              type="text"
              placeholder="COL-12345 o LIC-67890"
              value={formData?.licenseNumber || ''}
              onChange={(e) => handleInputChange('licenseNumber', e?.target?.value)}
              error={errors?.licenseNumber}
              description="Número de colegiado médico o licencia del centro"
            />

            <Select
              label="Especialidad"
              options={specialtyOptions}
              value={formData?.specialty || ''}
              onChange={(value) => handleInputChange('specialty', value)}
              error={errors?.specialty}
              placeholder="Seleccione especialidad"
              searchable
            />

            <Input
              label="Teléfono del Proveedor"
              type="tel"
              placeholder="+34 900 000 000"
              value={formData?.providerPhone || ''}
              onChange={(e) => handleInputChange('providerPhone', e?.target?.value)}
              error={errors?.providerPhone}
            />

            <Input
              label="Email del Proveedor"
              type="email"
              placeholder="contacto@proveedor.com"
              value={formData?.providerEmail || ''}
              onChange={(e) => handleInputChange('providerEmail', e?.target?.value)}
              error={errors?.providerEmail}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Input
              label="Dirección del Proveedor"
              type="text"
              placeholder="Dirección completa del centro médico"
              value={formData?.providerAddress || ''}
              onChange={(e) => handleInputChange('providerAddress', e?.target?.value)}
              error={errors?.providerAddress}
              description="Dirección donde se prestó el servicio médico"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <Input
              label="Fecha del Servicio"
              type="date"
              value={formData?.serviceDate || ''}
              onChange={(e) => handleInputChange('serviceDate', e?.target?.value)}
              error={errors?.serviceDate}
              required
            />

            <Input
              label="Hora del Servicio"
              type="time"
              value={formData?.serviceTime || ''}
              onChange={(e) => handleInputChange('serviceTime', e?.target?.value)}
              error={errors?.serviceTime}
              description="Hora aproximada de la consulta"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetailsForm;