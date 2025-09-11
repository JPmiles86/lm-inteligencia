// Notification Center - Toast notifications for AI generation system
// Handles success, error, warning, and info messages with auto-dismiss

import React, { useEffect } from 'react';
import { useAIStore } from '../../../store/aiStore';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Loader2,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useAIStore();

  // Auto-dismiss notifications with duration
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  // Get notification icon and styling
  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          containerClass: 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700',
          iconClass: 'text-green-600 dark:text-green-400',
          titleClass: 'text-green-800 dark:text-green-200',
          messageClass: 'text-green-700 dark:text-green-300',
        };
      case 'error':
        return {
          icon: XCircle,
          containerClass: 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700',
          iconClass: 'text-red-600 dark:text-red-400',
          titleClass: 'text-red-800 dark:text-red-200',
          messageClass: 'text-red-700 dark:text-red-300',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          containerClass: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700',
          iconClass: 'text-yellow-600 dark:text-yellow-400',
          titleClass: 'text-yellow-800 dark:text-yellow-200',
          messageClass: 'text-yellow-700 dark:text-yellow-300',
        };
      case 'info':
      default:
        return {
          icon: Info,
          containerClass: 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700',
          iconClass: 'text-blue-600 dark:text-blue-400',
          titleClass: 'text-blue-800 dark:text-blue-200',
          messageClass: 'text-blue-700 dark:text-blue-300',
        };
    }
  };

  // Handle manual dismiss
  const handleDismiss = (id: string) => {
    removeNotification(id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop Notifications (fixed position) */}
      <div className="hidden sm:block">
        <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
          {notifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            const IconComponent = styles.icon;

            return (
              <div
                key={notification.id}
                className={`${styles.containerClass} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}
                style={{
                  animation: 'slideInRight 0.3s ease-out',
                }}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${styles.iconClass}`} />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${styles.titleClass}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm ${styles.messageClass} mt-1`}>
                      {notification.message}
                    </p>
                    
                    {/* Duration indicator */}
                    {notification.duration && notification.duration > 0 && (
                      <div className={`mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1`}>
                        <div
                          className={`h-1 rounded-full transition-all ${
                            notification.type === 'success' ? 'bg-green-400' :
                            notification.type === 'error' ? 'bg-red-400' :
                            notification.type === 'warning' ? 'bg-yellow-400' :
                            'bg-blue-400'
                          }`}
                          style={{
                            animation: `shrinkWidth ${notification.duration}ms linear`,
                            width: '100%',
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    className={`ml-2 flex-shrink-0 ${styles.iconClass} hover:opacity-70 transition-opacity`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Notifications (full width at top) */}
      <div className="sm:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 space-y-1">
          {notifications.map((notification) => {
            const styles = getNotificationStyles(notification.type);
            const IconComponent = styles.icon;

            return (
              <div
                key={notification.id}
                className={`${styles.containerClass} border-b p-4 transition-all duration-300 ease-in-out`}
                style={{
                  animation: 'slideInDown 0.3s ease-out',
                }}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${styles.iconClass}`} />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${styles.titleClass}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm ${styles.messageClass} mt-1`}>
                      {notification.message}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    className={`ml-2 flex-shrink-0 ${styles.iconClass} hover:opacity-70 transition-opacity`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Progress bar for mobile */}
                {notification.duration && notification.duration > 0 && (
                  <div className={`mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-0.5`}>
                    <div
                      className={`h-0.5 rounded-full transition-all ${
                        notification.type === 'success' ? 'bg-green-400' :
                        notification.type === 'error' ? 'bg-red-400' :
                        notification.type === 'warning' ? 'bg-yellow-400' :
                        'bg-blue-400'
                      }`}
                      style={{
                        animation: `shrinkWidth ${notification.duration}ms linear`,
                        width: '100%',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global CSS for animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .notification-enter {
          opacity: 0;
          transform: translateX(100%);
        }

        .notification-enter-active {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }

        .notification-exit {
          opacity: 1;
          transform: translateX(0);
        }

        .notification-exit-active {
          opacity: 0;
          transform: translateX(100%);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }
      `}</style>
    </>
  );
};