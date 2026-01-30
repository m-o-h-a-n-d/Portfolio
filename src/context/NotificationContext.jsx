import React, { createContext, useContext, useState, useEffect } from 'react';
import { createEcho } from '../echo';
import { getAuthToken } from '../api/request';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      if (!user?.id) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    fetchNotifications();

    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      if (token) {
        window.Echo?.disconnect();
        window.Echo = createEcho(token);
      }
    }

    const channelName = `App.Models.User.${user.id}`;
    const echo = typeof window !== 'undefined' ? window.Echo : null;
    const channel = echo ? echo.private(channelName) : null;

    channel?.notification((notification) => {
      const newNotification = {
        id: notification.id || Date.now(),
        name: notification.name || notification.sender_name || 'New Visitor',
        email: notification.email || notification.sender_email || '',
        subject: notification.subject || '',
        message: notification.message || 'New message received',
        created_at: notification.created_at || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      toast({
        title: "New Message",
        description: `New message from ${notification.name || 'a visitor'}`,
      });
    });

    return () => {
      echo?.leave(channelName);
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
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
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
