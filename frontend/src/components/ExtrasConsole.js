import React, { useState, lazy, Suspense } from 'react';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';
import '../styles.css';
import './common/common.css';
import './admin/admin.css';
import './admin/importExport.css';

// Dynamic imports for import/export components
const StaffImport = lazy(() => import('./admin/StaffImport'));
const ItemImport = lazy(() => import('./admin/ItemImport'));
const AssignmentExport = lazy(() => import('./admin/AssignmentExport'));

const ExtrasConsole = () => {
  const [activeTab, setActiveTab] = useState('staffImport');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'staffImport':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <StaffImport onImportComplete={() => setActiveTab('staffImport')} />
          </Suspense>
        );
      case 'itemImport':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ItemImport onImportComplete={() => setActiveTab('itemImport')} />
          </Suspense>
        );
      case 'assignmentExport':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AssignmentExport />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <StaffImport onImportComplete={() => setActiveTab('staffImport')} />
          </Suspense>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Extras</h1>
            <p className="card-subtitle">Import and Export tools</p>
          </div>
          <div className="card-body">
            <div className="admin-subtabs">
              <button
                className={`admin-subtab ${activeTab === 'staffImport' ? 'active' : ''}`}
                onClick={() => setActiveTab('staffImport')}
              >
                Staff Import
              </button>
              <button
                className={`admin-subtab ${activeTab === 'itemImport' ? 'active' : ''}`}
                onClick={() => setActiveTab('itemImport')}
              >
                Item Import
              </button>
              <button
                className={`admin-subtab ${activeTab === 'assignmentExport' ? 'active' : ''}`}
                onClick={() => setActiveTab('assignmentExport')}
              >
                Assignment Export
              </button>
            </div>

            <div className="admin-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ExtrasConsole;
