/**
 * Sidebar — Left navigation panel with role-based menu items.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '&#9776;', roles: null },
  { path: '/donations', label: 'Donations', icon: '&#127859;', roles: [ROLES.DONOR, ROLES.ADMIN, ROLES.NGO] },
  { path: '/create-donation', label: 'Create Donation', icon: '&#10010;', roles: [ROLES.DONOR, ROLES.ADMIN] },
  { path: '/ngos', label: 'NGOs', icon: '&#127970;', roles: [ROLES.NGO, ROLES.ADMIN, ROLES.DONOR] },
  { path: '/logistics', label: 'Logistics', icon: '&#128666;', roles: [ROLES.LOGISTICS, ROLES.ADMIN] },
  { path: '/notifications', label: 'Notifications', icon: '&#128276;', roles: null },
  { path: '/impact', label: 'Impact', icon: '&#127793;', roles: null },
  { path: '/ai-recommendations', label: 'AI Insights', icon: '&#129302;', roles: null },
  { path: '/profile', label: 'Profile', icon: '&#128100;', roles: null },
];

export default function Sidebar() {
  const { user } = useAuth();

  const visibleItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {visibleItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
