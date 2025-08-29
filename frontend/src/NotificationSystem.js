import React, { createContext, useContext, useState, useEffect } from 'react';
import { inventoryAPI } from './services/api';
import { showToast } from './components/common/ToastContainer';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  ITEM_AVAILABLE: 'ITEM_AVAILABLE',
  ITEM_UNASSIGNED: 'ITEM_UNASSIGNED',
  ASSIGNMENT_CREATED: 'ASSIGNMENT_CREATED',
  ASSIGNMENT_REMOVED: 'ASSIGNMENT_REMOVED',
  MAINTENANCE_REQUIRED: 'MAINTENANCE_REQUIRED'
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch notifications on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 2 minutes
    const intervalId = setInterval(fetchNotifications, 2 * 60 * 1000);
    
    // Check for unassigned items every 5 minutes
    const unassignedCheckId = setInterval(checkUnassignedItems, 5 * 60 * 1000);
    
    // Check for available items every 5 minutes
    const availableCheckId = setInterval(checkAvailableItems, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(unassignedCheckId);
      clearInterval(availableCheckId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would be an API call to fetch notifications
      // For now, we'll use localStorage to persist notifications between sessions
      const storedNotifications = localStorage.getItem('inventory_notifications');
      
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.read).length);
      }
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save notifications to localStorage
  const saveNotifications = (updatedNotifications) => {
    try {
      localStorage.setItem('inventory_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      setNotifications(updatedNotifications);
      saveNotifications(updatedNotifications);
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
      
      setNotifications(updatedNotifications);
      saveNotifications(updatedNotifications);
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };
  
  // Add a new notification
  const addNotification = (type, message, itemId = null) => {
    const newNotification = {
      id: Date.now(), // Use timestamp as ID for simplicity
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      itemId
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
    
    setUnreadCount(prev => prev + 1);
    
    // Show toast for new notification
    showToast('info', message);
  };
  
  // Check for unassigned items and create notifications
  const checkUnassignedItems = async () => {
    try {
      const itemsResp = await inventoryAPI.getItems(1);
      const items = Array.isArray(itemsResp) ? itemsResp : (itemsResp?.results || itemsResp?.data || []);
      
      // Get assigned items
      const assignmentsResp = await inventoryAPI.getAssignments(1);
      const assignments = Array.isArray(assignmentsResp) ? assignmentsResp : (assignmentsResp?.results || assignmentsResp?.data || []);
      
      // Find items that are not assigned
      const assignedItemIds = assignments.map(a => a.item.id);
      const unassignedItems = items.filter(item => !assignedItemIds.includes(item.id));
      
      // Get existing notification IDs to avoid duplicates
      const existingNotificationItemIds = notifications
        .filter(n => n.type === NOTIFICATION_TYPES.ITEM_UNASSIGNED)
        .map(n => n.itemId);
      
      // Create notifications for unassigned items that don't already have notifications
      unassignedItems
        .filter(item => !existingNotificationItemIds.includes(item.id))
        .forEach(item => {
          addNotification(
            NOTIFICATION_TYPES.ITEM_UNASSIGNED,
            `${item.name} is not assigned to any staff member`,
            item.id
          );
        });
    } catch (error) {
      console.error('Failed to check unassigned items:', error);
    }
  };
  
  // Check for available items and create notifications
  const checkAvailableItems = async () => {
    try {
      const itemsResp = await inventoryAPI.getItems(1);
      const items = Array.isArray(itemsResp) ? itemsResp : (itemsResp?.results || itemsResp?.data || []);
      
      // Get assigned items
      const assignmentsResp = await inventoryAPI.getAssignments(1);
      const assignments = Array.isArray(assignmentsResp) ? assignmentsResp : (assignmentsResp?.results || assignmentsResp?.data || []);
      
      // Find items that are not assigned
      const assignedItemIds = assignments.map(a => a.item.id);
      const availableItems = items.filter(item => !assignedItemIds.includes(item.id));
      
      // Get existing notification IDs to avoid duplicates
      const existingNotificationItemIds = notifications
        .filter(n => n.type === NOTIFICATION_TYPES.ITEM_AVAILABLE)
        .map(n => n.itemId);
      
      // Create notifications for available items that don't already have notifications
      availableItems
        .filter(item => !existingNotificationItemIds.includes(item.id))
        .forEach(item => {
          addNotification(
            NOTIFICATION_TYPES.ITEM_AVAILABLE,
            `${item.name} is available for assignment`,
            item.id
          );
        });
    } catch (error) {
      console.error('Failed to check available items:', error);
    }
  };
  
  // Delete a notification
  const deleteNotification = (notificationId) => {
    try {
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      
      setNotifications(updatedNotifications);
      saveNotifications(updatedNotifications);
      
      // Update unread count
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    try {
      setNotifications([]);
      saveNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        addNotification,
        checkUnassignedItems,
        checkAvailableItems,
        deleteNotification,
        clearAllNotifications,
        NOTIFICATION_TYPES
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
