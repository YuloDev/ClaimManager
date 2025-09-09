import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const FilterControls = ({ onFiltersChange, className = '' }) => {
  const [filters, setFilters] = useState({
    claimType: '',
    provider: '',
    status: '',
    userRole: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const claimTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'medical', label: 'Consulta Médica' },
    { value: 'pharmacy', label: 'Farmacia' },
    { value: 'dental', label: 'Dental' },
    { value: 'optical', label: 'Óptica' },
    { value: 'emergency', label: 'Emergencia' }
  ];

  const providerOptions = [
    { value: '', label: 'Todos los proveedores' },
    { value: 'hospital-universitario', label: 'Hospital Universitario' },
    { value: 'clinica-san-rafael', label: 'Clínica San Rafael' },
    { value: 'centro-medico-norte', label: 'Centro Médico Norte' },
    { value: 'hospital-general', label: 'Hospital General' },
    { value: 'clinica-del-sur', label: 'Clínica del Sur' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'submitted', label: 'Enviado' },
    { value: 'in-review', label: 'En Revisión' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'rejected', label: 'Rechazado' }
  ];

  const userRoleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'affiliate', label: 'Afiliado' },
    { value: 'analyst', label: 'Analista' },
    { value: 'admin', label: 'Administrador' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      claimType: '',
      provider: '',
      status: '',
      userRole: ''
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} className="text-primary" />
            <h3 className="text-sm font-medium text-foreground">Filtros Avanzados</h3>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                Activos
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Tipo de Reclamación"
                options={claimTypeOptions}
                value={filters?.claimType}
                onChange={(value) => handleFilterChange('claimType', value)}
                placeholder="Seleccionar tipo"
              />
              
              <Select
                label="Proveedor"
                options={providerOptions}
                value={filters?.provider}
                onChange={(value) => handleFilterChange('provider', value)}
                placeholder="Seleccionar proveedor"
              />
              
              <Select
                label="Estado"
                options={statusOptions}
                value={filters?.status}
                onChange={(value) => handleFilterChange('status', value)}
                placeholder="Seleccionar estado"
              />
              
              <Select
                label="Rol de Usuario"
                options={userRoleOptions}
                value={filters?.userRole}
                onChange={(value) => handleFilterChange('userRole', value)}
                placeholder="Seleccionar rol"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                iconName="X"
                iconPosition="left"
              >
                Limpiar Filtros
              </Button>
              <Button
                variant="default"
                size="sm"
                iconName="Search"
                iconPosition="left"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterControls;