import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

export interface NotificationSettings {
  priceAlerts: boolean;
  portfolioUpdates: boolean;
  recommendations: boolean;
  goalProgress: boolean;
  marketNews: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    priceAlerts: true,
    portfolioUpdates: true,
    recommendations: true,
    goalProgress: true,
    marketNews: false,
    email: true,
    push: true,
    sms: false
  });
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      duration: notification.duration || 5000
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after duration (if not persistent)
    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }, []);

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Remove all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Show success notification
  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  // Show error notification
  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options
    });
  }, [addNotification]);

  // Show warning notification
  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 8000, // Warnings should stay longer
      ...options
    });
  }, [addNotification]);

  // Show info notification
  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addNotification]);

  // Update notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      // Here you would typically make an API call to save settings
      // await notificationAPI.updateSettings(newSettings);
      
      setSettings(prev => ({ ...prev, ...newSettings }));
      showSuccess('Settings Updated', 'Your notification preferences have been saved.');
      return { success: true };
    } catch (error) {
      showError('Settings Error', 'Failed to update notification settings.');
      return { success: false, error: 'Failed to update settings' };
    }
  }, [showSuccess, showError]);

  // Request push notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      showError('Not Supported', 'This browser does not support notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, [showError]);

  // Send browser notification
  const sendBrowserNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    const hasPermission = await requestPermission();
    
    if (hasPermission && settings.push) {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.error('Failed to send browser notification:', error);
      }
    }

    return null;
  }, [requestPermission, settings.push]);

  // Connect to WebSocket for real-time notifications
  const connectWebSocket = useCallback(() => {
    if (!user?.id || isConnected) return;

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
      const ws = new WebSocket(`${wsUrl}/notifications/${user.id}`);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected for notifications');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Add notification to the list
          addNotification({
            type: data.type || 'info',
            title: data.title,
            message: data.message,
            action: data.action
          });

          // Send browser notification if enabled
          if (settings.push) {
            sendBrowserNotification(data.title, {
              body: data.message,
              tag: data.type
            });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        ws.close();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [user?.id, isConnected, addNotification, settings.push, sendBrowserNotification]);

  // Load notification settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load settings from API or localStorage
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    if (user?.id) {
      const cleanup = connectWebSocket();
      return cleanup;
    }
  }, [user?.id, connectWebSocket]);

  // Request permission on first load if push notifications are enabled
  useEffect(() => {
    if (settings.push && 'Notification' in window && Notification.permission === 'default') {
      requestPermission();
    }
  }, [settings.push, requestPermission]);

  return {
    // State
    notifications,
    settings,
    isConnected,
    unreadCount: notifications.length,
    
    // Notification management
    addNotification,
    removeNotification,
    clearAllNotifications,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Settings
    updateSettings,
    
    // Browser notifications
    requestPermission,
    sendBrowserNotification,
    
    // WebSocket
    connectWebSocket
  };
};