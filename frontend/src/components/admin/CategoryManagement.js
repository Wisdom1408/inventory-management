
import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI } from '../../services/api';
import Button from '../common/Button';
import FormField from '../common/FormField';
import LoadingSpinner from '../common/LoadingSpinner';
import { showToast } from '../common/ToastContainer';
import useForm from '../../hooks/useForm';
import '../../styles.css';
import '../common/common.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await inventoryAPI.getCategories();
      setCategories(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      setError('Failed to load categories');
      showToast('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Define validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      requiredMessage: 'Category name is required'
    },
    description: {
      required: false
    }
  };

  // Initialize form with empty values
  const initialValues = {
    name: '',
    description: ''
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        const updated = await inventoryAPI.updateCategory(editingId, values);
        showToast('success', 'Category updated successfully');
        // Update the categories list optimistically using returned payload when available
        setCategories(prevCategories => prevCategories.map(cat => (
          cat.id === editingId ? { ...cat, ...(updated || values) } : cat
        )));
        
        // Reset editing state
        setEditingId(null);
      } else {
        const newCategory = await inventoryAPI.createCategory(values);
        showToast('success', 'Category added successfully');
        
        // Add the new category to the list
        setCategories(prevCategories => [...prevCategories, newCategory]);
      }
      
      // Reset form
      resetForm();
      return true;
    } catch (err) {
      const errorMessage = 'Failed to save category';
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

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle edit button click
  const handleEdit = useCallback((category) => {
    setEditingId(category.id);
    setFieldValue('name', category.name);
    setFieldValue('description', category.description || '');
  }, [setFieldValue]);

  // Handle delete confirmation
  const handleDelete = useCallback(async (id, confirmDelete = true) => {
    if (confirmDelete) {
      try {
        setLoading(true);
        await inventoryAPI.deleteCategory(id);
        setCategories(prevCategories => prevCategories.filter(cat => cat.id !== id));
        setDeleteConfirm(null);
        showToast('success', 'Category deleted successfully');
      } catch (err) {
        const errorMessage = "Failed to delete category. Please try again.";
        setError(errorMessage);
        showToast('error', errorMessage);
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

  if (loading && categories.length === 0) {
    return <LoadingSpinner size="lg" text="Loading categories..." />;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Category Management</h2>
        <p className="admin-section-description">
          Create, edit, and delete categories for inventory items
        </p>
      </div>

      <div className="admin-form-container">
        <h3 className="admin-form-title">
          {editingId ? 'Edit Category' : 'Add New Category'}
        </h3>
        
        <form className="admin-form" onSubmit={submitForm}>
          <FormField
            id="name"
            label="Category Name"
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
            id="description"
            label="Description (Optional)"
            type="text"
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.description}
            touched={touched.description}
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
              {editingId ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </form>
      </div>

      <div className="admin-list-container">
        <h3 className="admin-list-title">Categories</h3>
        
        {loading && categories.length > 0 && (
          <div className="admin-loading-overlay">
            <LoadingSpinner text="Updating..." />
          </div>
        )}
        
        {categories.length === 0 ? (
          <div className="admin-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p>No categories found. Create your first category above.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || '-'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="admin-action-button"
                      >
                        Edit
                      </Button>
                      
                      {deleteConfirm === category.id ? (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
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
                          onClick={() => handleDelete(category.id, false)}
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

export default CategoryManagement;
