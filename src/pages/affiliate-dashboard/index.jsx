import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';

import ClaimsTable from './components/ClaimsTable';
import QuickActions from './components/QuickActions';

const AffiliateDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [riskWeights, setRiskWeights] = useState({});
  const [loadingWeights, setLoadingWeights] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------------- GET: Cargar pesos desde el backend ----------------
  useEffect(() => {
    const fetchRiskWeights = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8005/config/risk-weights");
        const data = await res.json();
        if (data?.RISK_WEIGHTS) {
          setRiskWeights(data.RISK_WEIGHTS);
        }
      } catch (err) {
        console.error("Error al cargar pesos de riesgo:", err);
      } finally {
        setLoadingWeights(false);
      }
    };

    // idioma guardado
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    fetchRiskWeights();
  }, []);

  // ---------------- PUT: Guardar cambios ----------------
  const handleSaveWeights = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://127.0.0.1:8005/config/risk-weights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RISK_WEIGHTS: riskWeights }),
      });
      const data = await res.json();
      if (res.ok) {
        setRiskWeights(data.RISK_WEIGHTS);
        alert("Pesos actualizados correctamente ✅");
      } else {
        alert("Error al actualizar: " + (data?.detail || "Error desconocido"));
      }
    } catch (err) {
      console.error("Error al guardar pesos:", err);
      alert("Error al guardar los pesos ❌");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Handlers de UI ----------------
  const handleToggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleIncrement = (key) => {
    setRiskWeights((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const handleDecrement = (key) => {
    setRiskWeights((prev) => ({ ...prev, [key]: prev[key] - 1 }));
  };

  const handleNewClaim = () => {
    navigate('/claim-submission');
  };

  const breadcrumbs = [
    { label: 'Inicio', path: '/affiliate-dashboard', isActive: true }
  ];

  // ---------------- Mock Data ----------------
  const dashboardMetrics = [
    { title: 'Total Reclamos', value: '24', subtitle: 'Enviados este mes', icon: 'FileText', color: 'primary', trend: 'up', trendValue: '+12%' },
    { title: 'Pendientes de Aprobación', value: '8', subtitle: 'En proceso de revisión', icon: 'Clock', color: 'warning', trend: 'down', trendValue: '-3%' },
    { title: 'Monto Aprobado', value: '€4,250.00', subtitle: 'Total reembolsado', icon: 'CreditCard', color: 'success', trend: 'up', trendValue: '+€850' },
    { title: 'Tiempo Promedio', value: '5.2 días', subtitle: 'Procesamiento promedio', icon: 'TrendingUp', color: 'accent', trend: 'down', trendValue: '-1.3 días' }
  ];

  const mockClaims = [
    { id: 1, claimId: 'CLM-2024-001', submissionDate: '2024-08-20', provider: 'Hospital San Juan', serviceType: 'Consulta Especializada', status: 'approved', requestedAmount: 450.00, approvedAmount: 405.00 },
    { id: 2, claimId: 'CLM-2024-002', submissionDate: '2024-08-22', provider: 'Clínica Dental Sonrisa', serviceType: 'Tratamiento Dental', status: 'validation', requestedAmount: 280.00 },
    { id: 3, claimId: 'CLM-2024-003', submissionDate: '2024-08-24', provider: 'Laboratorio Central', serviceType: 'Análisis Clínicos', status: 'observed', requestedAmount: 125.00 },
    { id: 4, claimId: 'CLM-2024-004', submissionDate: '2024-08-25', provider: 'Farmacia del Centro', serviceType: 'Medicamentos', status: 'submitted', requestedAmount: 89.50 },
    { id: 5, claimId: 'CLM-2024-005', submissionDate: '2024-08-26', provider: 'Centro de Fisioterapia', serviceType: 'Sesiones de Rehabilitación', status: 'draft', requestedAmount: 320.00 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        userRole="affiliate"
        userName="María González"
        notificationCount={3}
      />

      {/* Sidebar */}
      <RoleBasedSidebar isCollapsed={sidebarCollapsed} userRole="affiliate" />

      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} pt-16`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} className="mb-6" />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Panel de Afiliado</h1>
              <p className="text-text-secondary">Gestiona tus reclamos de reembolso y seguimiento de pagos</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Button
                variant="default"
                size="lg"
                onClick={handleNewClaim}
                iconName="Plus"
                iconPosition="left"
                className="w-full lg:w-auto"
              >
                Nuevo Reclamo
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {dashboardMetrics?.map((metric, index) => (
              <MetricsCard key={index} {...metric} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Claims Table */}
            <div className="xl:col-span-3">
              <ClaimsTable claims={mockClaims} />
            </div>

            {/* Right Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              <QuickActions />

              {/* Risk Weights Config */}
              <div className="bg-card border border-border rounded-lg p-2">
                <h3 className="text-base font-semibold mb-4">Pesos de Riesgo</h3>
                {loadingWeights ? (
                  <p className="text-sm text-text-secondary">Cargando...</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {Object.entries(riskWeights).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between border-b border-border pb-2">
                          <span className="text-sm font-medium">{key}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDecrement(key)}
                              className="px-2 py-1 text-xs bg-rose-100 text-rose-800 rounded hover:bg-rose-200"
                            >
                              -
                            </button>
                            <span className="w-10 text-center">{value}</span>
                            <button
                              onClick={() => handleIncrement(key)}
                              className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleSaveWeights}
                        disabled={saving}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-60"
                      >
                        {saving ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AffiliateDashboard;
