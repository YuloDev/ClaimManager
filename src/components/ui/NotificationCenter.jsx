import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationCenter = ({ 
  isOpen = false, 
  onClose,
  notifications = [],
  className = '' 
}) => {
  const [filter, setFilter] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  // Sample notifications for demo
  const defaultNotifications = [
    {
      id: 1,
      title: 'Claim #CLM-2024-001 Approved',
      message: 'Your claim for $2,450.00 has been approved and processed.',
      type: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      category: 'claim'
    },
    {
      id: 2,
      title: 'Document Validation Required',
      message: 'Additional documentation needed for claim #CLM-2024-002.',
      type: 'warning',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      category: 'validation'
    },
    {
      id: 3,
      title: 'New Claim Submitted',
      message: 'Claim #CLM-2024-003 has been submitted for review.',
      type: 'info',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      category: 'claim'
    },
    {
      id: 4,
      title: 'System Maintenance Scheduled',
      message: 'Planned maintenance on Sunday, 2:00 AM - 4:00 AM EST.',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      category: 'system'
    },
    {
      id: 5,
      title: 'Payment Processed',
      message: 'Payment of $1,850.00 has been processed for claim #CLM-2024-001.',
      type: 'success',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
      category: 'payment'
    }
  ];

  const allNotifications = notifications?.length > 0 ? notifications : defaultNotifications;

  useEffect(() => {
    let filtered = allNotifications;
    
    if (filter === 'unread') {
      filtered = allNotifications?.filter(n => !n?.read);
    } else if (filter !== 'all') {
      filtered = allNotifications?.filter(n => n?.category === filter);
    }
    
    setFilteredNotifications(filtered);
  }, [filter, notifications]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Info';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-accent';
    }
  };

  const handleMarkAsRead = (id) => {
    // Mark notification as read logic
    console.log(`Marking notification ${id} as read`);
  };

  const handleMarkAllAsRead = () => {
    // Mark all notifications as read logic
    console.log('Marking all notifications as read');
  };

  const handleClearAll = () => {
    // Clear all notifications logic
    console.log('Clearing all notifications');
  };

  const unreadCount = allNotifications?.filter(n => !n?.read)?.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1100]"
        onClick={onClose}
      />
      {/* Notification Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-lg z-[1110] animate-slide-in ${className}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-error text-error-foreground text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {['all', 'unread', 'claim', 'validation', 'system', 'payment']?.map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className="capitalize"
                >
                  {filterType}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-error hover:text-error"
            >
              Clear all
            </Button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Icon name="Bell" size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                <p className="text-text-secondary">
                  {filter === 'all' ? 'You\'re all caught up!' : `No ${filter} notifications found.`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications?.map((notification) => (
                  <div
                    key={notification?.id}
                    className={`p-4 hover:bg-muted transition-colors cursor-pointer ${
                      !notification?.read ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification?.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${getNotificationColor(notification?.type)}`}>
                        <Icon name={getNotificationIcon(notification?.type)} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification?.read ? 'text-foreground' : 'text-text-secondary'
                          }`}>
                            {notification?.title}
                          </h4>
                          {!notification?.read && (
                            <div className="w-2 h-2 bg-accent rounded-full ml-2 mt-1 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                          {notification?.message}
                        </p>
                        <p className="text-xs text-text-secondary mt-2">
                          {formatTimestamp(notification?.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;