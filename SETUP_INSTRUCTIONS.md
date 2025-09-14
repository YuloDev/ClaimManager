# 🚀 Instrucciones de Configuración - ClaimManager

## 📋 Requisitos Previos

- Node.js (v14.x o superior)
- npm o yarn
- Proyecto Supabase configurado
- API Backend corriendo en `http://127.0.0.1:8005`

## 🛠️ Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Configuration
NODE_ENV=development
```

**⚠️ Importante:** Reemplaza los valores con los de tu proyecto Supabase real.

### 3. Iniciar el Servidor de Desarrollo

```bash
npm start
```

El servidor se iniciará en: `http://localhost:4028`

## 🔧 Nueva Funcionalidad: Gestión de Niveles de Riesgo

### Descripción

Se ha agregado una nueva funcionalidad para gestionar los **Niveles de Riesgo** además de los pesos de riesgo existentes. Esta funcionalidad permite configurar rangos de puntuación para clasificar el riesgo en diferentes niveles.

### Características

- **Gestión Visual**: Interfaz intuitiva con colores distintivos para cada nivel
- **Validación Automática**: Previene solapamientos y valores inválidos
- **Edición en Tiempo Real**: Modificación directa de rangos mín/máx
- **Persistencia**: Guarda cambios en el backend automáticamente

### API Endpoint

La funcionalidad utiliza el siguiente endpoint:

```http
PUT http://127.0.0.1:8005/risk-levels
Content-Type: application/json

{
  "RISK_LEVELS": {
    "bajo": [0, 39],
    "medio": [40, 69], 
    "alto": [70, 100]
  }
}
```

### Ubicación en la UI

La gestión de niveles de riesgo se encuentra en:
- **Dashboard de Afiliado** (`/affiliate-dashboard`)
- **Panel lateral derecho** (junto a Pesos de Riesgo)

### Archivos Creados/Modificados

#### Nuevos Archivos:
- `src/services/riskService.js` - Servicio para gestión de riesgo
- `src/components/risk/RiskLevelsManager.jsx` - Componente UI para niveles

#### Archivos Modificados:
- `src/pages/affiliate-dashboard/index.jsx` - Integración del componente

### Funcionalidades del Componente

1. **Carga Automática**: Obtiene niveles existentes al inicializar
2. **Edición Individual**: Permite editar cada nivel por separado
3. **Validaciones**:
   - Rangos entre 0-100
   - Mínimo < Máximo
   - Sin solapamientos entre niveles
4. **Indicadores Visuales**:
   - 🟢 Bajo (verde)
   - 🟡 Medio (amarillo)
   - 🔴 Alto (rojo)

### Uso

1. **Ver Niveles**: Los niveles se cargan automáticamente
2. **Editar**: Click en "Editar" para modificar un nivel
3. **Modificar Rangos**: Ajustar valores mín/máx
4. **Guardar**: Click en "Guardar Cambios" para persistir
5. **Validación**: El sistema valida automáticamente los rangos

## 🔍 Solución de Problemas

### Error de Conexión con Backend

Si ves errores relacionados con `http://127.0.0.1:8005`:

1. Verifica que tu API backend esté corriendo
2. Confirma que el endpoint `/risk-levels` esté disponible
3. Revisa la configuración de CORS en el backend

### Error de Supabase

Si hay problemas de conexión con Supabase:

1. Verifica las variables de entorno en `.env`
2. Confirma que tu proyecto Supabase esté activo
3. Revisa las credenciales en el dashboard de Supabase

### Problemas de Dependencias

Si hay errores al instalar dependencias:

```bash
# Limpiar cache y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Estructura del Proyecto

```
src/
├── components/
│   ├── risk/
│   │   └── RiskLevelsManager.jsx    # Nuevo componente
│   └── ui/
├── pages/
│   └── affiliate-dashboard/
│       └── index.jsx                # Modificado
├── services/
│   └── riskService.js              # Nuevo servicio
└── ...
```

## 🎯 Próximos Pasos

1. Configurar el backend para soportar el endpoint `/risk-levels`
2. Probar la funcionalidad completa con datos reales
3. Agregar tests unitarios para el nuevo servicio
4. Considerar agregar más validaciones según necesidades del negocio

---

**✅ Estado Actual**: Funcionalidad implementada y lista para pruebas con backend real.
