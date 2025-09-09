import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const WaitingPeriodsTab = () => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const plans = [
    { value: 'basico', label: 'Plan Básico' },
    { value: 'premium', label: 'Plan Premium' },
    { value: 'familiar', label: 'Plan Familiar' },
    { value: 'ejecutivo', label: 'Plan Ejecutivo' }
  ];

  const waitingPeriods = [
    {
      id: 1,
      planId: 'basico',
      service: 'Cirugía Electiva',
      waitingDays: 180,
      description: 'Período de espera para cirugías no urgentes',
      exceptions: ['Emergencias médicas', 'Accidentes'],
      status: 'active'
    },
    {
      id: 2,
      planId: 'basico',
      service: 'Maternidad',
      waitingDays: 300,
      description: 'Cobertura de embarazo y parto',
      exceptions: ['Complicaciones del embarazo'],
      status: 'active'
    },
    {
      id: 3,
      planId: 'premium',
      service: 'Tratamientos Dentales',
      waitingDays: 90,
      description: 'Servicios odontológicos especializados',
      exceptions: ['Emergencias dentales'],
      status: 'active'
    },
    {
      id: 4,
      planId: 'familiar',
      service: 'Condiciones Preexistentes',
      waitingDays: 365,
      description: 'Cobertura para condiciones médicas previas',
      exceptions: ['Tratamientos de emergencia'],
      status: 'active'
    }
  ];

  const serviceTypes = [
    { value: 'cirugia-electiva', label: 'Cirugía Electiva' },
    { value: 'maternidad', label: 'Maternidad' },
    { value: 'dental', label: 'Tratamientos Dentales' },
    { value: 'preexistentes', label: 'Condiciones Preexistentes' },
    { value: 'psicologia', label: 'Servicios Psicológicos' },
    { value: 'fisioterapia', label: 'Fisioterapia' }
  ];

  const filteredPeriods = selectedPlan 
    ? waitingPeriods?.filter(period => period?.planId === selectedPlan)
    : waitingPeriods;

  const handleCreatePeriod = () => {
    setShowCreateModal(true);
  };

  const handleEditPeriod = (periodId) => {
    console.log(`Editando período ${periodId}`);
  };

  const handleDeletePeriod = (periodId) => {
    console.log(`Eliminando período ${periodId}`);
  };

  const formatDays = (days) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      return remainingDays > 0 
        ? `${years} año${years > 1 ? 's' : ''} y ${remainingDays} días`
        : `${years} año${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return remainingDays > 0 
        ? `${months} mes${months > 1 ? 'es' : ''} y ${remainingDays} días`
        : `${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      return `${days} día${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 max-w-md">
          <Select
            label="Filtrar por Plan"
            options={[{ value: '', label: 'Todos los planes' }, ...plans]}
            value={selectedPlan}
            onChange={setSelectedPlan}
            placeholder="Seleccionar plan"
          />
        </div>
        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={handleCreatePeriod}
        >
          Nuevo Período
        </Button>
      </div>
      {/* Waiting Periods Grid */}
      <div className="grid gap-6">
        {filteredPeriods?.map((period) => (
          <div key={period?.id} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{period?.service}</h3>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="Clock" size={16} />
                    <span>{formatDays(period?.waitingDays)}</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-2">{period?.description}</p>
                <p className="text-xs text-text-secondary">
                  Plan: {plans?.find(p => p?.value === period?.planId)?.label}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditPeriod(period?.id)}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePeriod(period?.id)}
                  className="text-error hover:text-error"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timeline Visualization */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Línea de Tiempo</h4>
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-error rounded-full"></div>
                      <div className="w-px h-8 bg-border"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Inicio de Póliza</div>
                      <div className="text-xs text-text-secondary">Día 0</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <div className="w-px h-8 bg-border"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Período de Espera</div>
                      <div className="text-xs text-text-secondary">
                        Días 1 - {period?.waitingDays}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Cobertura Activa</div>
                      <div className="text-xs text-text-secondary">
                        Día {period?.waitingDays + 1} en adelante
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exceptions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Excepciones</h4>
                {period?.exceptions?.length > 0 ? (
                  <div className="space-y-2">
                    {period?.exceptions?.map((exception, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success" />
                        <span className="text-sm text-foreground">{exception}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No hay excepciones configuradas</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredPeriods?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Clock" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No hay períodos de espera</h3>
          <p className="text-text-secondary mb-4">
            {selectedPlan 
              ? 'Este plan no tiene períodos de espera configurados' 
              : 'Comienza configurando períodos de espera para tus planes'
            }
          </p>
          <Button variant="default" onClick={handleCreatePeriod}>
            Crear Primer Período
          </Button>
        </div>
      )}
      {/* Create Period Modal */}
      {showCreateModal && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Nuevo Período de Espera</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <Select
                  label="Plan"
                  options={plans}
                  placeholder="Seleccionar plan"
                  required
                />
                <Select
                  label="Tipo de Servicio"
                  options={serviceTypes}
                  placeholder="Seleccionar servicio"
                  required
                />
                <Input
                  label="Días de Espera"
                  type="number"
                  placeholder="30"
                  description="Número de días antes de que la cobertura sea efectiva"
                  required
                />
                <Input
                  label="Descripción"
                  placeholder="Descripción del período de espera..."
                  description="Explicación clara para los asegurados"
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
                  Crear Período
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WaitingPeriodsTab;