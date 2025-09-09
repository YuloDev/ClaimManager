import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (statusType) => {
    const configs = {
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
    return configs?.[statusType] || configs?.draft;
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.className} ${className}`}>
      {config?.label}
    </span>
  );
};

export default StatusBadge;