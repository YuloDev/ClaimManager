import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const WorkflowTools = ({ onWorkflowAction, analysts, rules }) => {
  const [selectedAnalyst, setSelectedAnalyst] = useState('');
  const [selectedRule, setSelectedRule] = useState('');
  const [batchSize, setBatchSize] = useState(10);

  const workflowActions = [
    {
      id: 'auto_assign',
      title: 'Asignación Automática',
      description: 'Asignar reclamos pendientes automáticamente por carga de trabajo',
      icon: 'UserPlus',
      color: 'primary'
    },
    {
      id: 'batch_approve',
      title: 'Aprobación en Lote',
      description: 'Aprobar múltiples reclamos que cumplan criterios específicos',
      icon: 'CheckCircle',
      color: 'success'
    },
    {
      id: 'priority_sort',
      title: 'Ordenar por Prioridad',
      description: 'Reorganizar cola de revisión por urgencia y monto',
      icon: 'ArrowUpDown',
      color: 'warning'
    },
    {
      id: 'rule_engine',
      title: 'Motor de Reglas',
      description: 'Aplicar reglas de negocio automáticamente',
      icon: 'Settings',
      color: 'accent'
    }
  ];

  const analystOptions = analysts?.map(analyst => ({
    value: analyst?.id,
    label: `${analyst?.name} (${analyst?.workload} reclamos)`
  }));

  const ruleOptions = rules?.map(rule => ({
    value: rule?.id,
    label: rule?.name,
    description: rule?.description
  }));

  const batchSizeOptions = [
    { value: 5, label: '5 reclamos' },
    { value: 10, label: '10 reclamos' },
    { value: 25, label: '25 reclamos' },
    { value: 50, label: '50 reclamos' }
  ];

  const getActionColor = (color) => {
    switch (color) {
      case 'success':
        return 'border-success/20 hover:bg-success/5';
      case 'warning':
        return 'border-warning/20 hover:bg-warning/5';
      case 'accent':
        return 'border-accent/20 hover:bg-accent/5';
      default:
        return 'border-primary/20 hover:bg-primary/5';
    }
  };

  const handleActionClick = (actionId) => {
    const actionData = {
      actionId,
      selectedAnalyst,
      selectedRule,
      batchSize
    };
    onWorkflowAction(actionData);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Herramientas de Flujo de Trabajo</h3>
        <p className="text-sm text-text-secondary mt-1">
          Automatiza procesos y optimiza la gestión de reclamos
        </p>
      </div>
      <div className="p-4 space-y-6">
        {/* Configuration Section */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Configuración</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Analista por Defecto"
              placeholder="Seleccionar analista"
              options={analystOptions}
              value={selectedAnalyst}
              onChange={setSelectedAnalyst}
              searchable
            />
            
            <Select
              label="Regla de Negocio"
              placeholder="Seleccionar regla"
              options={ruleOptions}
              value={selectedRule}
              onChange={setSelectedRule}
              searchable
            />
          </div>

          <Select
            label="Tamaño de Lote"
            options={batchSizeOptions}
            value={batchSize}
            onChange={setBatchSize}
            className="md:w-1/2"
          />
        </div>

        {/* Workflow Actions */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Acciones Disponibles</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowActions?.map((action) => (
              <div
                key={action?.id}
                className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${getActionColor(action?.color)}`}
                onClick={() => handleActionClick(action?.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    action?.color === 'success' ? 'bg-success/10 text-success' :
                    action?.color === 'warning' ? 'bg-warning/10 text-warning' :
                    action?.color === 'accent'? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                  }`}>
                    <Icon name={action?.icon} size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-foreground mb-1">{action?.title}</h5>
                    <p className="text-sm text-text-secondary">{action?.description}</p>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-text-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Estadísticas Rápidas</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-sm text-text-secondary">Pendientes</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-warning">8</p>
              <p className="text-sm text-text-secondary">En Revisión</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-success">156</p>
              <p className="text-sm text-text-secondary">Aprobados Hoy</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold text-error">3</p>
              <p className="text-sm text-text-secondary">Observados</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          <Button
            variant="default"
            onClick={() => handleActionClick('refresh_queue')}
            iconName="RefreshCw"
            iconPosition="left"
          >
            Actualizar Cola
          </Button>
          <Button
            variant="outline"
            onClick={() => handleActionClick('export_report')}
            iconName="Download"
            iconPosition="left"
          >
            Exportar Reporte
          </Button>
          <Button
            variant="outline"
            onClick={() => handleActionClick('schedule_task')}
            iconName="Calendar"
            iconPosition="left"
          >
            Programar Tarea
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTools;