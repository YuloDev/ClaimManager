import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemAlertsPanel = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('alerts');

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Alto volumen de reclamaciones',
      message: 'Se ha detectado un incremento del 25% en las reclamaciones de emergencia.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: 'Mantenimiento programado',
      message: 'Mantenimiento del sistema programado para el domingo 28/08 de 02:00 a 04:00.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      title: 'Integración completada',
      message: 'La integración con el nuevo proveedor Hospital del Norte se completó exitosamente.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      priority: 'low'
    }
  ];

  const queueStatus = [
    { name: 'Validación de documentos', count: 23, status: 'normal' },
    { name: 'Revisión de analistas', count: 45, status: 'high' },
    { name: 'Aprobación final', count: 12, status: 'normal' },
    { name: 'Procesamiento de pagos', count: 8, status: 'low' }
  ];

  const scheduledReports = [
    {
      id: 1,
      name: 'Reporte Mensual de Claims',
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      frequency: 'Mensual',
      status: 'scheduled'
    },
    {
      id: 2,
      name: 'Análisis de Proveedores',
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      frequency: 'Semanal',
      status: 'scheduled'
    },
    {
      id: 3,
      name: 'KPIs Ejecutivos',
      nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      frequency: 'Diario',
      status: 'running'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      case 'success':
        return 'CheckCircle';
      default:
        return 'Info';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      case 'success':
        return 'text-success';
      default:
        return 'text-accent';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-error';
      case 'medium':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  };

  const getQueueStatusColor = (status) => {
    switch (status) {
      case 'high':
        return 'text-error';
      case 'normal':
        return 'text-success';
      default:
        return 'text-text-secondary';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes} min`;
    return `${hours}h`;
  };

  const formatNextRun = (date) => {
    return date?.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Panel de Control</h3>
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === 'alerts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('alerts')}
              className="text-xs"
            >
              Alertas
            </Button>
            <Button
              variant={activeTab === 'queue' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('queue')}
              className="text-xs"
            >
              Cola
            </Button>
            <Button
              variant={activeTab === 'reports' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('reports')}
              className="text-xs"
            >
              Reportes
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {alerts?.map((alert) => (
                <div key={alert?.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${getAlertColor(alert?.type)}`}>
                      <Icon name={getAlertIcon(alert?.type)} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">{alert?.title}</h4>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert?.priority)}`}></div>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{alert?.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-secondary">
                          hace {formatTimestamp(alert?.timestamp)}
                        </span>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Marcar como leída
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-3">
              {queueStatus?.map((queue, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Icon name="Clock" size={16} className="text-text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{queue?.name}</h4>
                      <p className="text-xs text-text-secondary">En cola de procesamiento</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getQueueStatusColor(queue?.status)}`}>
                      {queue?.count}
                    </div>
                    <div className="text-xs text-text-secondary capitalize">
                      {queue?.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              {scheduledReports?.map((report) => (
                <div key={report?.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">{report?.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report?.status === 'running' ?'bg-accent text-accent-foreground' :'bg-success text-success-foreground'
                    }`}>
                      {report?.status === 'running' ? 'Ejecutando' : 'Programado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Frecuencia: {report?.frequency}</span>
                    <span>Próxima ejecución: {formatNextRun(report?.nextRun)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            iconName="RefreshCw"
            iconPosition="left"
          >
            Actualizar Estado
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemAlertsPanel;