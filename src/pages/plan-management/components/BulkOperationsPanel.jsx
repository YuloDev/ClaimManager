import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkOperationsPanel = () => {
  const [selectedOperation, setSelectedOperation] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const operations = [
    { value: 'import-plans', label: 'Importar Planes' },
    { value: 'import-rules', label: 'Importar Reglas de Cobertura' },
    { value: 'import-providers', label: 'Importar Proveedores' },
    { value: 'export-plans', label: 'Exportar Planes' },
    { value: 'export-rules', label: 'Exportar Reglas' },
    { value: 'export-providers', label: 'Exportar Proveedores' }
  ];

  const recentOperations = [
    {
      id: 1,
      type: 'import',
      operation: 'Importar Planes',
      fileName: 'planes_2025.csv',
      status: 'completed',
      recordsProcessed: 15,
      timestamp: '2025-08-26 14:30:00',
      user: 'admin@nexti.es'
    },
    {
      id: 2,
      type: 'export',
      operation: 'Exportar Reglas',
      fileName: 'reglas_cobertura.csv',
      status: 'completed',
      recordsProcessed: 45,
      timestamp: '2025-08-25 16:45:00',
      user: 'admin@nexti.es'
    },
    {
      id: 3,
      type: 'import',
      operation: 'Importar Proveedores',
      fileName: 'proveedores_madrid.csv',
      status: 'failed',
      recordsProcessed: 0,
      error: 'Formato de archivo incorrecto',
      timestamp: '2025-08-24 10:15:00',
      user: 'admin@nexti.es'
    }
  ];

  const handleFileUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setIsProcessing(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const handleDownloadTemplate = (operationType) => {
    console.log(`Descargando plantilla para: ${operationType}`);
  };

  const handleExport = () => {
    console.log(`Exportando: ${selectedOperation}`);
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-success text-success-foreground', label: 'Completado', icon: 'CheckCircle' },
      processing: { color: 'bg-warning text-warning-foreground', label: 'Procesando', icon: 'Clock' },
      failed: { color: 'bg-error text-error-foreground', label: 'Fallido', icon: 'XCircle' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.processing;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span>{config?.label}</span>
      </span>
    );
  };

  const isImportOperation = selectedOperation?.includes('import');
  const isExportOperation = selectedOperation?.includes('export');

  return (
    <div className="space-y-6">
      {/* Operation Selector */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Operaciones Masivas</h3>
        
        <div className="space-y-4">
          <Select
            label="Seleccionar Operación"
            options={operations}
            value={selectedOperation}
            onChange={setSelectedOperation}
            placeholder="Elegir tipo de operación..."
          />

          {selectedOperation && (
            <div className="space-y-4">
              {isImportOperation && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Archivo de Importación</h4>
                      <p className="text-xs text-text-secondary">
                        Formatos soportados: CSV, Excel (.xlsx)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                      onClick={() => handleDownloadTemplate(selectedOperation)}
                    >
                      Descargar Plantilla
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-foreground mb-1">
                        Haz clic para seleccionar archivo o arrastra aquí
                      </p>
                      <p className="text-xs text-text-secondary">
                        Máximo 10MB - CSV, Excel
                      </p>
                    </label>
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">Procesando archivo...</span>
                        <span className="text-text-secondary">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isExportOperation && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Opciones de Exportación</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded border-border" />
                          <span className="text-sm text-foreground">Incluir datos inactivos</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded border-border" />
                          <span className="text-sm text-foreground">Incluir metadatos</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="format" value="csv" defaultChecked />
                          <span className="text-sm text-foreground">Formato CSV</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="radio" name="format" value="excel" />
                          <span className="text-sm text-foreground">Formato Excel</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    iconName="Download"
                    iconPosition="left"
                    onClick={handleExport}
                    loading={isProcessing}
                    className="w-full sm:w-auto"
                  >
                    Exportar Datos
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Recent Operations */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Operaciones Recientes</h3>
        
        <div className="space-y-4">
          {recentOperations?.map((operation) => (
            <div key={operation?.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  operation?.type === 'import' ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'
                }`}>
                  <Icon name={operation?.type === 'import' ? 'Upload' : 'Download'} size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground">{operation?.operation}</h4>
                    {getStatusBadge(operation?.status)}
                  </div>
                  <div className="text-xs text-text-secondary">
                    <span>{operation?.fileName}</span>
                    {operation?.status === 'completed' && (
                      <span> • {operation?.recordsProcessed} registros procesados</span>
                    )}
                    {operation?.error && (
                      <span className="text-error"> • {operation?.error}</span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {operation?.timestamp} • {operation?.user}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {operation?.status === 'completed' && operation?.type === 'export' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Icon name="Download" size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Icon name="MoreHorizontal" size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {recentOperations?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="History" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No hay operaciones recientes</p>
          </div>
        )}
      </div>
      {/* Help Section */}
      <div className="bg-accent/5 rounded-lg border border-accent/20 p-6">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-accent mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Consejos para Operaciones Masivas</h4>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• Descarga siempre la plantilla antes de importar datos</li>
              <li>• Verifica que los datos estén en el formato correcto</li>
              <li>• Las operaciones grandes pueden tardar varios minutos</li>
              <li>• Mantén una copia de seguridad antes de importar cambios masivos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsPanel;