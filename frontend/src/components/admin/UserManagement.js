import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import FormField from '../common/FormField';
import LoadingSpinner from '../common/LoadingSpinner';
import { showToast } from '../common/ToastContainer';
import { userAPI } from '../../services/api';
import useForm from '../../hooks/useForm';
import '../../styles.css';
import '../common/common.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Define validation rules
  const validationRules = {
    username: {
      required: true,
      minLength: 3,
      requiredMessage: 'Username is required'
    },
    email: {
      required: true,
      email: true,
      requiredMessage: 'Email is required',
      emailMessage: 'Please enter a valid email address'
    },
    first_name: { required: false },
    last_name: { required: false },
    password: {
      required: function () {
        return !editingId; // Only required for new users
      },
      minLength: 8,
      requiredMessage: 'Password is required for new users',
      minLengthMessage: 'Password must be at least 8 characters'
    },
    is_staff: { required: false },
    is_active: { required: false }
  };

  // Initialize form with empty values
  const initialValues = {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false,
    is_active: true
  };

  // Load users (paginated)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let page = 1;
      let all = [];
      while (true) {
        const data = await userAPI.getUsers(page);
        const batch = Array.isArray(data) ? data : (data?.results || data?.data || []);
        all = all.concat(batch);
        if (!data?.next || batch.length === 0) break;
        page += 1;
      }
      setUsers(all);
    } catch (err) {
      const status = err?.response?.status;
      const details = err?.response?.data ? JSON.stringify(err.response.data) : err?.message;
      let msg = `Failed to load users`;
      if (status === 401) msg = 'Authentication required. Please log in again.';
      if (status === 403) msg = 'Not permitted. Only staff/admin can view users.';
      setError(`${msg}${details ? ` — ${details}` : ''}`);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const userData = { ...values };

      if (editingId) {
        if (!userData.password) delete userData.password; // optional on update
        const updated = await userAPI.updateUser(editingId, userData);
        showToast('success', 'User updated successfully');
        setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...updated } : u)));
        setEditingId(null);
      } else {
        const created = await userAPI.createUser(userData);
        delete created.password; // ensure not stored
        showToast('success', 'User added successfully');
        setUsers((prev) => [...prev, created]);
      }

      resetForm();
      setError(null);
      return true;
    } catch (err) {
      const details = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
      const errorMessage = `Failed to save user. ${details}`;
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

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = useCallback((user) => {
    setEditingId(user.id);
    setFieldValue('username', user.username);
    setFieldValue('email', user.email);
    setFieldValue('first_name', user.first_name || '');
    setFieldValue('last_name', user.last_name || '');
    setFieldValue('password', '');
    setFieldValue('is_staff', user.is_staff || false);
    setFieldValue('is_active', user.is_active || true);
  }, [setFieldValue]);

  const handleDelete = useCallback(async (id, confirmDelete = true) => {
    if (confirmDelete) {
      try {
        setLoading(true);
        await userAPI.deleteUser(id);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        setDeleteConfirm(null);
        showToast('success', 'User deleted successfully');
      } catch (err) {
        const details = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
        const errorMessage = `Failed to delete user. ${details}`;
        setError(errorMessage);
        showToast('error', errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirm(id);
    }
  }, []);

  const cancelDelete = useCallback(() => setDeleteConfirm(null), []);
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    resetForm();
  }, [resetForm]);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFieldValue(name, checked);
  }, [setFieldValue]);

  if (loading && users.length === 0) {
    return <LoadingSpinner size="lg" text="Loading users..." />;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">User Management</h2>
        <p className="admin-section-description">
          Create, edit, and delete user accounts
        </p>
      </div>

      {/* 🔴 Show inline error message if error exists */}
      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <div className="admin-form-container">
        <h3 className="admin-form-title">
          {editingId ? 'Edit User' : 'Add New User'}
        </h3>

        <form className="admin-form" onSubmit={submitForm}>
          <FormField
            id="username"
            label="Username"
            type="text"
            name="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={errors.username}
            touched={touched.username}
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
          />

          <div className="admin-form-row">
            <FormField
              id="first_name"
              label="First Name"
              type="text"
              name="first_name"
              value={values.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.first_name}
              touched={touched.first_name}
            />

            <FormField
              id="last_name"
              label="Last Name"
              type="text"
              name="last_name"
              value={values.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.last_name}
              touched={touched.last_name}
            />
          </div>

          <FormField
            id="password"
            label={editingId ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required={!editingId}
            error={errors.password}
            touched={touched.password}
          />

          <div className="admin-form-checkboxes">
            <div className="admin-form-checkbox">
              <input
                id="is_staff"
                type="checkbox"
                name="is_staff"
                checked={values.is_staff}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="is_staff">Staff Status (Can access admin site)</label>
            </div>

            <div className="admin-form-checkbox">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                checked={values.is_active}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="is_active">Active (Account is active)</label>
            </div>
          </div>

          <div className="admin-form-actions">
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting || (!isValid && Object.keys(touched).length > 0)}
            >
              {editingId ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>

      <div className="admin-list-container">
        <h3 className="admin-list-title">Users</h3>

        {loading && users.length > 0 && (
          <div className="admin-loading-overlay">
            <LoadingSpinner text="Updating..." />
          </div>
        )}

        {users.length === 0 ? (
          <div className="admin-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" className="admin-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>No users found. Create your first user above.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.first_name || user.last_name
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {user.is_staff && <span className="status-badge staff">Staff</span>}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="admin-action-button"
                      >
                        Edit
                      </Button>

                      {deleteConfirm === user.id ? (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
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
                          onClick={() => handleDelete(user.id, false)}
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

export default UserManagement;
