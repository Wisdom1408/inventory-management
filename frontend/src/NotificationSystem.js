// Centralized Notification System utilities
// Provides NOTIFICATION_TYPES and a wrapped useNotifications that aligns with component expectations.

import { useNotifications as useNotificationsContext, NotificationProvider } from './contexts/NotificationContext';

export const NOTIFICATION_TYPES = {
  ITEM_AVAILABLE: 'ITEM_AVAILABLE',
  ITEM_UNASSIGNED: 'ITEM_UNASSIGNED',
  ASSIGNMENT_CREATED: 'ASSIGNMENT_CREATED',
  ASSIGNMENT_REMOVED: 'ASSIGNMENT_REMOVED',
  MAINTENANCE_REQUIRED: 'MAINTENANCE_REQUIRED',
};

export function useNotifications() {
  const ctx = useNotificationsContext();

  const notifications = Array.isArray(ctx.notifications) ? ctx.notifications : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Prefer functions exposed by context; otherwise, provide safe no-ops
  const markAsRead = typeof ctx.markAsRead === 'function' ? ctx.markAsRead : () => {};
  const markAllAsRead = typeof ctx.markAllAsRead === 'function' ? ctx.markAllAsRead : () => {};
  const deleteNotification = typeof ctx.deleteNotification === 'function'
    ? ctx.deleteNotification
    : (typeof ctx.removeNotification === 'function' ? ctx.removeNotification : () => {});
  const clearAllNotifications = typeof ctx.clearAllNotifications === 'function' ? ctx.clearAllNotifications : () => {};

  // Wrapper to support both object and (type, message, itemId) signatures
  const addNotification = (...args) => {
    if (typeof ctx.addNotification !== 'function') return;

    if (args.length === 1 && typeof args[0] === 'object') {
      const obj = args[0] || {};
      ctx.addNotification({
        id: obj.id,
        type: obj.type || 'info',
        message: obj.message || '',
        itemId: obj.itemId,
        timestamp: obj.timestamp || Date.now(),
        read: !!obj.read,
      });
    } else {
      const [type, message, itemId] = args;
      ctx.addNotification({
        type: type || 'info',
        message: message || '',
        itemId,
        timestamp: Date.now(),
        read: false,
      });
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
    isLoading: !!ctx.isLoading,
  };
}

export { NotificationProvider };
