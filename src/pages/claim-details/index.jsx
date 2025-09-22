// src/pages/claim-details/index.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import EmbeddedFooter from 'pages/claim-submission/components/EmbebedFooter';
import riskService from '../../services/riskService';

const Badge = ({ children, tone = 'default' }) => {
  const tones = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    warn: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    default: 'bg-muted text-foreground border-border',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md border ${tones[tone] || tones.default}`}
    >
      {children}
    </span>
  );
};

// 🔹 Componente para detalles colapsables específicos
const CollapsibleDetail = ({ title, data, level = 0, showAsJson = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const indentClass = `ml-${level * 4}`;
  
  if (data === null || data === undefined) {
    return <span className="italic text-text-secondary">—</span>;
  }
  
  if (typeof data === 'boolean') {
    return <span>{data ? 'Sí' : 'No'}</span>;
  }
  
  if (typeof data === 'string' || typeof data === 'number') {
    return <span>{String(data)}</span>;
  }
  
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="italic text-text-secondary">[vacío]</span>;
    }
    
    return (
      <div className={indentClass}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-foreground transition-colors"
        >
          <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          <span>{title}</span>
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {data.map((item, idx) => (
              <div key={idx} className="text-xs">
                <span className="text-text-secondary">[{idx + 1}]:</span>{' '}
                <CollapsibleDetail data={item} level={level + 1} showAsJson={showAsJson} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="italic text-text-secondary">[vacío]</span>;
    }
    
    return (
      <div className={indentClass}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-foreground transition-colors"
        >
          <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          <span>{title}</span>
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {showAsJson && level === 0 ? (
              // Mostrar como JSON formateado solo en el nivel raíz
              <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-96 overflow-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ) : (
              // Mostrar como estructura colapsable normal
              entries.map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="font-medium text-text-secondary">{key}:</span>{' '}
                  <CollapsibleDetail data={value} level={level + 1} showAsJson={showAsJson} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
  
  return <span>{String(data)}</span>;
};

// 🔹 Renderizador flexible de detalle (strings, bool, objetos, arrays)
const RenderDetalle = ({ detalle, checkName, resumen }) => {
  // Para el check específico de capas múltiples, mostrar recomendación + detalle colapsable
  if (checkName === "Presencia de capas múltiples (análisis integrado)") {
    return (
      <div className="space-y-2">
        {/* Mostrar recomendaciones si existen */}
        {resumen?.recommendations && resumen.recommendations.length > 0 && (
          <div className="text-xs">
            <div className="font-medium text-text-secondary mb-1">Recomendación:</div>
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              {resumen.recommendations.map((rec, idx) => (
                <div key={idx} className="text-blue-800">• {rec}</div>
              ))}
            </div>
          </div>
        )}
        
        {/* Detalle técnico como JSON formateado con opción de expandir/contraer */}
        <div className="text-xs">
          <CollapsibleDetail title="Detalle técnico" data={detalle} showAsJson={true} />
        </div>
      </div>
    );
  }
  
  if (detalle === null || detalle === undefined)
    return <span className="italic text-text-secondary">—</span>;
  if (typeof detalle === 'boolean') return <span>{detalle ? 'Sí' : 'No'}</span>;
  if (typeof detalle === 'string' || typeof detalle === 'number')
    return <span>{String(detalle)}</span>;

  if (Array.isArray(detalle)) {
    if (detalle.length === 0)
      return <span className="italic text-text-secondary">[vacío]</span>;
    return (
      <ul className="list-disc list-inside text-xs break-words">
        {detalle.map((item, idx) => (
          <li key={idx}>
            <RenderDetalle detalle={item} checkName={checkName} resumen={resumen} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof detalle === 'object') {
    return (
      <div className="text-xs bg-muted p-2 rounded break-words max-h-40 overflow-auto">
        {Object.entries(detalle).map(([k, v]) => (
          <div key={k}>
            <span className="font-medium">{k}:</span>{' '}
            <RenderDetalle detalle={v} checkName={checkName} resumen={resumen} />
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(detalle)}</span>;
};

// 🔹 Función para verificar si un detalle está vacío (recursiva)
const isDetalleEmpty = (detalle) => {
  if (detalle === null || detalle === undefined) return true;
  
  if (typeof detalle === 'string') {
    return detalle.trim() === '' || detalle === '[vacío]';
  }
  
  if (typeof detalle === 'number') {
    return false; // Los números siempre se consideran no vacíos
  }
  
  if (typeof detalle === 'boolean') {
    return false; // Los booleanos siempre se consideran no vacíos
  }
  
  if (Array.isArray(detalle)) {
    return detalle.length === 0;
  }
  
  if (typeof detalle === 'object') {
    if (Object.keys(detalle).length === 0) return true;
    
    // Verificar recursivamente si todos los valores del objeto están vacíos
    return Object.values(detalle).every(value => isDetalleEmpty(value));
  }
  
  return false;
};

const ClaimDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [footerH, setFooterH] = useState(72);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState(null);
  const [riskLevels, setRiskLevels] = useState({
    aprobado: [0, 20],
    revision: [21, 50],
    rechazado: [51, 100],
  });
  const [claimSent, setClaimSent] = useState(false);
  const [activeTab, setActiveTab] = useState('todas'); // Estado para el tab activo

const getAdjustedScore = (doc) => {
  return Number(doc?.validation?.riesgo?.score ?? 0);
};



  // Cargar niveles de riesgo desde el servidor
  useEffect(() => {
    const fetchRiskLevels = async () => {
      try {
        const levels = await riskService.getRiskLevels();
        setRiskLevels(levels);
      } catch (error) {
        console.error('Error al cargar niveles de riesgo:', error);
      }
    };

    fetchRiskLevels();
  }, []);

  const N8N_WEBHOOK_URL =
    import.meta.env.VITE_N8N_WEBHOOK_URL ||
    'https://n8n.nextisolutions.com/webhook-test/3767beb5-1550-4824-8ec9-ca5810946cb8';

  const EMBED_URL =
    import.meta.env.VITE_EMBED_URL ||
    'https://n8n.nextisolutions.com/workflow/Wf0FgM2AETDcrbli';

  const apiResponse = useMemo(
    () => location?.state?.apiResponse ?? null,
    [location?.state?.apiResponse]
  );

  const patientInfo = apiResponse?.patientInfo || {};
  const diagnosis = apiResponse?.diagnosis || {};
  const results = Array.isArray(apiResponse?.results) ? apiResponse.results : [];
  const attachments = Array.isArray(apiResponse?.attachments) ? apiResponse.attachments : [];

  const validated = results;


  const formatMoney = (v) =>
    new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(v || 0));

  const stateTone = (sri_estado) => {
    const s = String(sri_estado || '').toUpperCase();
    if (s === 'AUTORIZADA' || s === 'AUTORIZADO') return 'success';
    if (s === 'RECHAZADA' || s === 'NO AUTORIZADA') return 'danger';
    return 'info';
  };

  const getStateFromScore = (score) => {
    for (const [levelName, [min, max]] of Object.entries(riskLevels)) {
      if (score >= min && score <= max) {
        return levelName;
      }
    }
    // Si el score es mayor a 100, considerarlo como rechazado
    if (score > 100) {
      return 'rechazado';
    }
    return 'unknown';
  };

  const getStateDisplayName = (levelName) => {
    const displayNames = {
      aprobado: 'Aprobado',
      revision: 'En Revisión',
      rechazado: 'Rechazado',
      bajo: 'Aprobado',
      medio: 'En Revisión',
      alto: 'Rechazado',
    };
    return displayNames[levelName] || levelName;
  };

  const getStateBackgroundClass = (levelName) => {
    const colors = {
      aprobado: 'bg-emerald-50',
      revision: 'bg-amber-50',
      rechazado: 'bg-rose-50',
      bajo: 'bg-emerald-50',
      medio: 'bg-amber-50',
      alto: 'bg-rose-50',
    };
    return colors[levelName] || '';
  };

  const getStateBadgeClass = (levelName) => {
    const styles = {
      aprobado:
        'px-2 py-1 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-medium',
      revision:
        'px-2 py-1 rounded-md border border-amber-300 bg-amber-50 text-amber-800 text-xs font-medium',
      rechazado:
        'px-2 py-1 rounded-md border border-red-300 bg-red-50 text-red-800 text-xs font-medium',
      bajo:
        'px-2 py-1 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-medium',
      medio:
        'px-2 py-1 rounded-md border border-amber-300 bg-amber-50 text-amber-800 text-xs font-medium',
      alto:
        'px-2 py-1 rounded-md border border-red-300 bg-red-50 text-red-800 text-xs font-medium',
    };
    return (
      styles[levelName] ||
      'px-2 py-1 rounded-md border border-gray-300 bg-gray-50 text-gray-800 text-xs font-medium'
    );
  };

  const determineClaimStatus = () => {
    if (!validated || validated.length === 0) return 'En Revisión';
  
    let hasRechazado = false;
    let hasEnRevision = false;
    let hasAprobado = false;
  
    validated.forEach((doc) => {
      if (doc.validationError) {
        hasRechazado = true;
        return;
      }
      const v = doc.validation;
      if (v?.riesgo) {
        const score = getAdjustedScore(doc); // 👈 ajustado
        const estado = getStateFromScore(score);
        const displayName = getStateDisplayName(estado);
        if (displayName === 'Rechazado') hasRechazado = true;
        else if (displayName === 'En Revisión') hasEnRevision = true;
        else if (displayName === 'Aprobado') hasAprobado = true;
      } else {
        hasEnRevision = true;
      }
    });
  
    if (hasRechazado) return 'Rechazado';
    if (hasEnRevision) return 'En Revisión';
    if (hasAprobado) return 'Aprobado';
    return 'En Revisión';
  };
  

  const buildClaimPayload = () => {
    const estado = determineClaimStatus();
    const proveedor = {
      nombre: patientInfo.fullName || 'Proveedor no especificado',
      tipo_servicio:
        patientInfo.careType === 'hospitalario'
          ? 'Consulta Médica'
          : 'Otro Servicio',
    };

    return {
      proveedor,
      estado,
      monto_solicitado: parseFloat(diagnosis?.totalAmount || 0),
      moneda: '$',
      observaciones: `Reclamo procesado automáticamente. Estado determinado por validaciones: ${validated.length} documento(s) evaluado(s).`,
    };
  };

  const buildWebhookBody = () => {
    return {
      payload: {
        patientInfo,
        diagnosis,
      },
      validationResults: results,
      recetasResponse: apiResponse?.recetasResponse ?? null,
      meta: {
        source: 'ClaimDetails',
        sentAt: new Date().toISOString(),
      },
    };
  };

  const sendClaimToBackend = async () => {
    try {
      const claimPayload = buildClaimPayload();
      const CLAIMS_API_URL = 'ttps://api-forense.nextisolutions.com/reclamos';

      const res = await fetch(CLAIMS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimPayload),
      });


      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error(
          'Error al enviar reclamo automáticamente:',
          data?.message || `HTTP ${res.status}`
        );
        return;
      }

      console.log('✅ Reclamo enviado automáticamente al backend');
      setClaimSent(true);
    } catch (err) {
      console.error('❌ Error en envío automático del reclamo:', err);
    }
  };

  useEffect(() => {
    if (validated && validated.length > 0 && !claimSent) {
      console.log('🎯 Validaciones obtenidas, enviando reclamo automáticamente...');
      sendClaimToBackend();
    }
  }, [validated, claimSent]);

  const handleSendToN8N = async () => {
    setSending(true);
    setSendMsg(null);
    try {
      const body = buildWebhookBody();
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      console.log('Respuesta del N8N:', data);
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }
      setSendMsg({ ok: true, text: 'Enviado a n8n correctamente.' });



      navigate('/claim-reimbursement', {
        state: {
          reimbursement: data ?? null,
          requested: diagnosis?.totalAmount ?? 0,
        },
      });
    } catch (err) {
      setSendMsg({
        ok: false,
        text: `Error al enviar: ${String(err?.message || err)}`,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((s) => !s)}
        userRole="affiliate"
        userName="María García López"
      />
      <RoleBasedSidebar isCollapsed={sidebarCollapsed} userRole="affiliate" />

      <main
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        } pt-16`}
        style={{ paddingBottom: footerH + 24 }}
      >
        <div className="p-6">
          <div className="mb-6">
            <BreadcrumbNavigation />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Contenido principal */}
            <div className="xl:col-span-8 space-y-6">
              {/* Resumen Paciente */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Icon name="User" size={18} className="text-primary" />
                  <h3 className="text-base font-semibold">Resumen del Caso</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-text-secondary">Paciente</div>
                    <div className="font-medium truncate">
                      {patientInfo.fullName || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Póliza</div>
                    <div className="font-medium truncate">
                      {patientInfo.policyNumber || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">
                      Monto solicitado
                    </div>
                    <div className="font-medium">
                      {formatMoney(diagnosis?.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>


              {/* Resultado de validación */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="ShieldCheck" size={18} className="text-accent" />
                    <h3 className="text-base font-semibold">
                      Validación de Facturas (API)
                    </h3>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {validated.length} documento(s) evaluado(s)
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {validated.length === 0 && (
                    <div className="p-4 text-sm text-text-secondary italic">
                      No hay facturas para validar.
                    </div>
                  )}

                  {validated.map((doc, idx) => {
                    const v = doc.validation;
                    const hasError = !!doc.validationError;

                    return (
                      <div key={`${doc.filename}-${idx}`} className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate break-words max-w-[250px]">
                              {doc.filename}
                            </div>
                            <div className="text-xs text-text-secondary">
                              {doc.documentType} •{' '}
                              {Math.round((doc.size || 0) / 1024)} KB
                            </div>
                          </div>
                        </div>

                        {!hasError && v?.mensaje && (
                          <div className="mt-3 p-3 rounded-md border border-border bg-muted/30">
                            <div className="flex justify-between items-center text-sm font-medium mb-2">
                              <span>
                                Score:{' '}
                                <span className="font-bold">
                                  {getAdjustedScore(doc)}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span>Nivel:</span>
                                <span
                                  className={
                                    v?.riesgo?.score !== undefined
                                      ? getStateBadgeClass(
                                          getStateFromScore(v.riesgo.score)
                                        )
                                      : v?.riesgo?.nivel
                                      ? getStateBadgeClass(v.riesgo.nivel)
                                      : 'px-2 py-1 rounded-md border border-gray-300 bg-gray-50 text-gray-800 text-xs font-medium'
                                  }
                                >
                                  {v?.riesgo?.score !== undefined
                                    ? getStateDisplayName(
                                        getStateFromScore(v.riesgo.score)
                                      )
                                    : v?.riesgo?.nivel
                                    ? getStateDisplayName(v.riesgo.nivel)
                                    : '—'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Tabla de Niveles de Riesgo para este documento */}
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="text-xs font-medium mb-2 text-text-secondary">Niveles de Riesgo</div>
                              <div className="overflow-hidden rounded border border-border">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                      <th className="px-3 py-2 text-left font-medium">Nivel</th>
                                      <th className="px-3 py-2 text-center font-medium">Rango</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(riskLevels).map(([levelName, [min, max]]) => {
                                      const currentScore = getAdjustedScore(doc);
                                      const currentLevel = getStateFromScore(currentScore);
                                      const isCurrentLevel = currentLevel === levelName;
                                      
                                      const getLevelIcon = (levelName) => {
                                        const icons = {
                                          aprobado: '✅',
                                          revision: '⏳', 
                                          rechazado: '❌',
                                          bajo: '✅',
                                          medio: '⏳',
                                          alto: '❌'
                                        };
                                        return icons[levelName] || '⚪';
                                      };

                                      const getRowClass = (isActive) => {
                                        if (!isActive) return 'opacity-50';
                                        
                                        const colors = {
                                          aprobado: 'bg-emerald-50',
                                          revision: 'bg-amber-50',
                                          rechazado: 'bg-red-50',
                                          bajo: 'bg-emerald-50',
                                          medio: 'bg-amber-50',
                                          alto: 'bg-red-50'
                                        };
                                        return colors[levelName] || 'bg-gray-50';
                                      };

                                      return (
                                        <tr 
                                          key={levelName}
                                          className={`border-b border-border last:border-b-0 transition-all duration-200 ${getRowClass(isCurrentLevel)}`}
                                        >
                                          <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                              <span>{getLevelIcon(levelName)}</span>
                                              <span className="font-medium">{getStateDisplayName(levelName)}</span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-center font-mono">
                                            {min} - {max}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}

                        {hasError && (
                          <div className="mt-3 text-sm text-rose-600 break-words">
                            {doc.validationError}
                          </div>
                        )}

                        {!hasError && v && (
                          <details className="mt-4 group">
                            <summary className="cursor-pointer text-sm text-text-secondary hover:text-foreground">
                              Ver detalle técnico
                            </summary>

                            <div className="mt-3">
                              {/* Tabs para filtrar por tipo */}
                              <div className="mb-4">
                                <div className="flex border-b border-border">
                                  {[
                                    { key: 'todas', label: 'Todas', count: [...(v?.riesgo?.prioritarias || []), ...(v?.riesgo?.secundarias || []), ...(v?.riesgo?.adicionales || [])].length },
                                    { key: 'primaria', label: 'Primarias', count: (v?.riesgo?.prioritarias || []).length },
                                    { key: 'secundaria', label: 'Secundarias', count: (v?.riesgo?.secundarias || []).length },
                                    { key: 'adicional', label: 'Adicionales', count: (v?.riesgo?.adicionales || []).length }
                                  ].map(tab => (
                                    <button
                                      key={tab.key}
                                      onClick={() => setActiveTab(tab.key)}
                                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.key
                                          ? 'border-primary text-primary bg-primary/5'
                                          : 'border-transparent text-text-secondary hover:text-foreground hover:border-border'
                                      }`}
                                    >
                                      {tab.label}
                                      {tab.count > 0 && (
                                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                          activeTab === tab.key
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-text-secondary'
                                        }`}>
                                          {tab.count}
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Lista filtrada de revisiones */}
                              <div className="space-y-2">
                                {(() => {
                                  const allItems = [
                                    ...(v?.riesgo?.prioritarias || []).map(item => ({ ...item, type: 'Primaria' })),
                                    ...(v?.riesgo?.secundarias || []).map(item => ({ ...item, type: 'Secundaria' })),
                                    ...(v?.riesgo?.adicionales || []).map(item => ({ ...item, type: 'Adicional' }))
                                  ];
                                  
                                  const filteredItems = activeTab === 'todas' 
                                    ? allItems
                                    : allItems.filter(item => item.type.toLowerCase() === activeTab);
                                  
                                  return filteredItems;
                                })().map((item, index) => (
                                  <details key={index} className="border border-border rounded-lg overflow-hidden group">
                                    <summary className="cursor-pointer p-3 hover:bg-muted/30 transition-colors flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            item.type === 'Primaria' ? 'bg-red-100 text-red-800' :
                                            item.type === 'Secundaria' ? 'bg-amber-100 text-amber-800' :
                                            'bg-blue-100 text-blue-800'
                                          }`}>
                                            {item.type}
                                          </span>
                                          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                                            item.penalizacion > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                          }`}>
                                            {item.penalizacion > 0 ? `+${item.penalizacion}` : '0'}
                                          </span>
                                        </div>
                                        <div className="text-sm font-medium text-foreground">
                                          {item.check}
                                        </div>
                                      </div>
                                      <div className="ml-3 flex-shrink-0">
                                        <div className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity flex items-center gap-1">
                                          <span>Detalle</span>
                                          <span className="transition-transform group-open:rotate-180">▼</span>
                                        </div>
                                      </div>
                                    </summary>
                                    
                                    {/* Contenido expandible debajo */}
                                    <div className="px-3 pb-3 border-t border-border bg-muted/20">
                                      <div className="pt-3 space-y-2">
                                        <div className="text-xs">
                                          <span className="font-medium text-text-secondary">Revisión:</span>
                                          <span className="ml-2">{item.type} - {item.check}</span>
                                        </div>
                                        <div className="text-xs">
                                          <span className="font-medium text-text-secondary">Penalización:</span>
                                          <span className="ml-2 font-mono">{item.penalizacion}</span>
                                        </div>
                                        {!isDetalleEmpty(item.detalle) && (
                                          <div className="p-2 bg-card border border-border rounded text-xs">
                                            <RenderDetalle detalle={item.detalle} checkName={item.check} resumen={item.resumen} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </details>
                                ))}
                                
                                {/* Mensaje cuando no hay revisiones */}
                                {(() => {
                                  const allItems = [
                                    ...(v?.riesgo?.prioritarias || []).map(item => ({ ...item, type: 'Primaria' })),
                                    ...(v?.riesgo?.secundarias || []).map(item => ({ ...item, type: 'Secundaria' })),
                                    ...(v?.riesgo?.adicionales || []).map(item => ({ ...item, type: 'Adicional' }))
                                  ];
                                  
                                  const filteredItems = activeTab === 'todas' 
                                    ? allItems
                                    : allItems.filter(item => item.type.toLowerCase() === activeTab);
                                  
                                  if (filteredItems.length === 0) {
                                    const messages = {
                                      todas: 'Sin observaciones técnicas',
                                      primaria: 'Sin revisiones primarias',
                                      secundaria: 'Sin revisiones secundarias',
                                      adicional: 'Sin revisiones adicionales'
                                    };
                                    
                                    return (
                                      <div className="text-center py-6 text-text-secondary italic">
                                        {messages[activeTab] || 'Sin observaciones'}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-semibold mb-2">Acciones</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate('/claim-submission')}
                    className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted/50"
                  >
                    Editar envío
                  </button>
                  <button
                    onClick={handleSendToN8N}
                    disabled={sending}
                    className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {sending ? 'Enviando…' : 'Enviar'}
                  </button>
                </div>

                {sendMsg && (
                  <div
                    className={`mt-3 text-xs p-2 rounded border ${
                      sendMsg.ok
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                  >
                    {sendMsg.text}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-semibold mb-2">
                  Resumen de validación
                </div>
                <div className="text-sm text-text-secondary">
                  Evaluadas: {validated.length}
                  <br />
                  Con error:{' '}
                  {validated.filter((d) => d.validationError).length}
                </div>

                {claimSent && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-emerald-600 flex items-center gap-1">
                      <span>✅</span>
                      <span>Reclamo enviado automáticamente</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Promedio de Riesgo */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Icon name="BarChart3" size={16} className="text-primary" />
                  Promedio de Riesgo
                </div>
                {(() => {
                  // Calcular promedio de riesgo
                  const validDocs = validated.filter(doc => !doc.validationError && doc.validation?.riesgo?.score !== undefined);
                  
                  if (validDocs.length === 0) {
                    return (
                      <div className="text-sm text-text-secondary italic">
                        No hay documentos válidos para calcular promedio
                      </div>
                    );
                  }

                  const totalScore = validDocs.reduce((sum, doc) => sum + getAdjustedScore(doc), 0);
                  const averageScore = Math.round(totalScore / validDocs.length);
                  const averageLevel = getStateFromScore(averageScore);
                  const averageDisplayName = getStateDisplayName(averageLevel);

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Score promedio:</span>
                        <span className="text-lg font-bold text-foreground">{averageScore}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Nivel promedio:</span>
                        <span className={getStateBadgeClass(averageLevel)}>
                          {averageDisplayName}
                        </span>
                      </div>

                      <div className="text-xs text-text-secondary pt-2 border-t border-border">
                        Calculado sobre {validDocs.length} documento{validDocs.length !== 1 ? 's' : ''} válido{validDocs.length !== 1 ? 's' : ''}
                      </div>

                      {/* Distribución por archivo */}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-text-secondary hover:text-foreground py-1">
                          Ver distribución por archivo
                        </summary>
                        <div className="mt-2 space-y-1 pl-2">
                          {validDocs.map((doc, idx) => {
                            const score = getAdjustedScore(doc);
                            const level = getStateFromScore(score);
                            return (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="truncate max-w-[180px]" title={doc.filename}>
                                  {doc.filename}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{score}</span>
                                  <span className={`px-1 py-0.5 rounded text-xs ${
                                    level === 'aprobado' || level === 'bajo' ? 'bg-emerald-100 text-emerald-800' :
                                    level === 'revision' || level === 'medio' ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {getStateDisplayName(level)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
        <EmbeddedFooter
          src={EMBED_URL}
          title="Información relacionada"
          collapsedHeight={72}
          expandedHeight={420}
          defaultExpanded={false}
          onHeightChange={setFooterH}
          allow="clipboard-write; clipboard-read"
          sandbox="allow-scripts allow-forms allow-same-origin"
        />
      </main>
    </div>
  );
};

export default ClaimDetails;
