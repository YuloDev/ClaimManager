import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import riskService from '../../services/riskService';

const RiskLevelsManager = () => {
  const [riskLevels, setRiskLevels] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [isUsingDefaults, setIsUsingDefaults] = useState(false);

  // Cargar niveles de riesgo al montar el componente
  useEffect(() => {
    fetchRiskLevels();
  }, []);

  const fetchRiskLevels = async () => {
    try {
      setLoading(true);
      setIsUsingDefaults(false);
      
      const response = await fetch('http://127.0.0.1:8005/risk-levels');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const levels = data?.RISK_LEVELS || data;
      
      if (levels) {
        setRiskLevels(levels);
      } else {
        throw new Error('No se encontraron niveles de riesgo en la respuesta');
      }
    } catch (error) {
      console.error('Error al cargar niveles de riesgo:', error);
      setIsUsingDefaults(true);
      
      // Usar valores por defecto
      const defaultLevels = {
        aprobado: [0, 39],
        revision: [40, 69],
        rechazado: [70, 100]
      };
      
      setRiskLevels(defaultLevels);
      toast.warn('⚠️ Usando configuración por defecto. Verifique la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevels = async () => {
    try {
      setSaving(true);
      
      // Validar niveles antes de guardar
      riskService.validateRiskLevels(riskLevels);
      
      const updatedLevels = await riskService.updateRiskLevels(riskLevels);
      setRiskLevels(updatedLevels);
      toast.success('✅ Niveles de riesgo actualizados correctamente');
      setEditingLevel(null);
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLevelChange = (levelName, type, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return; // No actualizar si el valor no es válido
    }

    setRiskLevels(prev => ({
      ...prev,
      [levelName]: type === 'min' 
        ? [numValue, prev[levelName][1]]
        : [prev[levelName][0], numValue]
    }));
  };

  const getLevelColor = (levelName) => {
    const colors = {
      aprobado: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      revision: 'bg-amber-50 border-amber-200 text-amber-800',
      rechazado: 'bg-red-50 border-red-200 text-red-800',
      // Mapeo para nombres antiguos que puedan venir del servidor
      bajo: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      medio: 'bg-amber-50 border-amber-200 text-amber-800',
      alto: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[levelName] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getLevelIcon = (levelName) => {
    const icons = {
      aprobado: '✅',
      revision: '⏳', 
      rechazado: '❌',
      // Mapeo para nombres antiguos que puedan venir del servidor
      bajo: '✅',
      medio: '⏳',
      alto: '❌'
    };
    return icons[levelName] || '⚪';
  };

  const getLevelDisplayName = (levelName) => {
    const displayNames = {
      aprobado: 'Aprobado',
      revision: 'En revisión',
      rechazado: 'Rechazado',
      // Mapeo para nombres antiguos que puedan venir del servidor
      bajo: 'Aprobado',
      medio: 'En revisión',
      alto: 'Rechazado'
    };
    return displayNames[levelName] || levelName;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-base font-semibold mb-4">Estados de Reclamos</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-text-secondary">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Estados de Reclamos</h3>
          {isUsingDefaults && (
            <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
              Por defecto
            </span>
          )}
        </div>
        <span className="text-xs text-text-secondary">Rangos de 0-100</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(riskLevels).map(([levelName, [min, max]]) => (
          <div 
            key={levelName}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${getLevelColor(levelName)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getLevelIcon(levelName)}</span>
                <span className="font-medium">{getLevelDisplayName(levelName)}</span>
              </div>
              <button
                onClick={() => setEditingLevel(editingLevel === levelName ? null : levelName)}
                className="text-xs px-2 py-1 rounded bg-white/50 hover:bg-white/80 transition-colors whitespace-nowrap"
              >
                {editingLevel === levelName ? '✕' : '✏️'}
              </button>
            </div>

            {editingLevel === levelName ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium w-12">Mín:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={min}
                    onChange={(e) => handleLevelChange(levelName, 'min', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium w-12">Máx:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={max}
                    onChange={(e) => handleLevelChange(levelName, 'max', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono">
                  {min} - {max}
                </span>
                <span className="text-xs opacity-75">
                  {max - min + 1} puntos
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingLevel && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => setEditingLevel(null)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveLevels}
            disabled={saving}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <p className="mb-1">💡 <strong>Configuración de Estados:</strong></p>
        <ul className="space-y-1 ml-4">
          <li>• <strong>✅ Aprobado</strong>: Reclamos con bajo riesgo de fraude</li>
          <li>• <strong>⏳ En revisión</strong>: Reclamos que requieren análisis adicional</li>
          <li>• <strong>❌ Rechazado</strong>: Reclamos con alto riesgo de fraude</li>
        </ul>
        
        {isUsingDefaults && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-amber-800 font-medium">⚠️ Modo sin conexión</p>
            <p className="text-amber-700">
              No se pudo conectar con el servidor. Los cambios no se guardarán hasta restablecer la conexión.
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default RiskLevelsManager;
