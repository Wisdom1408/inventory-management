import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', allowedRoles: ['admin', 'user'] },
    { path: '/items', label: 'Inventory Items', allowedRoles: ['admin', 'user'] },
    { path: '/staff', label: 'Staff Management', allowedRoles: ['admin'] },
    { path: '/assignments', label: 'Assignments', allowedRoles: ['admin', 'user'] },
    { path: '/admin', label: 'Admin Console', allowedRoles: ['admin'] },
  ];

  return (
    <nav className="main-navigation">
      <div className="nav-items">
        {navItems.map(item => {
          const isAllowed = item.allowedRoles.includes(user?.role);
          if (!isAllowed) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
      <div className="breadcrumbs">
        {location.pathname.split('/').filter(Boolean).join(' > ')}
      </div>
    </nav>
  );
};

export default Navigation;