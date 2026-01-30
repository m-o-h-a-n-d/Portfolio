import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createEcho } from '../echo';
import { getAuthToken } from '../api/request';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = async (options = {}) => {
    const { silent = false } = options;
    try {
      if (!user?.id) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      if (!silent && !hasLoadedRef.current) {
        setLoading(true);
      }
      const { apiGet, CONTACT_US_ENDPOINTS } = await import('../api/request');
      const response = await apiGet(CONTACT_US_ENDPOINTS.list);
      const payload = response?.data?.data ?? response?.data ?? [];
      const rawMessages = Array.isArray(payload) ? payload : payload ? [payload] : [];
      const messages = rawMessages.map((item) => ({
        id: item.id || Date.now(),
        name: item.name || item.sender_name || 'New Visitor',
        email: item.email || item.sender_email || '',
        subject: item.subject || '',
        message: item.message || 'New message received',
        created_at: item.created_at || item.date || new Date().toISOString(),
        read: item.read ?? false
      }));
      setNotifications(messages);
      setUnreadCount(messages.filter((m) => !m.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (!hasLoadedRef.current) {
        setLoading(false);
        hasLoadedRef.current = true;
      }
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    fetchNotifications();
    // Fallback polling every 30 seconds
    const intervalId = setInterval(() => fetchNotifications({ silent: true }), 30000);

    // Initialize Echo if not already initialized
    if (typeof window !== 'undefined' && !window.Echo) {
      const token = getAuthToken();
      if (token) {
        window.Echo = createEcho(token);
      }
    }

    const echo = typeof window !== 'undefined' ? window.Echo : null;
    if (!echo) return () => clearInterval(intervalId);

    const channelName = `App.Models.User.${user.id}`;
    const channel = echo.private(channelName);

    const handleIncoming = (payload = {}) => {
      console.log('Incoming notification:', payload);
      const notification = payload?.notification || payload || {};
      const name = notification.name || notification.sender_name || 'a visitor';
      
      const newNotification = {
        id: notification.id || Date.now(),
        name: notification.name || notification.sender_name || 'New Visitor',
        email: notification.email || notification.sender_email || '',
        subject: notification.subject || '',
        message: notification.message || 'New message received',
        created_at: notification.created_at || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => {
        // Avoid duplicates if already added by another listener
        if (prev.find(n => n.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
      
      setUnreadCount((prev) => prev + 1);

      toast({
        title: "New Message",
        description: `New message from ${name}`,
      });
    };

    // Listen for Laravel Notifications
    channel.notification(handleIncoming);

    // Listen for custom MessageSent event (common in Laravel)
    // We use a dot prefix for the event name to avoid namespace issues if the backend uses a different one
    channel.listen('.MessageSent', (data) => {
      console.log('MessageSent event received:', data);
      handleIncoming(data);
    });

    // Also listen for any other events by using the underlying pusher instance if available
    // This is a more robust way to "listen to all" if that was the intention
    if (echo.connector && echo.connector.pusher) {
      echo.connector.pusher.connection.bind('message', (data) => {
        console.log('Generic pusher message:', data);
      });
    }

    return () => {
      clearInterval(intervalId);
      echo.leave(channelName);
    };
  }, [toast, user?.id]);

  const markAsRead = async (id) => {
    try {
      const { apiPatch, CONTACT_US_ENDPOINTS } = await import('../api/request');
      await apiPatch(CONTACT_US_ENDPOINTS.markRead(id));

      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const { apiDelete, CONTACT_US_ENDPOINTS } = await import('../api/request');
      await apiDelete(CONTACT_US_ENDPOINTS.delete(id));

      const notificationToDelete = notifications.find(n => n.id === id);
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading,
      fetchNotifications,
      markAsRead, 
      deleteNotification,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
