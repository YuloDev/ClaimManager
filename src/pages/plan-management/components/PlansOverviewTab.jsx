import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PlansOverviewTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const plans = [
    {
      id: 1,
      name: "Plan Básico",
      tier: "Básico",
      premium: 45.99,
      deductible: 500,
      coverage: 80,
      maxCoverage: 50000,
      status: "active",
      members: 1250,
      lastModified: "2025-08-20",
      description: "Cobertura básica para atención médica general"
    },
    {
      id: 2,
      name: "Plan Premium",
      tier: "Premium",
      premium: 89.99,
      deductible: 250,
      coverage: 90,
      maxCoverage: 100000,
      status: "active",
      members: 850,
      lastModified: "2025-08-18",
      description: "Cobertura completa con beneficios adicionales"
    },
    {
      id: 3,
      name: "Plan Familiar",
      tier: "Familiar",
      premium: 129.99,
      deductible: 300,
      coverage: 85,
      maxCoverage: 150000,
      status: "active",
      members: 620,
      lastModified: "2025-08-15",
      description: "Plan diseñado para familias con cobertura extendida"
    },
    {
      id: 4,
      name: "Plan Ejecutivo",
      tier: "Ejecutivo",
      premium: 199.99,
      deductible: 100,
      coverage: 95,
      maxCoverage: 250000,
      status: "draft",
      members: 0,
      lastModified: "2025-08-25",
      description: "Plan premium con cobertura ejecutiva completa"
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'draft', label: 'Borrador' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-success text-success-foreground', label: 'Activo' },
      draft: { color: 'bg-warning text-warning-foreground', label: 'Borrador' },
      inactive: { color: 'bg-error text-error-foreground', label: 'Inactivo' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const filteredPlans = plans?.filter(plan => {
    const matchesSearch = plan?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         plan?.tier?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePlan = () => {
    setShowCreateModal(true);
  };

  const handleEditPlan = (planId) => {
    console.log(`Editando plan ${planId}`);
  };

  const handleDuplicatePlan = (planId) => {
    console.log(`Duplicando plan ${planId}`);
  };

  const handleToggleStatus = (planId) => {
    console.log(`Cambiando estado del plan ${planId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Buscar planes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filtrar por estado"
            className="w-48"
          />
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={handleCreatePlan}
          >
            Crear Plan
          </Button>
        </div>
      </div>
      {/* Plans Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Prima Mensual</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Deducible</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Cobertura</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Límite Máximo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Miembros</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPlans?.map((plan) => (
                <tr key={plan?.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{plan?.name}</div>
                      <div className="text-sm text-text-secondary">{plan?.description}</div>
                      <div className="text-xs text-text-secondary mt-1">
                        Modificado: {plan?.lastModified}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">€{plan?.premium}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">€{plan?.deductible?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${plan?.coverage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-foreground">{plan?.coverage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">€{plan?.maxCoverage?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{plan?.members?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(plan?.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPlan(plan?.id)}
                        className="h-8 w-8"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicatePlan(plan?.id)}
                        className="h-8 w-8"
                      >
                        <Icon name="Copy" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(plan?.id)}
                        className="h-8 w-8"
                      >
                        <Icon name={plan?.status === 'active' ? 'Pause' : 'Play'} size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filteredPlans?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron planes</h3>
          <p className="text-text-secondary">
            {searchTerm || statusFilter !== 'all' ?'Intenta ajustar los filtros de búsqueda' :'Comienza creando tu primer plan de seguro'
            }
          </p>
        </div>
      )}
      {/* Create Plan Modal */}
      {showCreateModal && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Crear Nuevo Plan</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="Nombre del Plan"
                  placeholder="Ej: Plan Premium Plus"
                  required
                />
                <Select
                  label="Nivel del Plan"
                  options={[
                    { value: 'basico', label: 'Básico' },
                    { value: 'premium', label: 'Premium' },
                    { value: 'familiar', label: 'Familiar' },
                    { value: 'ejecutivo', label: 'Ejecutivo' }
                  ]}
                  placeholder="Seleccionar nivel"
                  required
                />
                <Input
                  label="Prima Mensual (€)"
                  type="number"
                  placeholder="0.00"
                  required
                />
                <Input
                  label="Descripción"
                  placeholder="Descripción del plan..."
                />
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
                <Button variant="default">
                  Crear Plan
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlansOverviewTab;