import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';

export default function ToastNotifications() {
  const { notifications, removeNotification } = useNotifications();
  const [closingIds, setClosingIds] = useState<Set<string>>(new Set());

  // Afficher seulement les 3 dernières notifications non lues
  const recentNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3);

  const handleClose = (id: string) => {
    // Ajouter l'animation de sortie
    setClosingIds(prev => new Set(prev).add(id));

    // Supprimer après l'animation
    setTimeout(() => {
      removeNotification(id);
      setClosingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          text: 'text-green-900 dark:text-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-900 dark:text-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          text: 'text-orange-900 dark:text-orange-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100'
        };
    }
  };

  if (recentNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm pointer-events-none">
      {recentNotifications.map((notification) => {
        const Icon = getIcon(notification.type);
        const colors = getColors(notification.type);
        const isClosing = closingIds.has(notification.id);

        return (
          <div
            key={notification.id}
            className={`
              ${colors.bg} ${colors.border}
              border rounded-lg p-4 shadow-lg
              pointer-events-auto
              transition-all duration-300 ease-in-out
              ${isClosing
                ? 'animate-slide-out-right opacity-0 scale-95'
                : 'animate-slide-in-right opacity-100 scale-100'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />

              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${colors.text} mb-1`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {notification.message}
                </p>

                {notification.action && (
                  <button
                    onClick={() => {
                      notification.action!.onClick();
                      handleClose(notification.id);
                    }}
                    className={`mt-2 text-sm font-medium ${colors.icon} hover:underline`}
                  >
                    {notification.action.label} →
                  </button>
                )}
              </div>

              <button
                onClick={() => handleClose(notification.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                aria-label="Fermer la notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-out-right {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(120%);
            opacity: 0;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-slide-out-right {
          animation: slide-out-right 0.3s cubic-bezier(0.4, 0, 1, 1);
        }
      `}</style>
    </div>
  );
}
