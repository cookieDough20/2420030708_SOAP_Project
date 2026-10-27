/**
 * Navbar — Top navigation bar.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <span className="navbar-logo">&#127834;</span>
          <span className="navbar-title">FoodShare</span>
        </Link>
      </div>

      {isAuthenticated && (
        <div className="navbar-actions">
          <NotificationBell />
          <div className="navbar-user">
            <span className="navbar-role-badge">{user?.role}</span>
            <span className="navbar-email">{user?.email}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
