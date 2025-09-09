import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ProviderAnalyticsChart = ({ className = '' }) => {
  const data = [
    { name: 'Hospital Universitario', value: 1245, color: 'var(--color-primary)' },
    { name: 'Clínica San Rafael', value: 987, color: 'var(--color-secondary)' },
    { name: 'Centro Médico Norte', value: 756, color: 'var(--color-accent)' },
    { name: 'Hospital General', value: 634, color: 'var(--color-success)' },
    { name: 'Clínica del Sur', value: 523, color: 'var(--color-warning)' },
    { name: 'Otros', value: 445, color: 'var(--color-text-secondary)' }
  ];

  const COLORS = data?.map(entry => entry?.color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      const total = 4590; // Sum of all values
      const percentage = ((data?.value / total) * 100)?.toFixed(1);
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data?.name}</p>
          <p className="text-sm text-text-secondary">
            Reclamaciones: {data?.value?.toLocaleString('es-ES')}
          </p>
          <p className="text-sm text-text-secondary">
            Porcentaje: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100)?.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-card ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Análisis por Proveedor
        </h3>
        <p className="text-sm text-text-secondary">
          Distribución de reclamaciones por centro médico
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry?.color, fontSize: '12px' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProviderAnalyticsChart;