import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DateRangeSelector = ({ onDateRangeChange, className = '' }) => {
  const [selectedRange, setSelectedRange] = useState('30d');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustom, setShowCustom] = useState(false);

  const predefinedRanges = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último año' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    if (range !== 'custom') {
      setShowCustom(false);
      onDateRangeChange?.(range);
    } else {
      setShowCustom(true);
    }
  };

  const handleCustomRangeApply = () => {
    if (customRange?.startDate && customRange?.endDate) {
      onDateRangeChange?.(customRange);
      setShowCustom(false);
    }
  };

  const formatDateForInput = (date) => {
    return date?.toISOString()?.split('T')?.[0];
  };

  const getDefaultDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate?.setDate(startDate?.getDate() - 30);
    
    return {
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate)
    };
  };

  React.useEffect(() => {
    if (!customRange?.startDate && !customRange?.endDate) {
      const defaultDates = getDefaultDates();
      setCustomRange(defaultDates);
    }
  }, []);

  return (
    <div className={`bg-card border border-border rounded-lg p-4 shadow-card ${className}`}>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Calendar" size={20} className="text-primary" />
          <h3 className="text-sm font-medium text-foreground">Período de Análisis</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {predefinedRanges?.map((range) => (
            <Button
              key={range?.value}
              variant={selectedRange === range?.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeSelect(range?.value)}
              className="text-xs"
            >
              {range?.label}
            </Button>
          ))}
        </div>

        {showCustom && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={customRange?.startDate}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, startDate: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={customRange?.endDate}
                  onChange={(e) => setCustomRange(prev => ({ ...prev, endDate: e?.target?.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustom(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleCustomRangeApply}
                disabled={!customRange?.startDate || !customRange?.endDate}
              >
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;