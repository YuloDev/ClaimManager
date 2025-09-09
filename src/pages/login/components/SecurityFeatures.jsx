import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityFeatures = () => {
  const features = [
    {
      icon: 'Shield',
      title: 'Seguridad Avanzada',
      description: 'Autenticación multifactor y encriptación de extremo a extremo'
    },
    {
      icon: 'Zap',
      title: 'Procesamiento IA',
      description: 'Validación automática de documentos con inteligencia artificial'
    },
    {
      icon: 'Clock',
      title: 'Tiempo Real',
      description: 'Seguimiento en tiempo real del estado de sus reclamaciones'
    }
  ];

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features?.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name={feature?.icon} size={24} className="text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">
              {feature?.title}
            </h3>
            <p className="text-xs text-text-secondary">
              {feature?.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityFeatures;