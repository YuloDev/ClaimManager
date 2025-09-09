import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CoverageRulesTab = () => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [activeRule, setActiveRule] = useState(null);

  const plans = [
    { value: 'basico', label: 'Plan Básico' },
    { value: 'premium', label: 'Plan Premium' },
    { value: 'familiar', label: 'Plan Familiar' },
    { value: 'ejecutivo', label: 'Plan Ejecutivo' }
  ];

  const coverageRules = [
    {
      id: 1,
      planId: 'basico',
      category: 'Consulta General',
      copayment: 15,
      coinsurance: 20,
      deductible: 100,
      annualLimit: 5000,
      conditions: ['Requiere referencia médica'],
      status: 'active'
    },
    {
      id: 2,
      planId: 'basico',
      category: 'Medicamentos',
      copayment: 10,
      coinsurance: 30,
      deductible: 50,
      annualLimit: 2000,
      conditions: ['Solo medicamentos genéricos'],
      status: 'active'
    },
    {
      id: 3,
      planId: 'premium',
      category: 'Especialistas',
      copayment: 25,
      coinsurance: 10,
      deductible: 0,
      annualLimit: 15000,
      conditions: ['Sin restricciones'],
      status: 'active'
    },
    {
      id: 4,
      planId: 'premium',
      category: 'Cirugía',
      copayment: 0,
      coinsurance: 5,
      deductible: 500,
      annualLimit: 50000,
      conditions: ['Requiere pre-autorización'],
      status: 'active'
    }
  ];

  const serviceCategories = [
    { value: 'consulta-general', label: 'Consulta General' },
    { value: 'especialistas', label: 'Especialistas' },
    { value: 'medicamentos', label: 'Medicamentos' },
    { value: 'cirugia', label: 'Cirugía' },
    { value: 'diagnostico', label: 'Diagnóstico' },
    { value: 'emergencia', label: 'Emergencia' }
  ];

  const filteredRules = selectedPlan 
    ? coverageRules?.filter(rule => rule?.planId === selectedPlan)
    : coverageRules;

  const handleCreateRule = () => {
    setActiveRule(null);
    setShowRuleBuilder(true);
  };

  const handleEditRule = (rule) => {
    setActiveRule(rule);
    setShowRuleBuilder(true);
  };

  const handleDeleteRule = (ruleId) => {
    console.log(`Eliminando regla ${ruleId}`);
  };

  const handleSaveRule = () => {
    console.log('Guardando regla');
    setShowRuleBuilder(false);
    setActiveRule(null);
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
          onClick={handleCreateRule}
        >
          Nueva Regla
        </Button>
      </div>
      {/* Rules List */}
      <div className="grid gap-4">
        {filteredRules?.map((rule) => (
          <div key={rule?.id} className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{rule?.category}</h3>
                <p className="text-sm text-text-secondary">
                  Plan: {plans?.find(p => p?.value === rule?.planId)?.label}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditRule(rule)}
                >
                  <Icon name="Edit" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteRule(rule?.id)}
                  className="text-error hover:text-error"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-text-secondary mb-1">Copago</div>
                <div className="text-lg font-semibold text-foreground">€{rule?.copayment}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-text-secondary mb-1">Coaseguro</div>
                <div className="text-lg font-semibold text-foreground">{rule?.coinsurance}%</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-text-secondary mb-1">Deducible</div>
                <div className="text-lg font-semibold text-foreground">€{rule?.deductible}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-text-secondary mb-1">Límite Anual</div>
                <div className="text-lg font-semibold text-foreground">€{rule?.annualLimit?.toLocaleString()}</div>
              </div>
            </div>

            {rule?.conditions?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-foreground mb-2">Condiciones:</div>
                <div className="flex flex-wrap gap-2">
                  {rule?.conditions?.map((condition, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {filteredRules?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Settings" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No hay reglas configuradas</h3>
          <p className="text-text-secondary mb-4">
            {selectedPlan 
              ? 'Este plan no tiene reglas de cobertura configuradas' :'Comienza creando reglas de cobertura para tus planes'
            }
          </p>
          <Button variant="default" onClick={handleCreateRule}>
            Crear Primera Regla
          </Button>
        </div>
      )}
      {/* Rule Builder Modal */}
      {showRuleBuilder && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowRuleBuilder(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">
                  {activeRule ? 'Editar Regla' : 'Nueva Regla de Cobertura'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRuleBuilder(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Plan"
                    options={plans}
                    placeholder="Seleccionar plan"
                    required
                  />
                  <Select
                    label="Categoría de Servicio"
                    options={serviceCategories}
                    placeholder="Seleccionar categoría"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Copago (€)"
                    type="number"
                    placeholder="0.00"
                    description="Cantidad fija por servicio"
                  />
                  <Input
                    label="Coaseguro (%)"
                    type="number"
                    placeholder="0"
                    description="Porcentaje del costo"
                  />
                  <Input
                    label="Deducible (€)"
                    type="number"
                    placeholder="0.00"
                    description="Monto antes de cobertura"
                  />
                  <Input
                    label="Límite Anual (€)"
                    type="number"
                    placeholder="0.00"
                    description="Máximo por año"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Condiciones Especiales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Checkbox label="Requiere referencia médica" />
                    <Checkbox label="Requiere pre-autorización" />
                    <Checkbox label="Solo proveedores de red" />
                    <Checkbox label="Límite por edad" />
                    <Checkbox label="Período de espera aplicable" />
                    <Checkbox label="Exclusión por condición preexistente" />
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Vista Previa del Cálculo</h4>
                  <div className="text-sm text-text-secondary">
                    <p>Ejemplo: Servicio de €100</p>
                    <p>• Copago: €15</p>
                    <p>• Coaseguro (20%): €17</p>
                    <p>• Total a pagar por el paciente: €32</p>
                    <p>• Cobertura del seguro: €68</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setShowRuleBuilder(false)}
                >
                  Cancelar
                </Button>
                <Button variant="default" onClick={handleSaveRule}>
                  {activeRule ? 'Actualizar' : 'Crear'} Regla
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CoverageRulesTab;