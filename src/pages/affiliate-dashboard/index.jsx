import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';
import RiskLevelsManager from '../../components/risk/RiskLevelsManager';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import riskService from '../../services/riskService';

import ClaimsTable from './components/ClaimsTable';

const AffiliateDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [riskWeights, setRiskWeights] = useState({});
  const [riskWeightDescriptions, setRiskWeightDescriptions] = useState({});
  const [loadingWeights, setLoadingWeights] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reclamos, setReclamos] = useState([]);
  const [reclamosMetadata, setReclamosMetadata] = useState({});
  const [loadingReclamos, setLoadingReclamos] = useState(true);

  // ---------------- GET: Cargar pesos desde el backend ----------------
  useEffect(() => {
    const fetchRiskWeights = async () => {
      try {
        const data = await riskService.getRiskWeights();
        // Si recibimos el formato nuevo con descripciones
        if (data.RISK_WEIGHTS && data.RISK_WEIGHTS_DESCRIPTIONS) {
          setRiskWeights(data.RISK_WEIGHTS);
          setRiskWeightDescriptions(data.RISK_WEIGHTS_DESCRIPTIONS);
        } else {
          // Formato anterior solo con pesos
          setRiskWeights(data);
          setRiskWeightDescriptions({});
        }
      } catch (err) {
        console.error("Error al cargar pesos de riesgo:", err);
        toast.error("Error al cargar pesos de riesgo");
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

  // ---------------- GET: Cargar reclamos desde el backend ----------------
  useEffect(() => {
    const fetchReclamos = async () => {
      try {
        setLoadingReclamos(true);
        const response = await fetch('https://api-forense.nextisolutions.com/reclamos');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setReclamos(data.reclamos || []);
        setReclamosMetadata(data.metadatos || {});
      } catch (err) {
        console.error("Error al cargar reclamos:", err);
        toast.error("Error al cargar reclamos desde el servidor");
        // En caso de error, usar datos mock como fallback
        setReclamos(mockClaims);
      } finally {
        setLoadingReclamos(false);
      }
    };

    fetchReclamos();
  }, []);


  // ---------------- PUT: Guardar cambios ----------------
  const handleSaveWeights = async () => {
    setSaving(true);
    try {
      const updatedWeights = await riskService.updateRiskWeights(riskWeights);
      setRiskWeights(updatedWeights);
      toast.success("✅ Pesos actualizados correctamente");
    } catch (err) {
      console.error("Error al guardar pesos:", err);
      toast.error("Error al guardar los pesos: " + err.message);
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

  // ---------------- Métricas calculadas dinámicamente ----------------
  const calculateMetrics = (reclamosData) => {
    if (!reclamosData || reclamosData.length === 0) {
      return [
        { title: 'Total Reclamos', value: '0', subtitle: 'Enviados este mes', icon: 'FileText', color: 'primary' },
        { title: 'Total Aprobados', value: '0', subtitle: 'Reclamos aprobados', icon: 'CheckCircle', color: 'success' },
        { title: 'Pendientes de Aprobación', value: '0', subtitle: 'En proceso de revisión', icon: 'Clock', color: 'warning' },
        { title: 'Monto Aprobado', value: '$0.00', subtitle: 'Total reembolsado', icon: 'CreditCard', color: 'accent' }
      ];
    }

    const totalReclamos = reclamosData.length;
    const aprobados = reclamosData.filter(r => 
      r.estado?.toLowerCase() === 'aprobado' || 
      r.estado?.toLowerCase() === 'approved'
    ).length;
    
    const pendientes = reclamosData.filter(r => 
      r.estado?.toLowerCase() === 'en revisión' || 
      r.estado?.toLowerCase() === 'en revision' ||
      r.estado?.toLowerCase() === 'submitted' || 
      r.estado?.toLowerCase() === 'under_review' || 
      r.estado?.toLowerCase() === 'validation'
    ).length;
    
    const montoAprobado = reclamosData
      .filter(r => r.estado?.toLowerCase() === 'aprobado' || r.estado?.toLowerCase() === 'approved')
      .reduce((sum, r) => sum + (parseFloat(r.monto_aprobado) || 0), 0);

    const moneda = reclamosData.length > 0 ? (reclamosData[0].moneda || '€') : '€';

    return [
      { title: 'Total Reclamos', value: totalReclamos.toString(), subtitle: 'Enviados este mes', icon: 'FileText', color: 'primary' },
      { title: 'Total Aprobados', value: aprobados.toString(), subtitle: 'Reclamos aprobados', icon: 'CheckCircle', color: 'success' },
      { title: 'Pendientes de Aprobación', value: pendientes.toString(), subtitle: 'En proceso de revisión', icon: 'Clock', color: 'warning' },
      { title: 'Monto Aprobado', value: `${moneda}${montoAprobado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subtitle: 'Total reembolsado', icon: 'CreditCard', color: 'accent' }
    ];
  };

  const dashboardMetrics = calculateMetrics(reclamos);

  const mockClaims = [
    { id: 1, claimId: 'CLM-2024-001', submissionDate: '2024-08-20', provider: 'Hospital San Juan', serviceType: 'Consulta Especializada', status: 'approved', requestedAmount: 450.00, approvedAmount: 405.00 },
    { id: 2, claimId: 'CLM-2024-002', submissionDate: '2024-08-22', provider: 'Clínica Dental Sonrisa', serviceType: 'Tratamiento Dental', status: 'validation', requestedAmount: 280.00 },
    { id: 3, claimId: 'CLM-2024-003', submissionDate: '2024-08-24', provider: 'Laboratorio Central', serviceType: 'Análisis Clínicos', status: 'observed', requestedAmount: 125.00 },
    { id: 4, claimId: 'CLM-2024-004', submissionDate: '2024-08-25', provider: 'Farmacia del Centro', serviceType: 'Medicamentos', status: 'submitted', requestedAmount: 89.50 },
    { id: 5, claimId: 'CLM-2024-005', submissionDate: '2024-08-26', provider: 'Centro de Fisioterapia', serviceType: 'Sesiones de Rehabilitación', status: 'draft', requestedAmount: 320.00 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

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
            <div className="mt-4 lg:mt-0 flex gap-3">
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
            <div className="xl:col-span-6">
              <ClaimsTable claims={reclamos} metadata={reclamosMetadata} loading={loadingReclamos} />
            </div>

            {/* Right Sidebar -> Parametrización */}
            <div className="xl:col-span-6 space-y-6">
              {/* Niveles de Riesgo */}
              <RiskLevelsManager />

              {/* Pesos de Riesgo */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-base font-semibold mb-4">Pesos de Riesgo</h3>
                {loadingWeights ? (
                  <p className="text-sm text-text-secondary">Cargando...</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(riskWeights).map(([key, value]) => {
                        const description = riskWeightDescriptions[key];
                        return (
                          <div key={key} className="border-b border-border pb-3">
                            <div className="flex items-center justify-between mb-1">
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
                            {description && (
                              <div className="text-xs text-text-secondary mt-1">
                                <p className="font-medium">{description.descripcion}</p>
                                {description.explicacion && (
                                  <p className="mt-1 italic">{description.explicacion}</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
