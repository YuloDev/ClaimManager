import React, { useState, useEffect } from 'react';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import KPICard from './components/KPICard';
import ClaimsTrendChart from './components/ClaimsTrendChart';
import ProcessingVolumeChart from './components/ProcessingVolumeChart';
import ProviderAnalyticsChart from './components/ProviderAnalyticsChart';
import CostAnalysisChart from './components/CostAnalysisChart';
import DateRangeSelector from './components/DateRangeSelector';
import FilterControls from './components/FilterControls';
import DataTable from './components/DataTable';
import SystemAlertsPanel from './components/SystemAlertsPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AnalyticsDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [appliedFilters, setAppliedFilters] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock KPI data
  const kpiData = [
    {
      title: 'Total Reclamaciones',
      value: 3456,
      previousValue: 3124,
      icon: 'FileText',
      format: 'number',
      trend: 'positive'
    },
    {
      title: 'Tasa de Aprobación',
      value: 87.5,
      previousValue: 84.2,
      icon: 'CheckCircle',
      format: 'percentage',
      trend: 'positive'
    },
    {
      title: 'Tiempo Promedio',
      value: 2.3,
      previousValue: 2.8,
      icon: 'Clock',
      format: 'time',
      trend: 'negative'
    },
    {
      title: 'Monto Total Aprobado',
      value: 1245678,
      previousValue: 1156432,
      icon: 'Euro',
      format: 'currency',
      trend: 'positive'
    }
  ];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    console.log('Date range changed:', range);
    // Implement date range filtering logic
  };

  const handleFiltersChange = (filters) => {
    setAppliedFilters(filters);
    console.log('Filters changed:', filters);
    // Implement filtering logic
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 2000);
  };

  const handleExportDashboard = () => {
    console.log('Exporting dashboard data...');
    // Implement export functionality
  };

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        userRole="admin"
        userName="Ana García"
        notificationCount={5}
      />
      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        userRole="admin"
      />
      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-16`}>
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <BreadcrumbNavigation />
              <h1 className="text-2xl font-bold text-foreground mt-2">
                Panel de Análisis
              </h1>
              <p className="text-text-secondary mt-1">
                Monitoreo integral de reclamaciones y métricas del sistema
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-text-secondary">
                Última actualización: {lastUpdated?.toLocaleTimeString('es-ES')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                loading={refreshing}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Actualizar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleExportDashboard}
                iconName="Download"
                iconPosition="left"
              >
                Exportar
              </Button>
            </div>
          </div>

          {/* Controls Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FilterControls onFiltersChange={handleFiltersChange} />
            </div>
            <div>
              <DateRangeSelector onDateRangeChange={handleDateRangeChange} />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData?.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi?.title}
                value={kpi?.value}
                previousValue={kpi?.previousValue}
                icon={kpi?.icon}
                format={kpi?.format}
                trend={kpi?.trend}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClaimsTrendChart data={kpiData} />
            <ProcessingVolumeChart data={kpiData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProviderAnalyticsChart data={kpiData} />
            <CostAnalysisChart data={kpiData} />
          </div>

          {/* Data Table and System Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <DataTable data={kpiData} />
            </div>
            <div>
              <SystemAlertsPanel />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Métricas de Rendimiento
                </h3>
                <p className="text-sm text-text-secondary">
                  Indicadores clave de rendimiento del sistema
                </p>
              </div>
              <Icon name="Activity" size={24} className="text-primary" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Zap" size={24} className="text-success" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">99.8%</div>
                <div className="text-sm text-text-secondary">Disponibilidad del Sistema</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Users" size={24} className="text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">1,247</div>
                <div className="text-sm text-text-secondary">Usuarios Activos</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="TrendingUp" size={24} className="text-warning" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">15.3%</div>
                <div className="text-sm text-text-secondary">Crecimiento Mensual</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;