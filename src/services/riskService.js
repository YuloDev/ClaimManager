// Servicio para gestión de riesgo (pesos y niveles)
const API_BASE_URL = 'https://api-forense.nextisolutions.com';

export const riskService = {
  // ---------------- PESOS DE RIESGO ----------------
  
  // Obtener pesos de riesgo
  async getRiskWeights() {
    try {
      const response = await fetch(`${API_BASE_URL}/config/risk-weights`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data?.RISK_WEIGHTS || {};
    } catch (error) {
      console.error('Error al obtener pesos de riesgo:', error);
      throw new Error('No se pudieron cargar los pesos de riesgo');
    }
  },

  // Actualizar pesos de riesgo
  async updateRiskWeights(riskWeights) {
    try {
      const response = await fetch(`${API_BASE_URL}/config/risk-weights`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ RISK_WEIGHTS: riskWeights }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data?.RISK_WEIGHTS || riskWeights;
    } catch (error) {
      console.error('Error al actualizar pesos de riesgo:', error);
      throw error;
    }
  },

  // ---------------- NIVELES DE RIESGO ----------------
  
  // Obtener niveles de riesgo
  async getRiskLevels() {
    try {
      const response = await fetch(`${API_BASE_URL}/risk-levels`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data?.RISK_LEVELS || data || {
        aprobado: [0, 39],
        revision: [40, 69],
        rechazado: [70, 100]
      };
    } catch (error) {
      console.error('Error al obtener niveles de riesgo:', error);
      console.warn('Usando valores por defecto para niveles de riesgo');
      // Retornar valores por defecto solo si hay error de conexión
      return {
        aprobado: [0, 39],
        revision: [40, 69],
        rechazado: [70, 100]
      };
    }
  },

  // Actualizar niveles de riesgo
  async updateRiskLevels(riskLevels) {
    try {
      const response = await fetch(`${API_BASE_URL}/risk-levels`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ RISK_LEVELS: riskLevels }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data?.RISK_LEVELS || riskLevels;
    } catch (error) {
      console.error('Error al actualizar niveles de riesgo:', error);
      throw error;
    }
  },

  // ---------------- UTILIDADES ----------------
  
  // Validar que los niveles de riesgo no se solapen
  validateRiskLevels(riskLevels) {
    const levels = Object.entries(riskLevels);
    
    for (let i = 0; i < levels.length; i++) {
      const [levelName, [min, max]] = levels[i];
      
      // Validar que min < max
      if (min >= max) {
        throw new Error(`El nivel "${levelName}" tiene un rango inválido: ${min} debe ser menor que ${max}`);
      }
      
      // Validar que esté en el rango 0-100
      if (min < 0 || max > 100) {
        throw new Error(`El nivel "${levelName}" debe estar en el rango 0-100`);
      }
    }
    
    // Ordenar por valor mínimo para verificar solapamientos
    const sortedLevels = levels.sort((a, b) => a[1][0] - b[1][0]);
    
    for (let i = 0; i < sortedLevels.length - 1; i++) {
      const currentMax = sortedLevels[i][1][1];
      const nextMin = sortedLevels[i + 1][1][0];
      
      if (currentMax >= nextMin) {
        throw new Error(`Los niveles "${sortedLevels[i][0]}" y "${sortedLevels[i + 1][0]}" se solapan`);
      }
    }
    
    return true;
  },

  // Obtener el nivel de riesgo para un puntaje dado
  getRiskLevelForScore(score, riskLevels) {
    for (const [levelName, [min, max]] of Object.entries(riskLevels)) {
      if (score >= min && score <= max) {
        return levelName;
      }
    }
    return 'desconocido';
  }
};

export default riskService;
