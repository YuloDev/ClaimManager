import React, { useState, useEffect } from 'react';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import NotificationCenter from '../../components/ui/NotificationCenter';
import MetricsCard from './components/MetricsCard';
import ClaimsTable from './components/ClaimsTable';
import AIValidationPanel from './components/AIValidationPanel';
import WorkflowTools from './components/WorkflowTools';
import FilterPanel from './components/FilterPanel';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AnalystDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    priority: [],
    assignedTo: [],
    aiScoreRange: [],
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    documentsComplete: false,
    hasIssues: false
  });

  // Mock data for metrics
  const metricsData = [
    {
      title: 'Reclamos Pendientes',
      value: '24',
      subtitle: 'Requieren revisión',
      trend: 'down',
      trendValue: '12%',
      icon: 'Clock',
      color: 'warning'
    },
    {
      title: 'Tiempo Promedio',
      value: '2.4h',
      subtitle: 'Procesamiento',
      trend: 'up',
      trendValue: '8%',
      icon: 'Timer',
      color: 'primary'
    },
    {
      title: 'Tasa de Observación',
      value: '15%',
      subtitle: 'Últimos 30 días',
      trend: 'down',
      trendValue: '3%',
      icon: 'Eye',
      color: 'error'
    },
    {
      title: 'Aprobaciones',
      value: '89%',
      subtitle: 'Tasa de éxito',
      trend: 'up',
      trendValue: '5%',
      icon: 'CheckCircle',
      color: 'success'
    }
  ];

  // Mock data for claims
  const claimsData = [
    {
      id: 'CLM-2024-001',
      claimNumber: 'CLM-2024-001',
      patientName: 'María González Pérez',
      patientId: 'DNI-12345678A',
      amount: 2450.00,
      status: 'pendiente',
      statusLabel: 'Pendiente',
      priority: 'alta',
      aiValidationScore: 85,
      documentsComplete: 4,
      documentsTotal: 5,
      assignedTo: 'María García',
      submittedAt: '2024-08-25T10:30:00Z'
    },
    {
      id: 'CLM-2024-002',
      claimNumber: 'CLM-2024-002',
      patientName: 'Carlos Rodríguez López',
      patientId: 'DNI-87654321B',
      amount: 1850.00,
      status: 'en_revision',
      statusLabel: 'En Revisión',
      priority: 'media',
      aiValidationScore: 92,
      documentsComplete: 6,
      documentsTotal: 6,
      assignedTo: 'Carlos López',
      submittedAt: '2024-08-25T09:15:00Z'
    },
    {
      id: 'CLM-2024-003',
      claimNumber: 'CLM-2024-003',
      patientName: 'Ana Martínez Sánchez',
      patientId: 'DNI-11223344C',
      amount: 3200.00,
      status: 'observado',
      statusLabel: 'Observado',
      priority: 'alta',
      aiValidationScore: 65,
      documentsComplete: 3,
      documentsTotal: 7,
      assignedTo: null,
      submittedAt: '2024-08-24T16:45:00Z'
    },
    {
      id: 'CLM-2024-004',
      claimNumber: 'CLM-2024-004',
      patientName: 'Luis Fernández García',
      patientId: 'DNI-55667788D',
      amount: 980.00,
      status: 'aprobado',
      statusLabel: 'Aprobado',
      priority: 'baja',
      aiValidationScore: 96,
      documentsComplete: 4,
      documentsTotal: 4,
      assignedTo: 'Ana Martínez',
      submittedAt: '2024-08-24T14:20:00Z'
    },
    {
      id: 'CLM-2024-005',
      claimNumber: 'CLM-2024-005',
      patientName: 'Elena Jiménez Ruiz',
      patientId: 'DNI-99887766E',
      amount: 1650.00,
      status: 'pendiente',
      statusLabel: 'Pendiente',
      priority: 'media',
      aiValidationScore: 78,
      documentsComplete: 5,
      documentsTotal: 6,
      assignedTo: null,
      submittedAt: '2024-08-26T08:30:00Z'
    }
  ];

  // Mock data for AI validation
  const validationResults = {
    overallScore: 85,
    issues: [
      {
        severity: 'critical',
        field: 'Factura Médica',
        description: 'La fecha de la factura no coincide con la fecha del servicio médico',
        suggestion: 'Verificar las fechas con el proveedor médico'
      },
      {
        severity: 'warning',
        field: 'Identificación Paciente',
        description: 'El DNI en la receta no es completamente legible',
        suggestion: 'Solicitar copia clara del documento de identidad'
      },
      {
        severity: 'info',
        field: 'Código ICD-10',
        description: 'El código de diagnóstico podría ser más específico',
        suggestion: 'Considerar código ICD-10 más detallado si está disponible'
      }
    ],
    calculations: {
      requestedAmount: 2450.00,
      approvedAmount: 2205.00,
      breakdown: [
        {
          description: 'Consulta Especialista',
          amount: 150.00,
          type: 'coverage',
          rule: '100% cobertura'
        },
        {
          description: 'Medicamentos',
          amount: 320.00,
          type: 'coverage',
          rule: '80% cobertura'
        },
        {
          description: 'Copago',
          amount: -25.00,
          type: 'deduction',
          rule: 'Copago fijo'
        },
        {
          description: 'Franquicia anual',
          amount: -240.00,
          type: 'deduction',
          rule: 'Franquicia pendiente'
        }
      ]
    },
    recommendations: [
      {
        title: 'Aprobación Recomendada',
        description: 'El reclamo cumple con todos los criterios de cobertura después de aplicar deducciones',
        confidence: 92
      },
      {
        title: 'Verificación Adicional',
        description: 'Considerar contactar al proveedor para aclarar discrepancias menores',
        confidence: 78
      }
    ]
  };

  // Mock data for analysts and rules
  const analysts = [
    { id: 'maria_garcia', name: 'María García', workload: 12 },
    { id: 'carlos_lopez', name: 'Carlos López', workload: 8 },
    { id: 'ana_martinez', name: 'Ana Martínez', workload: 15 },
    { id: 'luis_rodriguez', name: 'Luis Rodríguez', workload: 6 }
  ];

  const rules = [
    {
      id: 'auto_approve_low',
      name: 'Auto-aprobación Montos Bajos',
      description: 'Aprobar automáticamente reclamos < €500 con score IA > 95%'
    },
    {
      id: 'priority_high_amount',
      name: 'Prioridad Montos Altos',
      description: 'Asignar alta prioridad a reclamos > €2000'
    }
  ];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleClaimSelect = (claim) => {
    setSelectedClaim(claim);
    console.log('Selected claim:', claim);
  };

  const handleBulkAction = (action, claimIds) => {
    console.log(`Bulk action: ${action} for claims:`, claimIds);
  };

  const handleValidationAction = (action, data) => {
    console.log(`Validation action: ${action}`, data);
  };

  const handleWorkflowAction = (actionData) => {
    console.log('Workflow action:', actionData);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = (appliedFilters) => {
    console.log('Applied filters:', appliedFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      assignedTo: [],
      aiScoreRange: [],
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      documentsComplete: false,
      hasIssues: false
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e?.target?.value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        userRole="analyst"
        userName="María García"
        notificationCount={5}
      />
      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        userRole="analyst"
      />
      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-16`}>
        <div className="p-6 space-y-6">
          {/* Breadcrumb */}
          <BreadcrumbNavigation />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Panel de Analista</h1>
              <p className="text-text-secondary mt-1">
                Gestiona y revisa reclamos de seguros médicos con herramientas de IA
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowNotifications(true)}
                iconName="Bell"
                iconPosition="left"
              >
                Notificaciones
              </Button>
              <Button
                variant="default"
                onClick={() => console.log('Navigate to document validation')}
                iconName="FileCheck"
                iconPosition="left"
              >
                Validar Documentos
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {metricsData?.map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                subtitle={metric?.subtitle}
                trend={metric?.trend}
                trendValue={metric?.trendValue}
                icon={metric?.icon}
                color={metric?.color}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Claims Table Section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Buscar por número de reclamo, paciente, DNI..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(true)}
                    iconName="Filter"
                    iconPosition="left"
                  >
                    Filtros
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => console.log('Export data')}
                    iconName="Download"
                    iconPosition="left"
                  >
                    Exportar
                  </Button>
                </div>
              </div>

              {/* Claims Table */}
              <ClaimsTable
                claims={claimsData}
                onClaimSelect={handleClaimSelect}
                onBulkAction={handleBulkAction}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* AI Validation Panel */}
              {selectedClaim && (
                <AIValidationPanel
                  validationResults={validationResults}
                  onValidationAction={handleValidationAction}
                />
              )}

              {/* Workflow Tools */}
              <WorkflowTools
                onWorkflowAction={handleWorkflowAction}
                analysts={analysts}
                rules={rules}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
};

export default AnalystDashboard;