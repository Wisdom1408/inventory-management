
import React, { useState, lazy, Suspense } from 'react';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';
import '../styles.css';
import './common/common.css';
import './admin/admin.css';
import './admin/importExport.css';

// Dynamic imports for admin components
const CategoryManagement = lazy(() => import('./admin/CategoryManagement'));
const SupplierManagement = lazy(() => import('./admin/SupplierManagement'));
const UserManagement = lazy(() => import('./admin/UserManagement'));

const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState('categories');

  // Render the active tab content with Suspense
  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryManagement />
          </Suspense>
        );
      case 'suppliers':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SupplierManagement />
          </Suspense>
        );
      case 'users':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        );
      case 'importExport':
        return null;
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryManagement />
          </Suspense>
        );
    }
  };

  // Import/Export moved to ExtrasConsole

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Admin Console</h1>
            <p className="card-subtitle">Manage categories, suppliers, and users</p>
          </div>
          <div className="card-body">

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3zM12 3v18M3 12h18"/>
            </svg>
            Categories
          </button>
          <button
            className={`admin-tab ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M9 12h6"></path>
              <path d="M9 16h6"></path>
            </svg>
            Suppliers
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Users
          </button>
          {null}
        </div>

        {null}

            <div className="admin-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminConsole;
