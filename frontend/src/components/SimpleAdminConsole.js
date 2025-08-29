import React from 'react';
import ErrorBoundary from './common/ErrorBoundary';
import '../styles.css';
import './common/common.css';

const SimpleAdminConsole = () => {
  return (
    <ErrorBoundary>
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Admin Console</h1>
            <p className="card-subtitle">Manage categories, suppliers, users, and data import/export</p>
          </div>
          <div className="card-body">
            <div className="admin-section">
              <h2>Category Management</h2>
              <p>Create, edit, and delete categories for inventory items</p>
              
              <div style={{ marginTop: '2rem' }}>
                <h3>Add New Category</h3>
                <form style={{ display: 'flex', gap: '1rem', alignItems: 'end', marginTop: '1rem' }}>
                  <div>
                    <label>Category Name</label>
                    <input type="text" placeholder="Enter category name" style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label>Description</label>
                    <input type="text" placeholder="Enter description" style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                  <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#5a67d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Add Category
                  </button>
                </form>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h3>Existing Categories</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  {['Electronics', 'Furniture', 'Stationery', 'Tools', 'Vehicles'].map((category, index) => (
                    <div key={index} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#333' }}>{category}</h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>Category description here</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ padding: '0.25rem 0.5rem', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                          Edit
                        </button>
                        <button style={{ padding: '0.25rem 0.5rem', backgroundColor: '#f56565', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SimpleAdminConsole;
