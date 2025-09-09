import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange, onApplyFilters, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const statusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'observado', label: 'Observado' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' }
  ];

  const priorityOptions = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' }
  ];

  const analystOptions = [
    { value: 'maria_garcia', label: 'María García' },
    { value: 'carlos_lopez', label: 'Carlos López' },
    { value: 'ana_martinez', label: 'Ana Martínez' },
    { value: 'luis_rodriguez', label: 'Luis Rodríguez' }
  ];

  const aiScoreRanges = [
    { value: '90-100', label: '90-100% (Excelente)' },
    { value: '70-89', label: '70-89% (Bueno)' },
    { value: '50-69', label: '50-69% (Regular)' },
    { value: '0-49', label: '0-49% (Requiere Atención)' }
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      status: [],
      priority: [],
      assignedTo: [],
      aiScoreRange: [],
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      documentsComplete: false,
      hasIssues: false
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters?.search) count++;
    if (localFilters?.status?.length > 0) count++;
    if (localFilters?.priority?.length > 0) count++;
    if (localFilters?.assignedTo?.length > 0) count++;
    if (localFilters?.aiScoreRange?.length > 0) count++;
    if (localFilters?.dateRange?.start || localFilters?.dateRange?.end) count++;
    if (localFilters?.amountRange?.min || localFilters?.amountRange?.max) count++;
    if (localFilters?.documentsComplete) count++;
    if (localFilters?.hasIssues) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1100]"
        onClick={onClose}
      />
      {/* Filter Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg z-[1110] animate-slide-in">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-foreground">Filtros Avanzados</h2>
              {getActiveFiltersCount() > 0 && (
                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Search */}
            <div>
              <Input
                label="Búsqueda General"
                type="search"
                placeholder="Número de reclamo, paciente, etc."
                value={localFilters?.search}
                onChange={(e) => handleFilterChange('search', e?.target?.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select
                label="Estado del Reclamo"
                placeholder="Seleccionar estados"
                options={statusOptions}
                value={localFilters?.status}
                onChange={(value) => handleFilterChange('status', value)}
                multiple
                searchable
              />
            </div>

            {/* Priority Filter */}
            <div>
              <Select
                label="Prioridad"
                placeholder="Seleccionar prioridades"
                options={priorityOptions}
                value={localFilters?.priority}
                onChange={(value) => handleFilterChange('priority', value)}
                multiple
              />
            </div>

            {/* Assigned Analyst */}
            <div>
              <Select
                label="Analista Asignado"
                placeholder="Seleccionar analistas"
                options={analystOptions}
                value={localFilters?.assignedTo}
                onChange={(value) => handleFilterChange('assignedTo', value)}
                multiple
                searchable
              />
            </div>

            {/* AI Score Range */}
            <div>
              <Select
                label="Rango de Score IA"
                placeholder="Seleccionar rangos"
                options={aiScoreRanges}
                value={localFilters?.aiScoreRange}
                onChange={(value) => handleFilterChange('aiScoreRange', value)}
                multiple
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rango de Fechas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Fecha inicio"
                  value={localFilters?.dateRange?.start || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...localFilters?.dateRange,
                    start: e?.target?.value
                  })}
                />
                <Input
                  type="date"
                  placeholder="Fecha fin"
                  value={localFilters?.dateRange?.end || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...localFilters?.dateRange,
                    end: e?.target?.value
                  })}
                />
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rango de Montos (€)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Monto mínimo"
                  value={localFilters?.amountRange?.min || ''}
                  onChange={(e) => handleFilterChange('amountRange', {
                    ...localFilters?.amountRange,
                    min: e?.target?.value
                  })}
                />
                <Input
                  type="number"
                  placeholder="Monto máximo"
                  value={localFilters?.amountRange?.max || ''}
                  onChange={(e) => handleFilterChange('amountRange', {
                    ...localFilters?.amountRange,
                    max: e?.target?.value
                  })}
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Filtros Adicionales
              </label>
              
              <Checkbox
                label="Solo documentos completos"
                checked={localFilters?.documentsComplete}
                onChange={(e) => handleFilterChange('documentsComplete', e?.target?.checked)}
              />
              
              <Checkbox
                label="Solo reclamos con problemas IA"
                checked={localFilters?.hasIssues}
                onChange={(e) => handleFilterChange('hasIssues', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Limpiar
              </Button>
              <Button
                variant="default"
                onClick={handleApply}
                className="flex-1"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;