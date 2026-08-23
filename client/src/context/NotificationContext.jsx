import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import getAuthToken from '../utils/getAuthToken';
import { useAppSelector } from '../redux/store';
import { BASE_API_URL } from '../services/serverConfig';
import { 
  fetchNotifications, 
  fetchUnreadCount, 
  markNotificationRead, 
  markAllNotificationsRead 
} from '../services/notificationServices';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  // Redux user state tells us if logged in
  const user = useAppSelector((state) => state.userState.user);
  const token = getAuthToken();
  const isLoggedIn = !!user && !!token;

  // Initialize socket when user logs in
  useEffect(() => {
    if (!isLoggedIn) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(BASE_API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    setSocket(newSocket);

    // Fetch initial unread count
    loadUnreadCount();

    newSocket.on('connect', () => {
      console.log('[NotificationSocket] Connected');
      // On reconnect, sync unread count to avoid mismatch, 
      // but only if it's a reconnection (not initial which we just did above).
      // A simple loadUnreadCount() is safe.
      loadUnreadCount();
    });

    newSocket.on('notification:new', (newNotification) => {
      setNotifications((prev) => {
        // Deduplicate using eventId (or _id)
        const exists = prev.some(n => n.eventId === newNotification.eventId);
        if (exists) return prev;
        return [{ ...newNotification, _isNew: true }, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('notification:read', ({ notificationId }) => {
      setNotifications((prev) => {
        let wasUnread = false;
        const updated = prev.map(n => {
          if (n._id === notificationId || n.notificationIds?.includes(notificationId)) {
            if (!n.isRead) wasUnread = true;
            return { ...n, isRead: true };
          }
          return n;
        });
        
        if (wasUnread) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return updated;
      });
    });

    newSocket.on('notification:read_all', () => {
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    newSocket.on('notification:remove', ({ eventId }) => {
      setNotifications((prev) => {
        const notifToRemove = prev.find(n => n.eventId === eventId || n.notificationIds?.includes(eventId));
        if (notifToRemove && !notifToRemove.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter(n => n.eventId !== eventId && !(n.notificationIds?.includes(eventId)));
      });
    });

    newSocket.on('disconnect', () => {
      console.log('[NotificationSocket] Disconnected');
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [isLoggedIn, token]);

  // Fetch notifications whenever activeTab changes or user logs in
  useEffect(() => {
    if (isLoggedIn) {
      loadInitialNotifications();
    }
  }, [isLoggedIn, activeTab]);

  const loadInitialNotifications = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const res = await fetchNotifications(20, null, false, activeTab);
      setNotifications(res.data.notifications);
      if (res.data.notifications.length > 0) {
        setCursor(res.data.notifications[res.data.notifications.length - 1].createdAt);
      }
      setHasMore(res.data.notifications.length === 20);
    } catch (err) {
      console.error('Failed to load initial notifications:', err);
      if (err?.response?.status === 401) {
        setError('Session expired. Please log in again to view notifications.');
      } else {
        setError('Failed to load notifications. Please try again.');
      }
    } finally {
      setIsFetching(false);
    }
  }, [activeTab]);

  const loadMoreNotifications = useCallback(async () => {
    if (!hasMore || isFetching) return;
    try {
      setIsFetching(true);
      const res = await fetchNotifications(20, cursor, false, activeTab);
      setNotifications((prev) => {
        const newItems = res.data.notifications.filter(
          n => !prev.some(p => p._id === n._id || p.eventId === n.eventId)
        );
        return [...prev, ...newItems];
      });
      if (res.data.notifications.length > 0) {
        setCursor(res.data.notifications[res.data.notifications.length - 1].createdAt);
      }
      setHasMore(res.data.notifications.length === 20);
    } catch (err) {
      console.error('Failed to load more notifications:', err);
      if (err?.response?.status === 401) {
        setError('Session expired. Please log in again to view notifications.');
      } else {
        setError('Failed to load more notifications. Please try again.');
      }
    } finally {
      setIsFetching(false);
    }
  }, [activeTab, cursor, hasMore, isFetching]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await fetchUnreadCount();
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notif) => {
    console.log('markAsRead triggered for:', notif);
    // Only proceed if it is actually unread in our local state to prevent loop/spam
    const existingNotif = notifications.find(n => n._id === (typeof notif === 'string' ? notif : notif._id));
    console.log('existingNotif found:', existingNotif);
    
    if (existingNotif && existingNotif.isRead) {
      console.log('Notification already marked read locally, aborting');
      return;
    }

    const notifId = typeof notif === 'string' ? notif : notif._id;
    const isGrouped = notif.notificationIds && notif.notificationIds.length > 1;

    console.log('notifId:', notifId, 'isGrouped:', isGrouped, 'notificationIds:', notif.notificationIds);

    // Optimistic update
    setNotifications((prev) => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    
    // Decrease count appropriately
    const countToDecrease = isGrouped ? notif.notificationIds.length : 1;
    setUnreadCount((prev) => Math.max(0, prev - countToDecrease));
    
    try {
      if (isGrouped) {
        console.log('Sending batch PATCH request for:', notif.notificationIds);
        await markNotificationRead('batch', notif.notificationIds);
      } else {
        console.log('Sending single PATCH request for:', notifId);
        await markNotificationRead(notifId);
      }
      console.log('PATCH request complete');
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;
    
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  }, [unreadCount]);

  const contextValue = useMemo(() => ({
    socket,
    notifications,
    unreadCount,
    isFetching,
    error,
    hasMore,
    activeTab,
    setActiveTab,
    loadMoreNotifications,
    loadInitialNotifications,
    markAsRead,
    markAllAsRead,
  }), [
    socket,
    notifications,
    unreadCount,
    isFetching,
    error,
    hasMore,
    activeTab,
    setActiveTab,
    loadMoreNotifications,
    loadInitialNotifications,
    markAsRead,
    markAllAsRead
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
