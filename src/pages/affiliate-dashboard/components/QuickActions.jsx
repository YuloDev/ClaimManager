import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ className = '' }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'new-claim',
      title: 'Nuevo Reclamo',
      description: 'Envía un nuevo reclamo de reembolso',
      icon: 'Plus',
      color: 'secondary',
      path: '/claim-submission'
    },
    {
      id: 'upload-documents',
      title: 'Subir Documentos',
      description: 'Adjunta documentos a reclamos existentes',
      icon: 'Upload',
      color: 'accent',
      path: '/claim-submission?action=upload'
    },
    {
      id: 'track-claims',
      title: 'Seguir Reclamos',
      description: 'Revisa el estado de tus reclamos',
      icon: 'Search',
      color: 'primary',
      path: '/affiliate-dashboard?tab=claims'
    }
  ];

  const handleActionClick = (action) => {
    navigate(action?.path);
  };

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20',
      accent: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20'
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Acciones Rápidas</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {actions?.map((action) => (
            <button
              key={action?.id}
              onClick={() => handleActionClick(action)}
              className={`w-full p-4 rounded-lg border-2 border-dashed transition-all duration-200 text-left ${getColorClasses(action?.color)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Icon name={action?.icon} size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{action?.title}</h4>
                  <p className="text-sm opacity-80">{action?.description}</p>
                </div>
                <div className="mt-1">
                  <Icon name="ChevronRight" size={20} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">¿Necesitas ayuda?</span>
          <Button variant="ghost" size="sm" iconName="HelpCircle" iconSize={16}>
            Soporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;