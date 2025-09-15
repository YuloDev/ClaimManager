import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const BreadcrumbNavigation = ({ 
  customBreadcrumbs = null,
  className = '' 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/affiliate-dashboard': { label: 'Dashboard', parent: null },
    '/claim-submission': { label: 'Submit Claim', parent: '/affiliate-dashboard' },
    '/claim-details': { label: 'Claim Details', parent: '/affiliate-dashboard' },
    '/analyst-dashboard': { label: 'Dashboard', parent: null },
    '/document-validation': { label: 'Document Validation', parent: '/analyst-dashboard' },
    '/analytics-dashboard': { label: 'Analytics', parent: null },
    '/plan-management': { label: 'Plan Management', parent: '/analytics-dashboard' },
  };

  const generateBreadcrumbs = () => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const currentPath = location?.pathname;
    const breadcrumbs = [];
    
    // Build breadcrumb trail
    let path = currentPath;
    while (path && routeMap?.[path]) {
      const route = routeMap?.[path];
      breadcrumbs?.unshift({
        label: route?.label,
        path: path,
        isActive: path === currentPath
      });
      path = route?.parent;
    }

    // Add Home if not already present
    if (breadcrumbs?.length > 0 && breadcrumbs?.[0]?.path !== '/affiliate-dashboard' && breadcrumbs?.[0]?.path !== '/analyst-dashboard' && breadcrumbs?.[0]?.path !== '/analytics-dashboard') {
      breadcrumbs?.unshift({
        label: 'Home',
        path: '/',
        isActive: false
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs?.map((crumb, index) => (
          <li key={crumb?.path} className="flex items-center">
            {index > 0 && (
              <Icon 
                name="ChevronRight" 
                size={16} 
                className="text-text-secondary mx-2" 
              />
            )}
            
            {crumb?.isActive ? (
              <span className="text-foreground font-medium">
                {crumb?.label}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBreadcrumbClick(crumb?.path)}
                className="text-text-secondary hover:text-foreground px-2 py-1 h-auto font-normal"
              >
                {crumb?.label}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;