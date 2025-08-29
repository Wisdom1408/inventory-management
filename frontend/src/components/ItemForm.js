import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import '../styles.css';

const ItemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serial_number: '',
    tag_number: '',
    date_of_purchase: '',
    supplier_id: '',
    category_id: '',
    purchase_price: '',
    notes: ''
  });
  
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        // Fetch categories and suppliers
        const [catsResp, supsResp] = await Promise.all([
          inventoryAPI.getCategories(),
          inventoryAPI.getSuppliers(),
        ]);
        const cats = Array.isArray(catsResp) ? catsResp : (catsResp?.results || catsResp?.data || []);
        const sups = Array.isArray(supsResp) ? supsResp : (supsResp?.results || supsResp?.data || []);
        setCategories(cats);
        setSuppliers(sups);

        if (isEditMode) {
          const data = await inventoryAPI.getItem(id);
          // Normalize fields to formData shape
          setFormData({
            name: data.name || '',
            model: data.model || '',
            serial_number: data.serial_number || data.serialNumber || '',
            tag_number: data.tag_number || data.tagNumber || '',
            date_of_purchase: data.date_of_purchase || data.dateOfPurchase || '',
            supplier_id: data.supplier_id || data.supplier || data.supplierId || '',
            category_id: data.category_id || data.category || data.categoryId || '',
            purchase_price: data.purchase_price?.toString?.() || data.purchasePrice?.toString?.() || '',
            notes: data.notes || ''
          });
        }
      } catch (err) {
        setError("Failed to fetch form data. Please check your connection.");
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [id, isEditMode]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.date_of_purchase) {
      errors.date_of_purchase = "Purchase date is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);

      // Build payload and remove fields that should not be empty
      const payload = { ...formData };
      // Remove optional foreign keys if not selected to avoid DRF PK errors
      if (payload.supplier_id === '') delete payload.supplier_id;
      if (payload.category_id === '') delete payload.category_id;
      // Remove optional numeric field if empty
      if (payload.purchase_price === '') delete payload.purchase_price;
      // Trim optional strings
      ['model','serial_number','tag_number','notes'].forEach((k) => {
        if (typeof payload[k] === 'string') payload[k] = payload[k].trim();
      });

      if (isEditMode) {
        await inventoryAPI.updateItem(id, payload);
      } else {
        await inventoryAPI.createItem(payload);
      }
      
      navigate('/items', { 
        state: { 
          message: isEditMode ? 'Item updated successfully' : 'Item created successfully',
          type: 'success'
        } 
      });
    } catch (err) {
      const details = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
      setError(`Failed to save item. ${details}`);
      console.error("Save Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setSubmitting(true);
      await inventoryAPI.deleteItem(id);
      
      navigate('/items', { 
        state: { 
          message: 'Item deleted successfully',
          type: 'success'
        } 
      });
    } catch (err) {
      setError("Failed to delete item.");
      console.error("Delete Error:", err);
      setSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="item-form-loading">
        <div className="item-form-loading-spinner"></div>
        <p>Loading form data...</p>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="item-form-error">
        <div className="item-form-error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Error Loading Form</h3>
        <p>{error}</p>
        <div className="item-form-error-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="item-form-retry-button"
          >
            Retry
          </button>
          <Link to="/items" className="item-form-back-link">
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="item-form-container">
      <div className="item-form-header">
        <div className="item-form-breadcrumb">
          <Link to="/items" className="item-form-breadcrumb-link">
            Items
          </Link>
          <span className="item-form-breadcrumb-separator">/</span>
          <span className="item-form-breadcrumb-current">
            {isEditMode ? `Edit ${formData.name}` : 'Add New Item'}
          </span>
        </div>
      </div>

      <div className="item-form-content">
        <div className="item-form-card">
          <div className="item-form-card-header">
            <h2 className="item-form-title">
              {isEditMode ? `Edit Item: ${formData.name}` : 'Add New Item'}
            </h2>
          </div>
          
          {error && (
            <div className="item-form-alert error">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form className="item-form" onSubmit={handleSubmit}>
            <div className="item-form-grid">
              <div className="item-form-section">
                <h3 className="item-form-section-title">Basic Information</h3>
                
                <div className={`item-form-group ${formErrors.name ? 'has-error' : ''}`}>
                  <label htmlFor="name">Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    id="name"
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter item name"
                    required 
                  />
                  {formErrors.name && <div className="item-form-error-message">{formErrors.name}</div>}
                </div>
                
                <div className="item-form-group">
                  <label htmlFor="model">Model</label>
                  <input 
                    type="text" 
                    id="model"
                    name="model" 
                    value={formData.model} 
                    onChange={handleChange} 
                    placeholder="Enter model number"
                  />
                </div>
                
                <div className="item-form-group">
                  <label htmlFor="serial_number">Serial Number</label>
                  <input 
                    type="text" 
                    id="serial_number"
                    name="serial_number" 
                    value={formData.serial_number} 
                    onChange={handleChange} 
                    placeholder="Enter serial number"
                  />
                </div>
                
                <div className="item-form-group">
                  <label htmlFor="tag_number">Tag Number</label>
                  <input 
                    type="text" 
                    id="tag_number"
                    name="tag_number" 
                    value={formData.tag_number} 
                    onChange={handleChange} 
                    placeholder="Enter tag number"
                  />
                </div>
              </div>
              
              <div className="item-form-section">
                <h3 className="item-form-section-title">Additional Details</h3>
                
                <div className={`item-form-group ${formErrors.date_of_purchase ? 'has-error' : ''}`}>
                  <label htmlFor="date_of_purchase">Purchase Date <span className="required">*</span></label>
                  <input 
                    type="date" 
                    id="date_of_purchase"
                    name="date_of_purchase" 
                    value={formData.date_of_purchase} 
                    onChange={handleChange} 
                    required 
                  />
                  {formErrors.date_of_purchase && <div className="item-form-error-message">{formErrors.date_of_purchase}</div>}
                </div>
                
                <div className="item-form-group">
                  <label htmlFor="supplier_id">Supplier</label>
                  <select 
                    id="supplier_id"
                    name="supplier_id" 
                    value={formData.supplier_id} 
                    onChange={handleChange}
                  >
                    <option value="">Select a Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="item-form-group">
                  <label htmlFor="category_id">Category</label>
                  <select 
                    id="category_id"
                    name="category_id" 
                    value={formData.category_id} 
                    onChange={handleChange}
                  >
                    <option value="">Select a Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="item-form-group">
                  <label htmlFor="purchase_price">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    id="purchase_price"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    placeholder="Enter purchase price"
                  />
                </div>

                <div className="item-form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="item-form-actions">
              <Link to="/items" className="item-form-cancel-button">
                Cancel
              </Link>
              
              {isEditMode && (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className="item-form-delete-button"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Delete'}
                </button>
              )}
              
              <button 
                type="submit" 
                className="item-form-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="item-form-spinner"></span>
                    Processing...
                  </>
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="item-form-modal-overlay">
          <div className="item-form-modal">
            <div className="item-form-modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div className="item-form-modal-body">
              <p>Are you sure you want to delete <strong>{formData.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="item-form-modal-footer">
              <button 
                onClick={cancelDelete}
                className="item-form-modal-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="item-form-modal-confirm"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemForm;
