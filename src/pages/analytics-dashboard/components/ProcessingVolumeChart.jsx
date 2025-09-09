import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ProcessingVolumeChart = ({ className = '' }) => {
  const data = [
    { day: 'Lun', morning: 45, afternoon: 38, evening: 12 },
    { day: 'Mar', morning: 52, afternoon: 41, evening: 15 },
    { day: 'Mié', morning: 48, afternoon: 44, evening: 18 },
    { day: 'Jue', morning: 61, afternoon: 39, evening: 14 },
    { day: 'Vie', morning: 55, afternoon: 35, evening: 10 },
    { day: 'Sáb', morning: 23, afternoon: 28, evening: 8 },
    { day: 'Dom', morning: 18, afternoon: 22, evening: 6 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const total = payload?.reduce((sum, entry) => sum + entry?.value, 0);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {`${entry?.name}: ${entry?.value}`}
            </p>
          ))}
          <div className="border-t border-border mt-2 pt-2">
            <p className="text-sm font-medium text-foreground">
              Total: {total}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 shadow-card ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Volumen de Procesamiento
        </h3>
        <p className="text-sm text-text-secondary">
          Distribución de procesamiento por horarios
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="day" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="morning" 
              stackId="a" 
              fill="var(--color-accent)" 
              name="Mañana (8-14h)"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="afternoon" 
              stackId="a" 
              fill="var(--color-secondary)" 
              name="Tarde (14-20h)"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="evening" 
              stackId="a" 
              fill="var(--color-primary)" 
              name="Noche (20-8h)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProcessingVolumeChart;