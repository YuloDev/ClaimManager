import React from 'react';

const BrandHeader = () => {
  return (
    <div className="text-center mb-12">
      {/* Logo */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          {/* Diamond Icon */}
          <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center transform rotate-45">
            <div className="w-6 h-6 bg-primary transform -rotate-45 rounded-sm"></div>
          </div>
          
          {/* Brand Text */}
          <div className="flex flex-col items-start">
            <h1 className="text-3xl font-bold text-primary font-inter tracking-tight">
              nexti
            </h1>
            <p className="text-xs text-text-secondary font-medium tracking-wider uppercase">
              BUSINESS SOLUTIONS
            </p>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Sistema de Gestión de Reclamaciones
        </h2>
        <p className="text-text-secondary">
          Plataforma integral para la gestión de reclamaciones de seguros médicos con validación impulsada por IA
        </p>
      </div>
    </div>
  );
};

export default BrandHeader;