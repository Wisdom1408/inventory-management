
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import useForm from '../hooks/useForm';
import FormField from './common/FormField';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { showToast } from './common/ToastContainer';
import ErrorBoundary from './common/ErrorBoundary';
import '../styles.css';
import './common/common.css';

const StaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);

  // Define validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      requiredMessage: 'Staff name is required'
    },
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email address is required',
      emailMessage: 'Please enter a valid email address'
    },
    department: {
      required: true,
      requiredMessage: 'Department is required'
    }
  };

  // Initialize form with empty values
  const initialValues = {
    name: '',
    email: '',
    department: ''
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (id) {
        await inventoryAPI.updateStaff(id, values);
      } else {
        await inventoryAPI.createStaff(values);
      }
      showToast('success', id ? 'Staff member updated successfully' : 'Staff member added successfully');
      navigate('/staff', { 
        state: { 
          message: id ? 'Staff member updated successfully' : 'Staff member added successfully',
          type: 'success'
        },
        replace: true
      });
    } catch (err) {
      const errorMessage = 'Failed to save staff member';
      showToast('error', errorMessage);
      setError(errorMessage);
      return false;
    }
    return true;
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

  // Fetch staff data if editing
  useEffect(() => {
    if (id) {
      const fetchStaff = async () => {
        try {
          setLoading(true);
          const data = await inventoryAPI.getStaffMember(id);
          // Normalize and set values
          setFieldValue('name', data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim());
          setFieldValue('email', data.email || data.work_email || '');
          setFieldValue('department', data.department || data.department_name || '');
          
          setError(null);
        } catch (err) {
          const errorMessage = 'Failed to fetch staff details for editing';
          setError(errorMessage);
          showToast('error', errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchStaff();
    }
  }, [id, setFieldValue]);

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/staff');
  };

  if (loading) {
    return (
      <div className="staff-form-container">
        <div className="staff-form-loading">
          <LoadingSpinner size="lg" text="Loading staff member details..." />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="staff-form-container">
        <div className="staff-form-card">
          <div className="staff-form-header">
            <div className="staff-form-breadcrumb">
              <Link to="/staff" className="staff-form-breadcrumb-link">Staff</Link>
              <span className="staff-form-breadcrumb-separator">/</span>
              <span className="staff-form-breadcrumb-current">
                {id ? `Edit ${values.name || 'Staff Member'}` : 'Add New Staff Member'}
              </span>
            </div>
            <h2 className="staff-form-title">
              {id ? `Edit Staff: ${values.name || ''}` : 'Add New Staff Member'}
            </h2>
          </div>
          
          {error && <div className="staff-form-error">{error}</div>}
          
          <form className="staff-form" onSubmit={submitForm}>
            <FormField
              id="name"
              label="Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.name}
              touched={touched.name}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              }
            />
            
            <FormField
              id="email"
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.email}
              touched={touched.email}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              }
            />
            
            <FormField
              id="department"
              label="Department"
              type="text"
              name="department"
              value={values.department}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={errors.department}
              touched={touched.department}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              }
            />
            
            <div className="staff-form-actions">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                className="staff-form-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting || (!isValid && Object.keys(touched).length > 0)}
                className="staff-form-submit"
              >
                {id ? 'Update Staff' : 'Add Staff'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StaffForm;
