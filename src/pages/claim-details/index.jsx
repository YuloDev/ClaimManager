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
      className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md border ${tones[tone] || tones.default
        }`}
    >
      {children}
    </span>
  );
};

// 🔹 Renderizador flexible de detalle (strings, bool, objetos, arrays)
const RenderDetalle = ({ detalle }) => {
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
            <RenderDetalle detalle={item} />
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
            <span className="font-medium">{k}:</span> <RenderDetalle detalle={v} />
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(detalle)}</span>;
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
    rechazado: [51, 100]
  });

  // Cargar niveles de riesgo desde el servidor
  useEffect(() => {
    const fetchRiskLevels = async () => {
      try {
        const levels = await riskService.getRiskLevels();
        setRiskLevels(levels);
      } catch (error) {
        console.error('Error al cargar niveles de riesgo:', error);
        // Mantener valores por defecto si hay error
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
  const results = Array.isArray(apiResponse?.results)
    ? apiResponse.results
    : [];
  const attachments = Array.isArray(apiResponse?.attachments)
    ? apiResponse.attachments
    : [];

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

  // Función para determinar el estado basado en el score y niveles dinámicos
  const getStateFromScore = (score) => {
    for (const [levelName, [min, max]] of Object.entries(riskLevels)) {
      if (score >= min && score <= max) {
        return levelName;
      }
    }
    return 'unknown';
  };

  // Función para obtener el nombre de display del estado
  const getStateDisplayName = (levelName) => {
    const displayNames = {
      aprobado: 'Aprobado',
      revision: 'En Revisión',
      rechazado: 'Rechazado',
      // Mapeo para nombres antiguos
      bajo: 'Aprobado',
      medio: 'En Revisión',
      alto: 'Rechazado'
    };
    return displayNames[levelName] || levelName;
  };

  // Función para obtener el color de fondo basado en el estado
  const getStateBackgroundClass = (levelName) => {
    const colors = {
      aprobado: 'bg-emerald-50',
      revision: 'bg-amber-50',
      rechazado: 'bg-rose-50',
      // Mapeo para nombres antiguos
      bajo: 'bg-emerald-50',
      medio: 'bg-amber-50',
      alto: 'bg-rose-50'
    };
    return colors[levelName] || '';
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
        className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
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

              {/* Resultado de validación por documento */}
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
                    const esFalso = v?.riesgo?.es_falso === true;

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
                            <div className="flex justify-between text-sm font-medium mb-2">
                              <span>Score: <span className="font-bold">{v?.riesgo?.score ?? "—"}</span></span>
                              <span>Nivel: <span className="capitalize">{v?.riesgo?.nivel ?? "—"}</span></span>
                            </div>

                            {/* Tabla de rangos */}
                            <table className="w-full text-xs border border-border rounded">
                              <thead className="bg-muted text-foreground/80">
                                <tr>
                                  <th className="border border-border px-2 py-1 text-left">Rango</th>
                                  <th className="border border-border px-2 py-1 text-left">Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(riskLevels).map(([levelName, [min, max]]) => {
                                  const currentScore = v?.riesgo?.score ?? 0;
                                  const isCurrentLevel = currentScore >= min && currentScore <= max;
                                  const bgClass = isCurrentLevel ? getStateBackgroundClass(levelName) : '';
                                  
                                  return (
                                    <tr key={levelName} className={bgClass}>
                                      <td className="border border-border px-2 py-1">
                                        {min} - {max}
                                      </td>
                                      <td className="border border-border px-2 py-1">
                                        {getStateDisplayName(levelName)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          // <div className="mt-3 text-sm text-foreground/80 break-words">
                          //   {v.mensaje}
                          // </div>
                        )}
                        {hasError && (
                          <div className="mt-3 text-sm text-rose-600 break-words">
                            {doc.validationError}
                          </div>
                        )}

                        {!hasError && v && (
                          <details
                            className="mt-4 group"
                            onToggle={(e) => {
                              if (e.target.open) {
                                e.target.scrollIntoView({ behavior: "smooth", block: "nearest" });
                              }
                            }}
                          >
                            <summary className="cursor-pointer text-sm text-text-secondary hover:text-foreground">
                              Ver detalle técnico
                            </summary>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Prioritarias */}
                              <div className="rounded-md border border-border p-3">
                                <div className="text-xs font-medium mb-2">
                                  Revisiones MetaData primarias
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {(v?.riesgo?.prioritarias || []).map(
                                    (p, i) => (
                                      <li
                                        key={i}
                                        className="border-b last:border-0 border-border pb-2"
                                      >
                                        <div className="font-medium">
                                          {p.check}
                                        </div>
                                        <div className="text-text-secondary">
                                          <RenderDetalle detalle={p.detalle} />
                                        </div>
                                        <div className="text-xs">
                                          Penalización: {p.penalizacion}
                                        </div>
                                      </li>
                                    )
                                  )}
                                  {(v?.riesgo?.prioritarias || []).length ===
                                    0 && (
                                      <li className="text-text-secondary italic">
                                        Sin observaciones.
                                      </li>
                                    )}
                                </ul>
                              </div>

                              {/* Secundarias */}
                              <div className="rounded-md border border-border p-3">
                                <div className="text-xs font-medium mb-2">
                                  Revisiones MetaData secundarias
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {(v?.riesgo?.secundarias || []).map(
                                    (p, i) => (
                                      <li
                                        key={i}
                                        className="border-b last:border-0 border-border pb-2"
                                      >
                                        <div className="font-medium">
                                          {p.check}
                                        </div>
                                        <div className="text-text-secondary">
                                          <RenderDetalle detalle={p.detalle} />
                                        </div>
                                        <div className="text-xs">
                                          Penalización: {p.penalizacion}
                                        </div>
                                      </li>
                                    )
                                  )}
                                  {(v?.riesgo?.secundarias || []).length ===
                                    0 && (
                                      <li className="text-text-secondary italic">
                                        Sin observaciones.
                                      </li>
                                    )}
                                </ul>
                              </div>

                              {/* Adicionales */}
                              <div className="rounded-md border border-border p-3 md:col-span-2">
                                <div className="text-xs font-medium mb-2">
                                  Revisiones adicionales
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {(v?.riesgo?.adicionales || []).map(
                                    (p, i) => (
                                      <li
                                        key={i}
                                        className="border-b last:border-0 border-border pb-2"
                                      >
                                        <div className="font-medium">
                                          {p.check}
                                        </div>
                                        <div className="text-text-secondary">
                                          <RenderDetalle detalle={p.detalle} />
                                        </div>
                                        <div className="text-xs">
                                          Penalización: {p.penalizacion}
                                        </div>
                                      </li>
                                    )
                                  )}
                                  {(v?.riesgo?.adicionales || []).length ===
                                    0 && (
                                      <li className="text-text-secondary italic">
                                        Sin observaciones.
                                      </li>
                                    )}
                                </ul>
                              </div>

                              {/* Metadatos */}
                              {v?.riesgo?.metadatos && (
                                <div className="rounded-md border border-border p-3 md:col-span-2">
                                  <div className="text-xs font-medium mb-2">
                                    Metadatos del documento
                                  </div>
                                  <RenderDetalle detalle={v.riesgo.metadatos} />
                                </div>
                              )}
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
                    className={`mt-3 text-xs p-2 rounded border ${sendMsg.ok
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
                  Con error: {validated.filter((d) => d.validationError).length}
                </div>
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
