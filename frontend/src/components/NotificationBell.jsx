/**
 * Notification Bell — shows unread count in the Navbar.
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import { formatDateTime } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchUnread() {
    try {
      const res = await notificationService.getUnreadNotifications(user.email);
      const data = res.data || [];
      setNotifications(data.slice(0, 5));
      setUnreadCount(data.length);
    } catch {
      // Silently fail — notification service may not be running
    }
  }

  async function handleMarkRead(id) {
    try {
      await notificationService.markAsRead(id);
      fetchUnread();
    } catch { /* ignore */ }
  }

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            <button onClick={() => { setShowDropdown(false); navigate('/notifications'); }}>
              View All
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="notification-empty">No new notifications</p>
          ) : (
            <ul className="notification-list-dropdown">
              {notifications.map((n) => (
                <li key={n.id} className="notification-item-dropdown" onClick={() => handleMarkRead(n.id)}>
                  <p className="notification-msg">{n.message || n.title || 'Notification'}</p>
                  <span className="notification-time">{formatDateTime(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
