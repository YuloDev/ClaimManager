// src/pages/claim-details/index.jsx
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';

const Badge = ({ children, tone = 'default' }) => {
  const tones = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    warn: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    default: 'bg-muted text-foreground border-border',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-md border ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
};

const ClaimDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // NUEVO: estado de envío al webhook
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState(null);

  // URL del webhook (env + fallback)
  const N8N_WEBHOOK_URL =
    import.meta.env.VITE_N8N_WEBHOOK_URL ||
    'https://n8n.nextisolutions.com/webhook-test/3767beb5-1550-4824-8ec9-ca5810946cb8';

  // ====== Toma la respuesta tal cual del navigate ======
  const apiResponse = useMemo(() => location?.state?.apiResponse ?? null, [location?.state?.apiResponse]);

  const patientInfo = apiResponse?.patientInfo || {};
  const diagnosis = apiResponse?.diagnosis || {};
  const results = Array.isArray(apiResponse?.results) ? apiResponse.results : [];
  const attachments = Array.isArray(apiResponse?.attachments) ? apiResponse.attachments : []; // ← base64 de “otros documentos”

  const validated = results.filter(r => r.documentType === 'factura');
  const formatMoney = (v) =>
    new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(Number(v || 0));

  const stateTone = (sri_estado) => {
    const s = String(sri_estado || '').toUpperCase();
    if (s === 'AUTORIZADA' || s === 'AUTORIZADO') return 'success';
    if (s === 'RECHAZADA' || s === 'NO AUTORIZADA') return 'danger';
    return 'info';
  };

  // ===== Enviar al webhook de n8n =====
  const buildWebhookBody = () => {
    return {
      payload: {
        patientInfo,
        diagnosis,
      },
      // solo guardamos los resultados del API de validación (facturas)
      validationResults: results,
      // 🔹 incluimos directamente la respuesta del webhook de recetas
      recetasResponse: apiResponse?.recetasResponse ?? null,
      meta: {
        source: "ClaimDetails",
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

      // 🚀 Redirigir a ClaimReimbursement con los datos de respuesta
      navigate('/claim-reimbursement', {
        state: {
          reimbursement: data ?? null,   // 👈 aquí pasamos el objeto completo
          requested: diagnosis?.totalAmount ?? 0,
        },
      });

    } catch (err) {
      setSendMsg({ ok: false, text: `Error al enviar: ${String(err?.message || err)}` });
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(s => !s)}
        userRole="affiliate"
        userName="María García López"
      />
      <RoleBasedSidebar isCollapsed={sidebarCollapsed} userRole="affiliate" />

      <main className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} pt-16`}>
        <div className="p-6">
          <div className="mb-6"><BreadcrumbNavigation /></div>

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
                    <div className="font-medium truncate">{patientInfo.fullName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Póliza</div>
                    <div className="font-medium truncate">{patientInfo.policyNumber || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Monto solicitado</div>
                    <div className="font-medium">{formatMoney(diagnosis?.totalAmount)}</div>
                  </div>
                </div>
              </div>

              {/* Resultado de validación por documento */}
              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="ShieldCheck" size={18} className="text-accent" />
                    <h3 className="text-base font-semibold">Validación de Facturas (API)</h3>
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
                    const estado = v?.sri_estado || '—';
                    const verificado = v?.sri_verificado === true;
                    const nivel = v?.riesgo?.nivel || '—';
                    const score = v?.riesgo?.score ?? null;

                    return (
                      <div key={`${doc.filename}-${idx}`} className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{doc.filename}</div>
                            <div className="text-xs text-text-secondary">
                              {doc.documentType} • {Math.round((doc.size || 0) / 1024)} KB
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {hasError ? (
                              <Badge tone="danger">Error en validación</Badge>
                            ) : (
                              <>
                                <Badge tone={stateTone(estado)}>{estado} POR SRI</Badge>
                                <Badge tone={verificado ? 'success' : 'warn'}>
                                  {verificado ? 'SRI verificado' : 'No verificado'}
                                </Badge>
                                {Number.isFinite(score) && (
                                  <Badge tone="info">Riesgo: {nivel} ({score})</Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {!hasError && v?.mensaje && (
                          <div className="mt-3 text-sm text-foreground/80">{v.mensaje}</div>
                        )}
                        {hasError && (
                          <div className="mt-3 text-sm text-rose-600">
                            {doc.validationError}
                          </div>
                        )}

                        {!hasError && v && (
                          <details className="mt-4 group">
                            <summary className="cursor-pointer text-sm text-text-secondary hover:text-foreground">
                              Ver detalle técnico
                            </summary>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="rounded-md border border-border p-3">
                                <div className="text-xs font-medium mb-2">Revisiones MetaData primarias</div>
                                <ul className="space-y-2 text-sm">
                                  {(v?.riesgo?.prioritarias || []).map((p, i) => (
                                    <li key={i} className="border-b last:border-0 border-border pb-2">
                                      <div className="font-medium">{p.check}</div>
                                      <div className="text-text-secondary">
                                        {typeof p.detalle === 'object'
                                          ? JSON.stringify(p.detalle)
                                          : String(p.detalle)}
                                      </div>
                                      <div className="text-xs">Penalización: {p.penalizacion}</div>
                                    </li>
                                  ))}
                                  {(v?.riesgo?.prioritarias || []).length === 0 && (
                                    <li className="text-text-secondary italic">Sin observaciones.</li>
                                  )}
                                </ul>
                              </div>

                              <div className="rounded-md border border-border p-3">
                                <div className="text-xs font-medium mb-2">Revisiones MetaData secundarias</div>
                                <ul className="space-y-2 text-sm">
                                  {(v?.riesgo?.secundarias || []).map((p, i) => (
                                    <li key={i} className="border-b last:border-0 border-border pb-2">
                                      <div className="font-medium">{p.check}</div>
                                      <div className="text-text-secondary">
                                        {typeof p.detalle === 'object'
                                          ? JSON.stringify(p.detalle)
                                          : String(p.detalle)}
                                      </div>
                                      <div className="text-xs">Penalización: {p.penalizacion}</div>
                                    </li>
                                  ))}
                                  {(v?.riesgo?.secundarias || []).length === 0 && (
                                    <li className="text-text-secondary italic">Sin observaciones.</li>
                                  )}
                                </ul>
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
                  {/* NUEVO: Enviar al webhook */}
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
                <div className="text-sm font-semibold mb-2">Resumen de validación</div>
                <div className="text-sm text-text-secondary">
                  Evaluadas: {validated.length}<br />
                  Con error: {validated.filter(d => d.validationError).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClaimDetails;
