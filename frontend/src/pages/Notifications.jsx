/**
 * Notifications Page.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime } from '../utils/formatters';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        notificationService.getByRecipient(user.email),
        notificationService.getByRecipient('ALL_USERS')
      ]);
      
      const userNotifs = results[0].status === 'fulfilled' ? (results[0].value.data || []) : [];
      const globalNotifs = results[1].status === 'fulfilled' ? (results[1].value.data || []) : [];
      
      // Combine and sort by createdAt descending
      const combined = [...userNotifs, ...globalNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setNotifications(combined);
    } catch (err) {
      setError(err.userMessage || 'Failed to load notifications.');
    }
    setLoading(false);
  }

  async function handleMarkRead(id) {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  }

  async function handleMarkUnread(id) {
    try {
      await notificationService.markAsUnread(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    } catch { /* ignore */ }
  }

  async function handleDelete(id) {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      setError(err.userMessage || 'Failed to delete.');
    }
  }

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>{notifications.filter(n => !n.read).length} unread</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {notifications.length === 0 ? (
        <div className="empty-state">No notifications yet.</div>
      ) : (
        <div className="notification-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}>
              <div className="notification-content">
                <h4>{n.title || 'Notification'}</h4>
                <p>{n.message}</p>
                <span className="notification-time">{formatDateTime(n.createdAt)}</span>
              </div>
              <div className="notification-actions">
                {n.read ? (
                  <button className="btn btn-sm btn-outline" onClick={() => handleMarkUnread(n.id)}>Mark Unread</button>
                ) : (
                  <button className="btn btn-sm btn-primary" onClick={() => handleMarkRead(n.id)}>Mark Read</button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
