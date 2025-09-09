import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';

import ClaimsTable from './components/ClaimsTable';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';

const AffiliateDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('es');

  // Mock data for dashboard metrics
  const dashboardMetrics = [
    {
      title: 'Total Reclamos',
      value: '24',
      subtitle: 'Enviados este mes',
      icon: 'FileText',
      color: 'primary',
      trend: 'up',
      trendValue: '+12%'
    },
    {
      title: 'Pendientes de Aprobación',
      value: '8',
      subtitle: 'En proceso de revisión',
      icon: 'Clock',
      color: 'warning',
      trend: 'down',
      trendValue: '-3%'
    },
    {
      title: 'Monto Aprobado',
      value: '€4,250.00',
      subtitle: 'Total reembolsado',
      icon: 'CreditCard',
      color: 'success',
      trend: 'up',
      trendValue: '+€850'
    },
    {
      title: 'Tiempo Promedio',
      value: '5.2 días',
      subtitle: 'Procesamiento promedio',
      icon: 'TrendingUp',
      color: 'accent',
      trend: 'down',
      trendValue: '-1.3 días'
    }
  ];

  // Mock claims data
  const mockClaims = [
    {
      id: 1,
      claimId: 'CLM-2024-001',
      submissionDate: '2024-08-20',
      provider: 'Hospital San Juan',
      serviceType: 'Consulta Especializada',
      status: 'approved',
      requestedAmount: 450.00,
      approvedAmount: 405.00
    },
    {
      id: 2,
      claimId: 'CLM-2024-002',
      submissionDate: '2024-08-22',
      provider: 'Clínica Dental Sonrisa',
      serviceType: 'Tratamiento Dental',
      status: 'validation',
      requestedAmount: 280.00
    },
    {
      id: 3,
      claimId: 'CLM-2024-003',
      submissionDate: '2024-08-24',
      provider: 'Laboratorio Central',
      serviceType: 'Análisis Clínicos',
      status: 'observed',
      requestedAmount: 125.00
    },
    {
      id: 4,
      claimId: 'CLM-2024-004',
      submissionDate: '2024-08-25',
      provider: 'Farmacia del Centro',
      serviceType: 'Medicamentos',
      status: 'submitted',
      requestedAmount: 89.50
    },
    {
      id: 5,
      claimId: 'CLM-2024-005',
      submissionDate: '2024-08-26',
      provider: 'Centro de Fisioterapia',
      serviceType: 'Sesiones de Rehabilitación',
      status: 'draft',
      requestedAmount: 320.00
    }
  ];

  // Mock recent activity data
  const recentActivities = [
    {
      id: 1,
      type: 'status_changed',
      title: 'Estado actualizado',
      description: 'Tu reclamo CLM-2024-001 ha sido aprobado',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      claimId: 'CLM-2024-001'
    },
    {
      id: 2,
      type: 'document_uploaded',
      title: 'Documento subido',
      description: 'Se adjuntó factura médica a tu reclamo',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      claimId: 'CLM-2024-003'
    },
    {
      id: 3,
      type: 'claim_submitted',
      title: 'Reclamo enviado',
      description: 'Nuevo reclamo enviado para revisión',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      claimId: 'CLM-2024-004'
    },
    {
      id: 4,
      type: 'payment_processed',
      title: 'Pago procesado',
      description: 'Reembolso de €405.00 procesado exitosamente',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      claimId: 'CLM-2024-001'
    }
  ];

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNewClaim = () => {
    navigate('/claim-submission');
  };

  const breadcrumbs = [
    { label: 'Inicio', path: '/affiliate-dashboard', isActive: true }
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
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        userRole="affiliate"
      />
      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-16`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} className="mb-6" />

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Panel de Afiliado
              </h1>
              <p className="text-text-secondary">
                Gestiona tus reclamos de reembolso y seguimiento de pagos
              </p>
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
              <MetricsCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                subtitle={metric?.subtitle}
                icon={metric?.icon}
                color={metric?.color}
                trend={metric?.trend}
                trendValue={metric?.trendValue}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Claims Table - Takes up 3 columns on xl screens */}
            <div className="xl:col-span-3">
              <ClaimsTable claims={mockClaims} />
            </div>

            {/* Right Sidebar - Takes up 1 column on xl screens */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Actions */}
              <QuickActions />

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AffiliateDashboard;