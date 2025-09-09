import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProviderNetworksTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const providers = [
    {
      id: 1,
      name: "Hospital Universitario La Paz",
      type: "Hospital",
      specialty: "General",
      address: "Paseo de la Castellana, 261, Madrid",
      phone: "+34 91 727 70 00",
      email: "info@hulp.es",
      contractStart: "2024-01-01",
      contractEnd: "2025-12-31",
      reimbursementRate: 85,
      status: "active",
      plans: ["basico", "premium", "familiar"]
    },
    {
      id: 2,
      name: "Clínica Ruber Internacional",
      type: "Clínica",
      specialty: "Cardiología",
      address: "Calle de la Masó, 38, Madrid",
      phone: "+34 91 387 50 00",
      email: "contacto@ruberinternacional.es",
      contractStart: "2024-03-01",
      contractEnd: "2026-02-28",
      reimbursementRate: 90,
      status: "active",
      plans: ["premium", "ejecutivo"]
    },
    {
      id: 3,
      name: "Centro Médico Teknon",
      type: "Centro Médico",
      specialty: "Oncología",
      address: "Carrer de Vilana, 12, Barcelona",
      phone: "+34 93 290 60 00",
      email: "info@teknon.es",
      contractStart: "2024-02-15",
      contractEnd: "2025-02-14",
      reimbursementRate: 95,
      status: "active",
      plans: ["ejecutivo"]
    },
    {
      id: 4,
      name: "Farmacia Central",
      type: "Farmacia",
      specialty: "Medicamentos",
      address: "Gran Vía, 45, Madrid",
      phone: "+34 91 521 23 45",
      email: "info@farmaciacentral.es",
      contractStart: "2024-01-01",
      contractEnd: "2024-12-31",
      reimbursementRate: 70,
      status: "pending",
      plans: ["basico", "premium"]
    }
  ];

  const specialties = [
    { value: 'all', label: 'Todas las especialidades' },
    { value: 'General', label: 'General' },
    { value: 'Cardiología', label: 'Cardiología' },
    { value: 'Oncología', label: 'Oncología' },
    { value: 'Medicamentos', label: 'Medicamentos' },
    { value: 'Pediatría', label: 'Pediatría' },
    { value: 'Ginecología', label: 'Ginecología' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'expired', label: 'Expirado' },
    { value: 'suspended', label: 'Suspendido' }
  ];

  const providerTypes = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinica', label: 'Clínica' },
    { value: 'centro-medico', label: 'Centro Médico' },
    { value: 'farmacia', label: 'Farmacia' },
    { value: 'laboratorio', label: 'Laboratorio' }
  ];

  const plans = [
    { value: 'basico', label: 'Plan Básico' },
    { value: 'premium', label: 'Plan Premium' },
    { value: 'familiar', label: 'Plan Familiar' },
    { value: 'ejecutivo', label: 'Plan Ejecutivo' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-success text-success-foreground', label: 'Activo' },
      pending: { color: 'bg-warning text-warning-foreground', label: 'Pendiente' },
      expired: { color: 'bg-error text-error-foreground', label: 'Expirado' },
      suspended: { color: 'bg-muted text-muted-foreground', label: 'Suspendido' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const filteredProviders = providers?.filter(provider => {
    const matchesSearch = provider?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         provider?.address?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || provider?.specialty === specialtyFilter;
    const matchesStatus = statusFilter === 'all' || provider?.status === statusFilter;
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const handleAddProvider = () => {
    setShowAddModal(true);
  };

  const handleEditProvider = (providerId) => {
    console.log(`Editando proveedor ${providerId}`);
  };

  const handleViewContract = (providerId) => {
    console.log(`Viendo contrato del proveedor ${providerId}`);
  };

  const handleSuspendProvider = (providerId) => {
    console.log(`Suspendiendo proveedor ${providerId}`);
  };

  const isContractExpiringSoon = (endDate) => {
    const today = new Date();
    const contractEnd = new Date(endDate);
    const daysUntilExpiry = Math.ceil((contractEnd - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Select
            options={specialties}
            value={specialtyFilter}
            onChange={setSpecialtyFilter}
            placeholder="Especialidad"
            className="w-48"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Estado"
            className="w-48"
          />
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={handleAddProvider}
          >
            Agregar Proveedor
          </Button>
        </div>
      </div>
      {/* Providers Grid */}
      <div className="grid gap-6">
        {filteredProviders?.map((provider) => (
          <div key={provider?.id} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{provider?.name}</h3>
                  {getStatusBadge(provider?.status)}
                  {isContractExpiringSoon(provider?.contractEnd) && (
                    <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full flex items-center space-x-1">
                      <Icon name="AlertTriangle" size={12} />
                      <span>Contrato por vencer</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-text-secondary mb-2">
                  <span className="flex items-center space-x-1">
                    <Icon name="Building" size={16} />
                    <span>{provider?.type}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Icon name="Stethoscope" size={16} />
                    <span>{provider?.specialty}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-text-secondary mb-2">
                  <Icon name="MapPin" size={16} />
                  <span>{provider?.address}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewContract(provider?.id)}
                >
                  <Icon name="FileText" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditProvider(provider?.id)}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSuspendProvider(provider?.id)}
                  className="text-error hover:text-error"
                >
                  <Icon name="Pause" size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Información de Contacto</h4>
                <div className="space-y-1 text-sm text-text-secondary">
                  <div className="flex items-center space-x-2">
                    <Icon name="Phone" size={14} />
                    <span>{provider?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={14} />
                    <span>{provider?.email}</span>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Detalles del Contrato</h4>
                <div className="space-y-1 text-sm text-text-secondary">
                  <div>Inicio: {new Date(provider.contractStart)?.toLocaleDateString('es-ES')}</div>
                  <div>Fin: {new Date(provider.contractEnd)?.toLocaleDateString('es-ES')}</div>
                  <div className="flex items-center space-x-2">
                    <span>Reembolso:</span>
                    <span className="font-medium text-foreground">{provider?.reimbursementRate}%</span>
                  </div>
                </div>
              </div>

              {/* Associated Plans */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Planes Asociados</h4>
                <div className="flex flex-wrap gap-1">
                  {provider?.plans?.map((planId) => {
                    const plan = plans?.find(p => p?.value === planId);
                    return (
                      <span
                        key={planId}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {plan?.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredProviders?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Building" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron proveedores</h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || specialtyFilter !== 'all' || statusFilter !== 'all' ?'Intenta ajustar los filtros de búsqueda' :'Comienza agregando proveedores a tu red'
            }
          </p>
          <Button variant="default" onClick={handleAddProvider}>
            Agregar Primer Proveedor
          </Button>
        </div>
      )}
      {/* Add Provider Modal */}
      {showAddModal && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Agregar Nuevo Proveedor</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre del Proveedor"
                    placeholder="Hospital o Clínica..."
                    required
                  />
                  <Select
                    label="Tipo de Proveedor"
                    options={providerTypes}
                    placeholder="Seleccionar tipo"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Especialidad Principal"
                    options={specialties?.filter(s => s?.value !== 'all')}
                    placeholder="Seleccionar especialidad"
                    required
                  />
                  <Input
                    label="Dirección"
                    placeholder="Dirección completa..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    type="tel"
                    placeholder="+34 XXX XXX XXX"
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="contacto@proveedor.es"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Fecha Inicio Contrato"
                    type="date"
                    required
                  />
                  <Input
                    label="Fecha Fin Contrato"
                    type="date"
                    required
                  />
                  <Input
                    label="Tasa de Reembolso (%)"
                    type="number"
                    placeholder="85"
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Planes Asociados
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {plans?.map((plan) => (
                      <label key={plan?.value} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="text-sm text-foreground">{plan?.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
                <Button variant="default">
                  Agregar Proveedor
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProviderNetworksTab;