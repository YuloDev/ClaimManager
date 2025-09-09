import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedSidebar = ({ 
  isCollapsed = false, 
  userRole = 'affiliate',
  className = '' 
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getNavigationItems = (role) => {
    const baseItems = {
      affiliate: [
        {
          label: 'Dashboard',
          path: '/affiliate-dashboard',
          icon: 'LayoutDashboard',
          tooltip: 'View your claims overview'
        },
        {
          label: 'Submit Claim',
          path: '/claim-submission',
          icon: 'FileText',
          tooltip: 'Submit a new claim'
        },
        {
          label: 'Claim Details',
          path: '/claim-details',
          icon: 'FileSearch',
          tooltip: 'View claim details'
        }
      ],
      analyst: [
        {
          label: 'Dashboard',
          path: '/analyst-dashboard',
          icon: 'LayoutDashboard',
          tooltip: 'Review queue and analytics'
        },
        {
          label: 'Document Validation',
          path: '/document-validation',
          icon: 'FileCheck',
          tooltip: 'Validate claim documents'
        },
        {
          label: 'Claim Details',
          path: '/claim-details',
          icon: 'FileSearch',
          tooltip: 'Review claim details'
        },
        {
          label: 'Analytics',
          path: '/analytics-dashboard',
          icon: 'BarChart3',
          tooltip: 'View analytics dashboard'
        }
      ],
      admin: [
        {
          label: 'Analytics Dashboard',
          path: '/analytics-dashboard',
          icon: 'BarChart3',
          tooltip: 'System analytics and reports'
        },
        {
          label: 'Plan Management',
          path: '/plan-management',
          icon: 'Settings',
          tooltip: 'Manage insurance plans'
        },
        {
          label: 'Document Validation',
          path: '/document-validation',
          icon: 'FileCheck',
          tooltip: 'Review validation processes'
        },
        {
          label: 'Claim Details',
          path: '/claim-details',
          icon: 'FileSearch',
          tooltip: 'Access all claim details'
        }
      ]
    };

    return baseItems?.[role] || baseItems?.affiliate;
  };

  const navigationItems = getNavigationItems(userRole);

  const isActive = (path) => {
    return location?.pathname === path;
  };

  const handleItemClick = (path) => {
    // Navigation logic would be handled by React Router
    console.log(`Navigating to: ${path}`);
    setIsOpen(false); // Close mobile menu
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems?.map((item) => (
          <div key={item?.path} className="relative group">
            <Button
              variant={isActive(item?.path) ? "default" : "ghost"}
              onClick={() => handleItemClick(item?.path)}
              className={`w-full justify-start px-3 py-2 h-auto ${
                isActive(item?.path) 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-foreground hover:bg-muted hover:text-foreground'
              } ${isCollapsed ? 'px-2' : ''}`}
            >
              <Icon 
                name={item?.icon} 
                size={20} 
                className={isCollapsed ? 'mx-auto' : 'mr-3'} 
              />
              {!isCollapsed && (
                <span className="font-medium">{item?.label}</span>
              )}
            </Button>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item?.tooltip}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Icon name="User" size={16} className="text-muted-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userRole?.charAt(0)?.toUpperCase() + userRole?.slice(1)} User
              </p>
              <p className="text-xs text-text-secondary">
                Active Session
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-[900] ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      } bg-card border-r border-border transition-all duration-300 ease-in-out ${className}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[900] bg-background/80 backdrop-blur-sm">
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-lg animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary transform rotate-45"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-primary font-inter">Nexti</span>
                  <span className="text-xs text-text-secondary -mt-1">Claims Manager</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Mobile Menu Toggle (handled by GlobalHeader) */}
    </>
  );
};

export default RoleBasedSidebar;