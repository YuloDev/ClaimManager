import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ClaimsTrendChart = ({ data, className = '' }) => {
  const chartData = [
    { month: 'Ene', submitted: 245, approved: 198, rejected: 47 },
    { month: 'Feb', submitted: 312, approved: 267, rejected: 45 },
    { month: 'Mar', submitted: 289, approved: 234, rejected: 55 },
    { month: 'Abr', submitted: 356, approved: 298, rejected: 58 },
    { month: 'May', submitted: 423, approved: 367, rejected: 56 },
    { month: 'Jun', submitted: 398, approved: 342, rejected: 56 },
    { month: 'Jul', submitted: 445, approved: 389, rejected: 56 },
    { month: 'Ago', submitted: 467, approved: 412, rejected: 55 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{`${label} 2024`}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {`${entry?.name}: ${entry?.value?.toLocaleString('es-ES')}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-card ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tendencia de Reclamaciones
        </h3>
        <p className="text-sm text-text-secondary">
          Evolución mensual de reclamaciones por estado
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="submitted" 
              stroke="var(--color-accent)" 
              strokeWidth={2}
              name="Enviadas"
              dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="approved" 
              stroke="var(--color-success)" 
              strokeWidth={2}
              name="Aprobadas"
              dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="rejected" 
              stroke="var(--color-error)" 
              strokeWidth={2}
              name="Rechazadas"
              dot={{ fill: 'var(--color-error)', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClaimsTrendChart;