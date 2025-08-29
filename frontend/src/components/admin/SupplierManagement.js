
import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI } from '../../services/api';
import Button from '../common/Button';
import FormField from '../common/FormField';
import LoadingSpinner from '../common/LoadingSpinner';
import { showToast } from '../common/ToastContainer';
import useForm from '../../hooks/useForm';
import '../../styles.css';
import '../common/common.css';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Define validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      requiredMessage: 'Supplier name is required'
    },
    contact_person: {
      required: false
    },
    email: {
      required: false,
      email: true,
      emailMessage: 'Please enter a valid email address'
    },
    phone: {
      required: false
    },
    address: {
      required: false
    }
  };

  // Initialize form with empty values
  const initialValues = {
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Update existing supplier
        const updated = await inventoryAPI.updateSupplier(editingId, values);
        showToast('success', 'Supplier updated successfully');
        
        // Update the suppliers list
        setSuppliers(prevSuppliers => 
          prevSuppliers.map(supplier => 
            supplier.id === editingId ? { ...supplier, ...(updated || values) } : supplier
          )
        );
        
        // Reset editing state
        setEditingId(null);
      } else {
        // Create new supplier
        const response = await inventoryAPI.createSupplier(values);
        showToast('success', 'Supplier added successfully');
        
        // Add the new supplier to the list
        setSuppliers(prevSuppliers => [...prevSuppliers, response]);
      }
      
      // Reset form
      resetForm();
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save supplier';
      showToast('error', errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  // Initialize form hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit: submitForm,
    setFieldValue,
    resetForm
  } = useForm(initialValues, validationRules, handleSubmit);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const data = await inventoryAPI.getSuppliers();
        setSuppliers(data);
        setError(null);
      } catch (err) {
        const errorMessage = "Failed to fetch suppliers. Please check your connection and try again.";
        setError(errorMessage);
        showToast('error', errorMessage);
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Handle edit button click
  const handleEdit = useCallback((supplier) => {
    setEditingId(supplier.id);
    setFieldValue('name', supplier.name);
    setFieldValue('contact_person', supplier.contact_person || '');
    setFieldValue('email', supplier.email || '');
    setFieldValue('phone', supplier.phone || '');
    setFieldValue('address', supplier.address || '');
  }, [setFieldValue]);

  // Handle delete confirmation
  const handleDelete = useCallback(async (id, confirmDelete = true) => {
    if (confirmDelete) {
      try {
        setLoading(true);
        await inventoryAPI.deleteSupplier(id);
        setSuppliers(prevSuppliers => prevSuppliers.filter(supplier => supplier.id !== id));
        setDeleteConfirm(null);
        showToast('success', 'Supplier deleted successfully');
      } catch (err) {
        const errorMessage = "Failed to delete supplier. Please try again.";
        setError(errorMessage);
        showToast('error', errorMessage);
        console.error("API Delete Error:", err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirm(id);
    }
  }, []);

  // Cancel delete confirmation
  const cancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    resetForm();
  }, [resetForm]);

  if (loading && suppliers.length === 0) {
    return <LoadingSpinner size="lg" text="Loading suppliers..." />;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Supplier Management</h2>
        <p className="admin-section-description">
          Create, edit, and delete suppliers for inventory items
        </p>
      </div>

      <div className="admin-form-container">
        <h3 className="admin-form-title">
          {editingId ? 'Edit Supplier' : 'Add New Supplier'}
        </h3>
        
        <form className="admin-form" onSubmit={submitForm}>
          <FormField
            id="name"
            label="Supplier Name"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.name}
            touched={touched.name}
          />
          
          <FormField
            id="contact_person"
            label="Contact Person"
            type="text"
            name="contact_person"
            value={values.contact_person}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.contact_person}
            touched={touched.contact_person}
          />
          
          <FormField
            id="email"
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
          />
          
          <FormField
            id="phone"
            label="Phone"
            type="text"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            touched={touched.phone}
          />
          
          <FormField
            id="address"
            label="Address"
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.address}
            touched={touched.address}
          />
          
          <div className="admin-form-actions">
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting || (!isValid && Object.keys(touched).length > 0)}
            >
              {editingId ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </div>

      <div className="admin-list-container">
        <h3 className="admin-list-title">Suppliers</h3>
        
        {loading && suppliers.length > 0 && (
          <div className="admin-loading-overlay">
            <LoadingSpinner text="Updating..." />
          </div>
        )}
        
        {suppliers.length === 0 ? (
          <div className="admin-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No suppliers found. Create your first supplier above.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.contact_person || '-'}</td>
                  <td>{supplier.email || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                        className="admin-action-button"
                      >
                        Edit
                      </Button>
                      
                      {deleteConfirm === supplier.id ? (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(supplier.id)}
                            className="admin-action-button"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelDelete}
                            className="admin-action-button"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(supplier.id, false)}
                          className="admin-action-button"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SupplierManagement;
