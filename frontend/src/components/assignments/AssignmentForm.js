import React, { useState, useEffect } from 'react';
import { Toast } from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { validateAssignmentForm } from '../../utils/validation';
import useDebounce from '../../hooks/useDebounce';
import { formatDate } from '../../utils/dateUtils';

const AssignmentForm = ({ 
  assignment, 
  availableItems, 
  availableStaff, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    staffId: assignment.staffId || '',
    itemId: assignment.itemId || '',
    dueDate: assignment.dueDate || formatDate(new Date()),
    notes: assignment.notes || '',
    priority: assignment.priority || 'normal'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Track staff member's current assignments
  useEffect(() => {
    if (formData.staffId) {
      const staff = availableStaff.find(s => s.id === formData.staffId);
      setSelectedStaff(staff);
    }
  }, [formData.staffId, availableStaff]);

  // Track selected item details
  useEffect(() => {
    if (formData.itemId) {
      const item = availableItems.find(i => i.id === formData.itemId);
      setSelectedItem(item);
    }
  }, [formData.itemId, availableItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validationErrors = validateAssignmentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach(error => 
        Toast.error(error)
      );
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      Toast.success('Assignment saved successfully');
    } catch (error) {
      Toast.error(error.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (Object.keys(formData).some(key => formData[key] !== assignment[key])) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="assignment-form-overlay">
      <div className="assignment-form">
        <header className="form-header">
          <h2>{assignment.id ? 'Edit Assignment' : 'New Assignment'}</h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={handleCancel}
            aria-label="Close form"
          >
            ×
          </button>
        </header>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="staffId">Staff Member *</label>
            <select
              id="staffId"
              value={formData.staffId}
              onChange={e => setFormData(prev => ({
                ...prev,
                staffId: e.target.value
              }))}
              className={errors.staffId ? 'error' : ''}
              required
            >
              <option value="">Select Staff Member</option>
              {availableStaff.map(staff => (
                <option 
                  key={staff.id} 
                  value={staff.id}
                  disabled={staff.activeAssignments >= 5}
                >
                  {staff.firstName} {staff.lastName} - {staff.department}
                  {staff.activeAssignments >= 5 ? ' (Max assignments reached)' : ''}
                </option>
              ))}
            </select>
            {errors.staffId && (
              <span className="error-message">{errors.staffId}</span>
            )}
            {selectedStaff && (
              <div className="staff-info">
                <p>Current Assignments: {selectedStaff.activeAssignments}</p>
                <p>Department: {selectedStaff.department}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="itemId">Item *</label>
            <select
              id="itemId"
              value={formData.itemId}
              onChange={e => setFormData(prev => ({
                ...prev,
                itemId: e.target.value
              }))}
              className={errors.itemId ? 'error' : ''}
              required
            >
              <option value="">Select Item</option>
              {availableItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.serialNumber}
                  {item.status !== 'available' ? ' (Not available)' : ''}
                </option>
              ))}
            </select>
            {errors.itemId && (
              <span className="error-message">{errors.itemId}</span>
            )}
            {selectedItem && (
              <div className="item-info">
                <p>Category: {selectedItem.category}</p>
                <p>Value: ${selectedItem.value}</p>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  dueDate: e.target.value
                }))}
                min={formatDate(new Date())}
                className={errors.dueDate ? 'error' : ''}
                required
              />
              {errors.dueDate && (
                <span className="error-message">{errors.dueDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  priority: e.target.value
                }))}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              rows={4}
              maxLength={500}
              placeholder="Add any additional notes or instructions..."
            />
            <small className="char-count">
              {formData.notes.length}/500 characters
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? 'Saving...' : assignment.id ? 'Update' : 'Create'} Assignment
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;