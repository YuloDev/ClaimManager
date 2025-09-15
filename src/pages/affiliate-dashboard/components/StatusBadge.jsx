import React from 'react';

const StatusBadge = ({ status, originalStatus, className = '' }) => {
  const getStatusConfig = (statusType, original) => {
    const configs = {
      // Estados del endpoint
      aprobado: {
        label: original || 'Aprobado',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      en_revision: {
        label: original || 'En Revisión',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      rechazado: {
        label: original || 'Rechazado',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      // Estados legacy para compatibilidad
      draft: {
        label: 'Borrador',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      submitted: {
        label: 'Enviado',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      validation: {
        label: 'En Validación',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      observed: {
        label: 'Observado',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      approved: {
        label: 'Aprobado',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      rejected: {
        label: 'Rechazado',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      paid: {
        label: 'Pagado',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }
    };
    return configs?.[statusType] || {
      label: original || 'Desconocido',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };
  };

  const config = getStatusConfig(status, originalStatus);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.className} ${className}`}>
      {config?.label}
    </span>
  );
};

export default StatusBadge;