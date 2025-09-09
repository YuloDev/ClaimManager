import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const GlobalHeader = ({
  isCollapsed = false,
  onToggleSidebar,
  userRole = 'affiliate',
  userName = 'John Doe',
  notificationCount = 3
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    // Logout logic here
    console.log('Logging out...');
  };

  const notifications = [
    { id: 1, title: 'Claim #CLM-2024-001 approved', time: '2 min ago', type: 'success' },
    { id: 2, title: 'Document validation required', time: '15 min ago', type: 'warning' },
    { id: 3, title: 'New claim submitted', time: '1 hour ago', type: 'info' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-[1000]">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - Logo and Toggle */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Icon name="Menu" size={20} />
          </Button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
              <div><img src="/assets/images/logo.jpg" alt="" srcset="" /></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-primary font-inter">Nexti</span>
              <span className="text-xs text-text-secondary -mt-1">Claims Manager</span>
            </div>
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Icon name="Bell" size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-card z-[1100]">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-foreground">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications?.map((notification) => (
                    <div key={notification?.id} className="p-4 border-b border-border hover:bg-muted transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification?.type === 'success' ? 'bg-success' :
                            notification?.type === 'warning' ? 'bg-warning' : 'bg-accent'
                          }`}></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{notification?.title}</p>
                          <p className="text-xs text-text-secondary mt-1">{notification?.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3"
            >
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{userName?.charAt(0)}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-text-secondary capitalize">{userRole}</p>
              </div>
              <Icon name="ChevronDown" size={16} />
            </Button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-lg shadow-card z-[1100]">
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-foreground">{userName}</p>
                  <p className="text-sm text-text-secondary capitalize">{userRole}</p>
                </div>
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center space-x-2">
                    <Icon name="User" size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center space-x-2">
                    <Icon name="Settings" size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center space-x-2">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help & Support</span>
                  </button>
                </div>
                <div className="border-t border-border py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-muted transition-colors flex items-center space-x-2"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-[1050]"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default GlobalHeader;