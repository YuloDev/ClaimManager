import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FormActions = ({ 
  onSaveDraft, 
  onSubmit, 
  isLoading = false, 
  isDraftSaving = true,
  hasUnsavedChanges = false,
  lastSaved = null,
  canSubmit = false 
}) => {
  const formatLastSaved = (timestamp) => {
    if (!timestamp) return null;
    const now = new Date();
    const saved = new Date(timestamp);
    const diffMinutes = Math.floor((now - saved) / 60000);
    
    if (diffMinutes < 1) return 'Guardado hace unos segundos';
    if (diffMinutes < 60) return `Guardado hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Guardado hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    return saved?.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-6">
        {/* Save Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges ? (
              <>
                <div className="w-2 h-2 bg-warning rounded-full" />
                <span className="text-sm text-warning">Cambios sin guardar</span>
              </>
            ) : lastSaved ? (
              <>
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm text-success">
                  {formatLastSaved(lastSaved)}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-muted rounded-full" />
                <span className="text-sm text-text-secondary">Borrador nuevo</span>
              </>
            )}
          </div>

          {isDraftSaving && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span>Guardando...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              loading={isDraftSaving}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
              iconName="Save"
              iconPosition="left"
            >
              Guardar Borrador
            </Button>

            <Button
              variant="default"
              onClick={onSubmit}
              loading={isLoading}
              disabled={false}
              className="flex-1"
              iconName="Send"
              iconPosition="left"
            >
              Enviar para Revisión
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="pt-4 border-t border-border">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="ghost"
                className="flex-none"
                iconName="Eye"
                iconPosition="left"
              >
                Vista Previa
              </Button>

              <Button
                variant="ghost"
                className="flex-none"
                iconName="Download"
                iconPosition="left"
              >
                Descargar PDF
              </Button>

              <Button
                variant="ghost"
                className="flex-none text-error hover:text-error hover:bg-error/10"
                iconName="Trash2"
                iconPosition="left"
              >
                Eliminar Borrador
              </Button>
            </div>
          </div>
        </div>

        {/* Submission Requirements */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium text-foreground mb-3">Requisitos para Envío</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon 
                name={canSubmit ? "CheckCircle" : "Circle"} 
                size={16} 
                className={canSubmit ? "text-success" : "text-text-secondary"} 
              />
              <span className={`text-sm ${canSubmit ? "text-success" : "text-text-secondary"}`}>
                Todos los campos obligatorios completados
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name="CheckCircle" 
                size={16} 
                className="text-success" 
              />
              <span className="text-sm text-success">
                Al menos un documento de soporte subido
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon 
                name="CheckCircle" 
                size={16} 
                className="text-success" 
              />
              <span className="text-sm text-success">
                Información del paciente validada
              </span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-accent mt-0.5" />
            <div className="text-sm text-text-secondary">
              <p className="font-medium text-foreground mb-1">Información importante:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Los borradores se guardan automáticamente cada 30 segundos</li>
                <li>Una vez enviado, no podrá modificar la reclamación</li>
                <li>Recibirá una notificación cuando su reclamación sea revisada</li>
                <li>El tiempo de procesamiento típico es de 3-5 días hábiles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormActions;