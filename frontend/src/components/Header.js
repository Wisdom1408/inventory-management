import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, logout } from '../authUtils';
import { authAPI } from '../services/api';
import '../styles.css';
import './common/common.css';


const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      // Try backend logout to invalidate token and clear storage
      await authAPI.logout();
    } catch (e) {
      // Fallback: ensure local storage cleared
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      // Clear simple auth flag as well
      logout();
      navigate('/login', { replace: true });
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        } else {
          window.location.reload();
        }
      }, 50);
    }
  };


  // Check if the current path matches the given path
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };


  return (
    <header
      className="header"
      style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        padding: '1rem 0',
        marginBottom: '2rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000, // Keep header above in-page overlays
        pointerEvents: 'auto',
      }}
    >
      <nav
        className="header-nav"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1rem',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#2d3748',
            textDecoration: 'none',
            letterSpacing: '1px',
          }}
        >
          Inventory App
        </Link>
        <ul
          style={{
            display: 'flex',
            gap: '2rem',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            alignItems: 'center',
          }}
        >
          <li>
            <Link
              to="/dashboard"
              style={{
                color: isActive('/dashboard') ? '#5a67d8' : '#4a5568',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
                borderBottom: isActive('/dashboard') ? '2px solid #5a67d8' : 'none',
                paddingBottom: '0.25rem',
              }}
              onMouseOver={e => !isActive('/dashboard') && (e.target.style.color = '#5a67d8')}
              onMouseOut={e => !isActive('/dashboard') && (e.target.style.color = '#4a5568')}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/items"
              style={{
                color: isActive('/items') ? '#5a67d8' : '#4a5568',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
                borderBottom: isActive('/items') ? '2px solid #5a67d8' : 'none',
                paddingBottom: '0.25rem',
              }}
              onMouseOver={e => !isActive('/items') && (e.target.style.color = '#5a67d8')}
              onMouseOut={e => !isActive('/items') && (e.target.style.color = '#4a5568')}
            >
              Items
            </Link>
          </li>
          <li>
            <Link
              to="/staff"
              style={{
                color: isActive('/staff') ? '#5a67d8' : '#4a5568',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
                borderBottom: isActive('/staff') ? '2px solid #5a67d8' : 'none',
                paddingBottom: '0.25rem',
              }}
              onMouseOver={e => !isActive('/staff') && (e.target.style.color = '#5a67d8')}
              onMouseOut={e => !isActive('/staff') && (e.target.style.color = '#4a5568')}
            >
              Staff
            </Link>
          </li>
          <li>
            <Link
              to="/assignments"
              style={{
                color: isActive('/assignments') ? '#5a67d8' : '#4a5568',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
                borderBottom: isActive('/assignments') ? '2px solid #5a67d8' : 'none',
                paddingBottom: '0.25rem',
              }}
              onMouseOver={e => !isActive('/assignments') && (e.target.style.color = '#5a67d8')}
              onMouseOut={e => !isActive('/assignments') && (e.target.style.color = '#4a5568')}
            >
              Assignments
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              style={{
                color: isActive('/admin') ? '#5a67d8' : '#4a5568',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
                borderBottom: isActive('/admin') ? '2px solid #5a67d8' : 'none',
                paddingBottom: '0.25rem',
              }}
              onMouseOver={e => !isActive('/admin') && (e.target.style.color = '#5a67d8')}
              onMouseOut={e => !isActive('/admin') && (e.target.style.color = '#4a5568')}
            >
              Admin
            </Link>
          </li>
          <li>
            <Link
              to="/extras"
              style={{
                color: isActive('/extras') ? '#5a67d8' : '#4a5568',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
                borderBottom: isActive('/extras') ? '2px solid #5a67d8' : 'none',
                paddingBottom: '0.25rem',
              }}
              onMouseOver={e => !isActive('/extras') && (e.target.style.color = '#5a67d8')}
              onMouseOut={e => !isActive('/extras') && (e.target.style.color = '#4a5568')}
            >
              Extras
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: '#e53e3e',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#c53030'}
              onMouseOut={e => e.target.style.backgroundColor = '#e53e3e'}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};


export default Header;
