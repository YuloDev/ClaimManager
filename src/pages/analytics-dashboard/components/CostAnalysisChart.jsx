import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CostAnalysisChart = ({ className = '' }) => {
  const data = [
    { month: 'Ene', requested: 125000, approved: 98000, savings: 27000 },
    { month: 'Feb', requested: 142000, approved: 118000, savings: 24000 },
    { month: 'Mar', requested: 138000, approved: 112000, savings: 26000 },
    { month: 'Abr', requested: 156000, approved: 128000, savings: 28000 },
    { month: 'May', requested: 168000, approved: 142000, savings: 26000 },
    { month: 'Jun', requested: 159000, approved: 135000, savings: 24000 },
    { month: 'Jul', requested: 174000, approved: 148000, savings: 26000 },
    { month: 'Ago', requested: 182000, approved: 156000, savings: 26000 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{`${label} 2024`}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {`${entry?.name}: €${entry?.value?.toLocaleString('es-ES')}`}
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
          Análisis de Costos
        </h3>
        <p className="text-sm text-text-secondary">
          Comparación entre montos solicitados y aprobados
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRequested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickFormatter={(value) => `€${(value / 1000)?.toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="requested"
              stackId="1"
              stroke="var(--color-accent)"
              fillOpacity={1}
              fill="url(#colorRequested)"
              name="Solicitado"
            />
            <Area
              type="monotone"
              dataKey="approved"
              stackId="2"
              stroke="var(--color-success)"
              fillOpacity={1}
              fill="url(#colorApproved)"
              name="Aprobado"
            />
            <Area
              type="monotone"
              dataKey="savings"
              stackId="3"
              stroke="var(--color-secondary)"
              fillOpacity={1}
              fill="url(#colorSavings)"
              name="Ahorro"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostAnalysisChart;