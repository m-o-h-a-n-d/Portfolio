import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createEcho } from '../echo';
import { getAuthToken } from '../api/request';
import { toast as sonnerToast } from 'sonner'; // Switching to Sonner for better reliability
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);
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
    if (!user?.id) return;

    fetchNotifications();
    const intervalId = setInterval(() => fetchNotifications({ silent: true }), 15000);

    if (typeof window !== 'undefined' && !window.Echo) {
      const token = getAuthToken();
      if (token) window.Echo = createEcho(token);
    }

    const echo = typeof window !== 'undefined' ? window.Echo : null;
    if (!echo) return () => clearInterval(intervalId);

    const handleIncoming = (payload = {}) => {
      console.log('Incoming real-time data:', payload);
      const notification = payload?.notification || payload?.message || payload || {};
      
      if (payload?.refresh || payload?.type === 'refresh') {
        fetchNotifications({ silent: true });
        return;
      }

      const name = notification.name || notification.sender_name || 'a visitor';
      const messageContent = notification.message || notification.subject || 'New message received';
      const notificationId = notification.id || Date.now();
      
      const newNotification = {
        id: notificationId,
        name: name,
        email: notification.email || notification.sender_email || '',
        subject: notification.subject || '',
        message: messageContent,
        created_at: notification.created_at || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => {
        if (prev.find(n => n.id === notificationId)) return prev;
        
        // Use Sonner for the toast
        sonnerToast.success("🚀 New Message!", {
          description: `From ${name}: ${messageContent.substring(0, 40)}...`,
          duration: 6000,
          position: 'top-right',
        });

        return [newNotification, ...prev];
      });
      
      setUnreadCount(prev => prev + 1);
    };

    const privateChannel = `App.Models.User.${user.id}`;
    echo.private(privateChannel)
      .notification(handleIncoming)
      .listen('.MessageSent', handleIncoming)
      .listen('MessageSent', handleIncoming);

    echo.channel('messages')
      .listen('.MessageSent', handleIncoming)
      .listen('MessageSent', handleIncoming);

    return () => {
      clearInterval(intervalId);
      echo.leave(privateChannel);
      echo.leave('messages');
    };
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      const { apiPatch, CONTACT_US_ENDPOINTS } = await import('../api/request');
      await apiPatch(CONTACT_US_ENDPOINTS.markRead(id));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
      notifications, unreadCount, loading, fetchNotifications, markAsRead, deleteNotification, markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
