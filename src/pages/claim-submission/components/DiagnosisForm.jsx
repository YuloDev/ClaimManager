import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DiagnosisForm = ({ formData, onChange, errors = {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIcdSearch, setShowIcdSearch] = useState(false);

  // Mock ICD-10 codes for demonstration
  const icd10Codes = [
    { code: 'J00', description: 'Rinofaringitis aguda [resfriado común]' },
    { code: 'J06.9', description: 'Infección aguda de las vías respiratorias superiores, no especificada' },
    { code: 'K59.0', description: 'Estreñimiento' },
    { code: 'M25.5', description: 'Dolor articular' },
    { code: 'R50.9', description: 'Fiebre, no especificada' },
    { code: 'R51', description: 'Cefalea' },
    { code: 'R06.0', description: 'Disnea' },
    { code: 'K30', description: 'Dispepsia funcional' },
    { code: 'M79.3', description: 'Paniculitis, no especificada' },
    { code: 'L30.9', description: 'Dermatitis, no especificada' }
  ];

  const urgencyOptions = [
    { value: 'routine', label: 'Rutina' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'emergency', label: 'Emergencia' }
  ];

  const treatmentTypeOptions = [
    { value: 'consultation', label: 'Consulta' },
    { value: 'treatment', label: 'Tratamiento' },
    { value: 'surgery', label: 'Cirugía' },
    { value: 'diagnostic', label: 'Diagnóstico' },
    { value: 'preventive', label: 'Preventivo' },
    { value: 'rehabilitation', label: 'Rehabilitación' }
  ];

  const handleInputChange = (field, value) => {
    onChange('diagnosis', { ...formData, [field]: value });
  };

  const filteredIcdCodes = icd10Codes?.filter(code => 
    code?.code?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    code?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const selectIcdCode = (code) => {
    handleInputChange('icd10Code', code?.code);
    handleInputChange('diagnosisDescription', code?.description);
    setShowIcdSearch(false);
    setSearchTerm('');
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div 
        className="flex items-center justify-between p-6 border-b border-border cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Stethoscope" size={18} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Diagnóstico y Tratamiento</h3>
            <p className="text-sm text-text-secondary">Información médica y códigos ICD-10</p>
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
            <div className="relative">
              <Input
                label="Código ICD-10"
                type="text"
                placeholder="Buscar código ICD-10"
                value={formData?.icd10Code || ''}
                onChange={(e) => {
                  handleInputChange('icd10Code', e?.target?.value);
                  setSearchTerm(e?.target?.value);
                  setShowIcdSearch(true);
                }}
                error={errors?.icd10Code}
                required
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-8"
                onClick={() => setShowIcdSearch(!showIcdSearch)}
              >
                <Icon name="Search" size={16} />
              </Button>

              {showIcdSearch && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredIcdCodes?.map((code) => (
                    <div
                      key={code?.code}
                      className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                      onClick={() => selectIcdCode(code)}
                    >
                      <div className="font-medium text-foreground">{code?.code}</div>
                      <div className="text-sm text-text-secondary">{code?.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Select
              label="Tipo de Tratamiento"
              options={treatmentTypeOptions}
              value={formData?.treatmentType || ''}
              onChange={(value) => handleInputChange('treatmentType', value)}
              error={errors?.treatmentType}
              placeholder="Seleccione tipo"
              required
            />

            <Select
              label="Urgencia"
              options={urgencyOptions}
              value={formData?.urgency || ''}
              onChange={(value) => handleInputChange('urgency', value)}
              error={errors?.urgency}
              placeholder="Seleccione urgencia"
              required
            />

            <Input
              label="Importe Total"
              type="number"
              placeholder="0,00"
              value={formData?.totalAmount || ''}
              onChange={(e) => handleInputChange('totalAmount', e?.target?.value)}
              error={errors?.totalAmount}
              description="Importe total en euros"
              required
            />
          </div>

          <div className="space-y-4">
            <Input
              label="Descripción del Diagnóstico"
              type="text"
              placeholder="Descripción detallada del diagnóstico"
              value={formData?.diagnosisDescription || ''}
              onChange={(e) => handleInputChange('diagnosisDescription', e?.target?.value)}
              error={errors?.diagnosisDescription}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Síntomas y Observaciones
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={4}
                placeholder="Describa los síntomas presentados y observaciones relevantes..."
                value={formData?.symptoms || ''}
                onChange={(e) => handleInputChange('symptoms', e?.target?.value)}
              />
              {errors?.symptoms && (
                <p className="text-sm text-error">{errors?.symptoms}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Tratamiento Prescrito
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows={3}
                placeholder="Detalle el tratamiento, medicamentos o procedimientos prescritos..."
                value={formData?.prescribedTreatment || ''}
                onChange={(e) => handleInputChange('prescribedTreatment', e?.target?.value)}
              />
              {errors?.prescribedTreatment && (
                <p className="text-sm text-error">{errors?.prescribedTreatment}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisForm;