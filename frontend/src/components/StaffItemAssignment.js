
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { inventoryAPI } from '../services/api';
import AssignmentItem from './AssignmentItem';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { showToast } from './common/ToastContainer';
import ErrorBoundary from './common/ErrorBoundary';
import { useNotifications, NOTIFICATION_TYPES } from '../NotificationSystem';
import '../styles.css';
import '../assignment-syles.css'; 
import './common/common.css';

const StaffItemAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [filterType, setFilterType] = useState('all'); // Removed: currently unused
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [formValues, setFormValues] = useState({
    staff_id: '',
    item_id: '',
    assignment_date: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get notification context
  const { addNotification } = useNotifications();

  // Normalize a date string to YYYY-MM-DD; return '' if falsy or invalid
  const normalizeDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      // If already in YYYY-MM-DD, keep first 10 characters
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
        return dateValue.slice(0, 10);
      }
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Extract a date from various possible backend keys and normalize it
  const extractAssignmentDate = (obj) => {
    if (!obj) return '';
    const possibleKeys = [
      'assignment_date',
      'date_assigned',
      'assigned_date',
      'date',
      'assignmentDate',
      'assignedDate'
    ];
    for (const key of possibleKeys) {
      if (obj[key]) {
        return normalizeDate(obj[key]);
      }
    }
    return '';
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Helper to fetch all pages from a paginated endpoint
        const fetchAllPages = async (fn) => {
          let page = 1;
          let all = [];
          while (true) {
            const data = await fn(page);
            if (Array.isArray(data)) {
              // Non-paginated endpoint
              all = data;
              break;
            }
            const batch = data?.results || data?.data || [];
            all = all.concat(batch);
            if (!data?.next || batch.length === 0) break;
            page += 1;
          }
          return all;
        };

        const [assignmentsData, staffData, itemsData] = await Promise.all([
          fetchAllPages((p) => inventoryAPI.getAssignments(p)),
          fetchAllPages((p) => inventoryAPI.getStaff(p)),
          fetchAllPages((p) => inventoryAPI.getItems(p))
        ]);
        
        // Process assignments data
        const processedAssignments = assignmentsData.map(assignment => ({
          ...assignment,
          // Map any backend date field into assignment_date for UI
          assignment_date: extractAssignmentDate(assignment)
        }));
        
        setAssignments(processedAssignments);
        setStaff(staffData);
        
        // Set all items and calculate available items
        const allItems = itemsData;
        setItems(allItems);
        
        // Calculate which items are already assigned
        const assignedItemIds = processedAssignments.map(assignment => assignment.item.id);
        const availableItems = allItems.filter(item => !assignedItemIds.includes(item.id));
        setAvailableItems(availableItems);
        
        setError(null);
      } catch (err) {
        const errorMessage = `Failed to fetch data. Please check your API endpoints. Error: ${err.message}`;
        setError(errorMessage);
        showToast('error', errorMessage);
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Validate form
  const validateForm = (values) => {
    const errors = {};
    
    if (!values.staff_id) {
      errors.staff_id = 'Please select a staff member';
    }
    
    if (!values.item_id) {
      errors.item_id = 'Please select an item';
    }
    
    if (!values.assignment_date) {
      errors.assignment_date = 'Please select an assignment date';
    } else {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(values.assignment_date)) {
        errors.assignment_date = 'Invalid date format. Use YYYY-MM-DD';
      }
    }
    
    return errors;
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate the field immediately
    const fieldErrors = validateForm({
      ...formValues,
      [name]: value
    });
    
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name]
    }));
  };

  // Handle form blur
  const handleBlur = (e) => {
    const { name } = e.target;
    
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate the field
    const errors = validateForm(formValues);
    setFormErrors(prev => ({
      ...prev,
      [name]: errors[name]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(formValues);
    setFormErrors(errors);
    
    // Mark all fields as touched
    setFormTouched({
      staff_id: true,
      item_id: true,
      assignment_date: true
    });
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      showToast('error', 'Please fix the form errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the data to send
      const assignmentData = {
        staff_id: formValues.staff_id,
        item_id: formValues.item_id,
        assignment_date: formValues.assignment_date
      };
      
      if (editMode && editingAssignment) {
        // Update existing assignment
        const updated = await inventoryAPI.updateAssignment(editingAssignment.id, assignmentData);
        const normalizedUpdated = {
          ...updated,
          assignment_date: extractAssignmentDate(updated)
        };
        
        // Update assignments list with the updated assignment
        setAssignments(prev => 
          prev.map(a => a.id === editingAssignment.id ? normalizedUpdated : a)
        );
        
        showToast('success', "Assignment updated successfully!");
        
        // Add notification
        addNotification(
          NOTIFICATION_TYPES.ASSIGNMENT_CREATED,
          `Assignment updated: ${updated.item.name} assigned to ${updated.staff.name}`,
          updated.item.id
        );
        
        // Exit edit mode
        setEditMode(false);
        setEditingAssignment(null);
      } else {
        // Validate that the item is not already assigned
        const isItemAssigned = assignments.some(
          assignment => assignment.item.id.toString() === formValues.item_id
        );
        
        if (isItemAssigned) {
          showToast('error', "This item is already assigned to someone. Please select another item.");
          setIsSubmitting(false);
          return;
        }
        
        // Create new assignment
        const created = await inventoryAPI.createAssignment(assignmentData);
        const normalizedCreated = {
          ...created,
          assignment_date: extractAssignmentDate(created)
        };
        
        // After successful submission, update the assignments list
        setAssignments(prev => [...prev, normalizedCreated]);
        
        // Update available items
        setAvailableItems(prev => 
          prev.filter(item => item.id.toString() !== formValues.item_id)
        );
        
        showToast('success', "Item successfully assigned!");
        
        // Add notification
        addNotification(
          NOTIFICATION_TYPES.ASSIGNMENT_CREATED,
          `New assignment created: ${created.item.name} assigned to ${created.staff.name}`,
          created.item.id
        );
      }
      
      // Reset form
      resetForm();
      
    } catch (err) {
      const errorMessage = editMode 
        ? "Failed to update assignment. Please try again." 
        : "Failed to create assignment. Please try again.";
      setError(errorMessage);
      showToast('error', `${errorMessage} Error: ${err.message}`);
      console.error("API Error:", err.response ? err.response.data : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormValues({
      staff_id: '',
      item_id: '',
      assignment_date: ''
    });
    setFormErrors({});
    setFormTouched({});
    setEditMode(false);
    setEditingAssignment(null);
  };

  // Handle assignment removal
  const handleRemoveAssignment = useCallback(async (id) => {
    try {
      setLoading(true);
      
      // Find the assignment to get the item before deletion
      const removedAssignment = assignments.find(a => a.id === id);
      
      await inventoryAPI.deleteAssignment(id);
      
      // Update assignments list
      setAssignments(prev => prev.filter(a => a.id !== id));
      
      // Update available items if we found the assignment
      if (removedAssignment) {
        setAvailableItems(prev => [...prev, removedAssignment.item]);
        
        // Add notification
        addNotification(
          NOTIFICATION_TYPES.ASSIGNMENT_REMOVED,
          `Assignment removed: ${removedAssignment.item.name} unassigned from ${removedAssignment.staff.name}`,
          removedAssignment.item.id
        );
      }
      
      showToast('success', "Assignment removed successfully");
      
      // If we were editing this assignment, exit edit mode
      if (editMode && editingAssignment && editingAssignment.id === id) {
        resetForm();
      }
    } catch (err) {
      const errorMessage = "Failed to remove assignment";
      setError(errorMessage);
      showToast('error', `${errorMessage}: ${err.message}`);
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  }, [assignments, editMode, editingAssignment, addNotification]);

  // Handle edit assignment
  const handleEditAssignment = useCallback((assignment) => {
    setEditMode(true);
    setEditingAssignment(assignment);
    
    // Set form values
    setFormValues({
      staff_id: assignment.staff.id.toString(),
      item_id: assignment.item.id.toString(),
      assignment_date: normalizeDate(assignment.assignment_date)
    });
    
    // Clear any previous errors
    setFormErrors({});
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing search
  }, []);

  // Filter assignments based on search term and filter type
  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments;
    const searchLower = searchTerm.toLowerCase();
    return assignments.filter(assignment =>
      assignment.staff.name.toLowerCase().includes(searchLower) ||
      assignment.item.name.toLowerCase().includes(searchLower) ||
      assignment.item.tag_number.toLowerCase().includes(searchLower) ||
      (assignment.item.serial_number && assignment.item.serial_number.toLowerCase().includes(searchLower))
    );
  }, [assignments, searchTerm]);

  // Get current assignments for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAssignments = filteredAssignments.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

  if (loading && assignments.length === 0 && staff.length === 0 && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" text="Loading assignments data..." />
      </div>
    );
  }

  if (error && assignments.length === 0 && staff.length === 0 && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="primary"
            className="w-full"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="assignment-container">
        <div className="assignment-header">
          <h1 className="assignment-title">Staff & Item Assignments</h1>
          <p className="assignment-subtitle">Manage equipment assignments for your team members</p>
        </div>
        
        {/* Create New Assignment - Now on top */}
        <div className="assignment-card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">
              {editMode ? 'Edit Assignment' : 'Create New Assignment'}
            </h2>
          </div>
          
          {!editMode && (
            <div className="form-field" style={{ margin: '0.5rem 0 1rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="toggle"
                  aria-pressed={showAllItems}
                  onClick={() => setShowAllItems(v => !v)}
                  disabled={isSubmitting || loading}
                >
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                  <span className="toggle-label">Show all items (incl. assigned)</span>
                </button>
              </div>
              <p style={{ margin: '0.25rem 0 0.5rem', color: '#6b7280', fontSize: '0.875rem', width: '100%', textAlign: 'right' }}>
                {showAllItems
                  ? 'Assigned items are disabled in the list.'
                  : 'Only items not currently assigned are shown.'}
              </p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="assignment-form">
            <div className="form-field">
              <label htmlFor="staff_id">Staff Member:</label>
              <select
                id="staff_id"
                name="staff_id"
                value={formValues.staff_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={formTouched.staff_id && formErrors.staff_id ? 'error' : ''}
                disabled={isSubmitting || loading}
              >
                <option value="">Select Staff</option>
                {staff.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              {formTouched.staff_id && formErrors.staff_id && (
                <div className="form-error-message">{formErrors.staff_id}</div>
              )}
            </div>
            
            <div className="form-field">
              <label htmlFor="item_id">
                {editMode ? 'Item:' : 'Available Items:'}
              </label>
              {
                /* Determine items to show in the select */
              }
              {(() => {
                const assignedItemIds = assignments.map(a => a.item.id);
                const itemsForSelect = showAllItems && !editMode
                  ? items
                  : availableItems;
                return (
              <select
                id="item_id"
                name="item_id"
                value={formValues.item_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={formTouched.item_id && formErrors.item_id ? 'error' : ''}
                disabled={isSubmitting || loading || (editMode && editingAssignment)}
              >
                <option value="">Select Item</option>
                {editMode && editingAssignment ? (
                  <option value={editingAssignment.item.id}>
                    {editingAssignment.item.name} ({editingAssignment.item.tag_number})
                    {editingAssignment.item.serial_number ? ` - S/N: ${editingAssignment.item.serial_number}` : ''}
                  </option>
                ) : (
                  itemsForSelect.map(item => {
                    const isAssigned = assignedItemIds.includes(item.id);
                    return (
                      <option key={item.id} value={item.id} disabled={showAllItems ? isAssigned : false}>
                        {item.name} ({item.tag_number}) {item.serial_number ? `- S/N: ${item.serial_number}` : ''}
                        {showAllItems && isAssigned ? ' - assigned' : ''}
                      </option>
                    );
                  })
                )}
              </select>
                );
              })()}
              {formTouched.item_id && formErrors.item_id && (
                <div className="form-error-message">{formErrors.item_id}</div>
              )}
              {!editMode && (
                <p className="text-sm text-gray-500 mt-1">
                  {showAllItems
                    ? `${items.length} items shown (assigned items are disabled)`
                    : `${availableItems.length} items available for assignment`}
                </p>
              )}
            </div>
            
            {/* Date Field */}
            <div className="form-field">
              <label htmlFor="assignment_date">Assignment Date:</label>
              <input
                type="date"
                id="assignment_date"
                name="assignment_date"
                value={formValues.assignment_date}
                onChange={handleChange}
                onBlur={handleBlur}
                className={formTouched.assignment_date && formErrors.assignment_date ? 'error' : ''}
                disabled={isSubmitting || loading}
              />
              {formTouched.assignment_date && formErrors.assignment_date && (
                <div className="form-error-message">{formErrors.assignment_date}</div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {editMode && (
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={resetForm}
                  className="assignment-button"
                >
                  Cancel
                </Button>
              )}
              
              <Button 
                type="submit" 
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting || loading}
                className="assignment-button"
              >
                {editMode ? 'Update Assignment' : 'Assign Item'}
              </Button>
            </div>
          </form>
        </div>

        {/* Current Assignments - Below the create form */}
        <div className="assignment-card">
          <div className="card-header">
            <h2 className="card-title">Current Assignments</h2>
          </div>
          
          <div className="assignment-search-container">
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search assignments by name, tag number, or serial number..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="search-clear"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {filteredAssignments.length > 0 ? (
            <>
              <div className="assignment-list-container">
                <ul className="assignment-list">
                  {currentAssignments.map(assignment => (
                    <AssignmentItem
                      key={assignment.id}
                      assignment={assignment}
                      onRemove={handleRemoveAssignment}
                      onEdit={handleEditAssignment}
                    />
                  ))}
                </ul>
              </div>
              
              {/* Pagination Controls */}
              {filteredAssignments.length > itemsPerPage && (
                <div className="pagination-controls">
                  <Button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-assignments">
              {searchTerm ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>No assignments match your search.</p>
                  <Button 
                    onClick={clearSearch} 
                    variant="outline"
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No items are currently assigned.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StaffItemAssignment;
