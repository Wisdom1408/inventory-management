import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import { showToast } from './common/ToastContainer';
import '../styles.css';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true);
        // Fetch item details via API layer
        const itemData = await inventoryAPI.getItem(id);
        setItem(itemData);
        
        // Fetch assignments (all pages) and find if this item is assigned
        const fetchAllAssignments = async () => {
          let page = 1;
          let all = [];
          while (true) {
            const data = await inventoryAPI.getAssignments(page);
            const batch = Array.isArray(data) ? data : (data?.results || data?.data || []);
            all = all.concat(batch);
            if (!data?.next || batch.length === 0) break;
            page += 1;
          }
          return all;
        };
        const allAssignments = await fetchAllAssignments();
        const itemAssignment = allAssignments.find(a => a.item.id.toString() === id);
        
        if (itemAssignment) {
          setAssignment(itemAssignment);
        }
      } catch (err) {
        setError("Failed to fetch item details. It may not exist.");
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemData();
  }, [id]);

  const handleEdit = () => {
    // Correct route is /items/:id/edit
    navigate(`/items/${id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await inventoryAPI.deleteItem(id);
      showToast('success', 'Item deleted successfully');
      navigate('/items', { state: { message: 'Item deleted successfully', type: 'success' }, replace: true });
    } catch (err) {
      setError("Failed to delete item.");
      showToast('error', 'Failed to delete item. Please try again.');
      console.error("API Delete Error:", err);
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="item-detail-loading">
        <div className="item-detail-loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-detail-error">
        <div className="item-detail-error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Error Loading Item</h3>
        <p>{error}</p>
        <div className="item-detail-error-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="item-detail-retry-button"
          >
            Retry
          </button>
          <Link to="/items" className="item-detail-back-link">
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="item-detail-not-found">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2>Item Not Found</h2>
        <p>The requested item does not exist or has been removed.</p>
        <Link to="/items" className="item-detail-back-link">
          Back to Items
        </Link>
      </div>
    );
  }

  return (
    <div className="item-detail-container">
      <div className="item-detail-header">
        <div className="item-detail-breadcrumb">
          <Link to="/items" className="item-detail-breadcrumb-link">
            Items
          </Link>
          <span className="item-detail-breadcrumb-separator">/</span>
          <span className="item-detail-breadcrumb-current">{item.name}</span>
        </div>
        <div className="item-detail-actions">
          <button onClick={handleEdit} className="item-detail-edit-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button onClick={handleDelete} className="item-detail-delete-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="item-detail-content">
        <div className="item-detail-main">
          <div className="item-detail-card">
            <div className="item-detail-card-header">
              <h2 className="item-detail-title">{item.name}</h2>
              {assignment && (
                <div className="item-detail-assignment-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Assigned
                </div>
              )}
            </div>
            
            <div className="item-detail-info-grid">
              <div className="item-detail-info-group">
                <h3 className="item-detail-info-title">Basic Information</h3>
                <div className="item-detail-info-row">
                  <div className="item-detail-info-label">Name</div>
                  <div className="item-detail-info-value">{item.name}</div>
                </div>
                <div className="item-detail-info-row">
                  <div className="item-detail-info-label">Model</div>
                  <div className="item-detail-info-value">{item.model || '-'}</div>
                </div>
                <div className="item-detail-info-row">
                  <div className="item-detail-info-label">Serial Number</div>
                  <div className="item-detail-info-value">{item.serial_number || '-'}</div>
                </div>
                <div className="item-detail-info-row">
                  <div className="item-detail-info-label">Tag Number</div>
                  <div className="item-detail-info-value">{item.tag_number || '-'}</div>
                </div>
              </div>
              
              <div className="item-detail-info-group">
                <h3 className="item-detail-info-title">Additional Details</h3>
                <div className="item-detail-info-row">
                  <div className="item-detail-info-label">Purchase Date</div>
                  <div className="item-detail-info-value">{item.date_of_purchase || '-'}</div>
                </div>
                <div className="item-detail-info-row">
                  <div className="item-detail-info-label">Category</div>
                  <div className="item-detail-info-value">{item.category ? item.category.name : '-'}</div>
                </div>
                <div className="item-detail-info-row">
                  <div className="item-detail-info-label">Supplier</div>
                  <div className="item-detail-info-value">{item.supplier ? item.supplier.name : '-'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {assignment && (
            <div className="item-detail-card">
              <div className="item-detail-card-header">
                <h2 className="item-detail-title">Assignment Information</h2>
              </div>
              <div className="item-detail-assignment-info">
                <div className="item-detail-assignment-user">
                  <div className="item-detail-assignment-avatar">
                    {assignment.staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="item-detail-assignment-details">
                    <h3>{assignment.staff.name}</h3>
                    <p>{assignment.staff.email || 'No email provided'}</p>
                    <p>{assignment.staff.department || 'No department specified'}</p>
                  </div>
                </div>
                <Link to="/assignments" className="item-detail-assignment-link">
                  Manage Assignments
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="item-detail-modal-overlay">
          <div className="item-detail-modal">
            <div className="item-detail-modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div className="item-detail-modal-body">
              <p>Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.</p>
              {assignment && (
                <div className="item-detail-modal-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>This item is currently assigned to <strong>{assignment.staff.name}</strong>. Deleting it will remove the assignment.</span>
                </div>
              )}
            </div>
            <div className="item-detail-modal-footer">
              <button 
                onClick={cancelDelete}
                className="item-detail-modal-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="item-detail-modal-confirm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;