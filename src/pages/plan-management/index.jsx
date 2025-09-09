import React, { useState } from 'react';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import tab components
import PlansOverviewTab from './components/PlansOverviewTab';
import CoverageRulesTab from './components/CoverageRulesTab';
import WaitingPeriodsTab from './components/WaitingPeriodsTab';
import ProviderNetworksTab from './components/ProviderNetworksTab';
import BulkOperationsPanel from './components/BulkOperationsPanel';

const PlanManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('plans');

  const tabs = [
    {
      id: 'plans',
      label: 'Planes',
      icon: 'FileText',
      description: 'Gestionar planes de seguro'
    },
    {
      id: 'coverage',
      label: 'Reglas de Cobertura',
      icon: 'Settings',
      description: 'Configurar copagos y límites'
    },
    {
      id: 'waiting',
      label: 'Períodos de Espera',
      icon: 'Clock',
      description: 'Gestionar tiempos de espera'
    },
    {
      id: 'providers',
      label: 'Red de Proveedores',
      icon: 'Building',
      description: 'Administrar proveedores médicos'
    },
    {
      id: 'bulk',
      label: 'Operaciones Masivas',
      icon: 'Upload',
      description: 'Importar/exportar datos'
    }
  ];

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plans':
        return <PlansOverviewTab />;
      case 'coverage':
        return <CoverageRulesTab />;
      case 'waiting':
        return <WaitingPeriodsTab />;
      case 'providers':
        return <ProviderNetworksTab />;
      case 'bulk':
        return <BulkOperationsPanel />;
      default:
        return <PlansOverviewTab />;
    }
  };

  const customBreadcrumbs = [
    { label: 'Dashboard', path: '/analytics-dashboard', isActive: false },
    { label: 'Gestión de Planes', path: '/plan-management', isActive: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        isCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        userRole="admin"
        userName="Administrador"
        notificationCount={2}
      />
      {/* Sidebar */}
      <RoleBasedSidebar
        isCollapsed={sidebarCollapsed}
        userRole="admin"
      />
      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          {/* Breadcrumb */}
          <BreadcrumbNavigation customBreadcrumbs={customBreadcrumbs} className="mb-6" />

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Planes</h1>
                <p className="text-text-secondary">
                  Configure planes de seguro, reglas de cobertura y red de proveedores
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="History"
                  iconPosition="left"
                  size="sm"
                >
                  Historial de Cambios
                </Button>
                <Button
                  variant="outline"
                  iconName="Settings"
                  iconPosition="left"
                  size="sm"
                >
                  Configuración
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Planes Activos</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" size={24} className="text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Icon name="TrendingUp" size={16} className="text-success mr-1" />
                <span className="text-success">+2</span>
                <span className="text-text-secondary ml-1">este mes</span>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Reglas de Cobertura</p>
                  <p className="text-2xl font-bold text-foreground">48</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="Settings" size={24} className="text-accent" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Icon name="TrendingUp" size={16} className="text-success mr-1" />
                <span className="text-success">+5</span>
                <span className="text-text-secondary ml-1">actualizadas</span>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Proveedores</p>
                  <p className="text-2xl font-bold text-foreground">156</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Building" size={24} className="text-secondary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Icon name="AlertTriangle" size={16} className="text-warning mr-1" />
                <span className="text-warning">3</span>
                <span className="text-text-secondary ml-1">contratos por vencer</span>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Miembros Totales</p>
                  <p className="text-2xl font-bold text-foreground">2,845</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-success" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Icon name="TrendingUp" size={16} className="text-success mr-1" />
                <span className="text-success">+12%</span>
                <span className="text-text-secondary ml-1">vs mes anterior</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-card rounded-lg border border-border mb-6">
            {/* Desktop Tabs */}
            <div className="hidden lg:block border-b border-border">
              <nav className="flex space-x-8 px-6">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile Tab Selector */}
            <div className="lg:hidden p-4 border-b border-border">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e?.target?.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
              >
                {tabs?.map((tab) => (
                  <option key={tab?.id} value={tab?.id}>
                    {tab?.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlanManagement;