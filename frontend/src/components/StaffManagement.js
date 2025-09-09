import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { Toast } from './common/Toast';
import StaffForm from './StaffForm';
import LoadingSpinner from './common/LoadingSpinner';
import { validateStaffData } from '../utils/validation';
import useDebounce from '../hooks/useDebounce';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    search: ''
  });
  
  const api = useApi();
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch staff with caching
  const fetchStaff = useCallback(async () => {
    const cacheKey = `staff-${JSON.stringify(filters)}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      setStaff(JSON.parse(cached));
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/staff', { 
        params: { ...filters, search: debouncedSearch } 
      });
      setStaff(response.data);
      sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
    } catch (error) {
      Toast.error('Failed to fetch staff data');
      console.error('Staff fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [api, filters, debouncedSearch]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddStaff = async (staffData) => {
    try {
      // Validate staff data
      const validationErrors = validateStaffData(staffData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => Toast.error(error));
        return;
      }

      const response = await api.post('/staff', staffData);
      setStaff(prev => [...prev, response.data]);
      Toast.success('Staff member added successfully');
      setSelectedStaff(null);
      
      // Clear relevant cache
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('staff-'))
        .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to add staff member');
    }
  };

  const handleUpdateStaff = async (id, staffData) => {
    try {
      const validationErrors = validateStaffData(staffData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => Toast.error(error));
        return;
      }

      const response = await api.put(`/staff/${id}`, staffData);
      setStaff(prev => prev.map(s => s.id === id ? response.data : s));
      Toast.success('Staff member updated successfully');
      setSelectedStaff(null);
      
      // Clear cache
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('staff-'))
        .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      // Check for active assignments
      const assignments = await api.get(`/staff/${id}/assignments`);
      if (assignments.data.length > 0) {
        Toast.error('Cannot delete staff member with active assignments');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this staff member?')) {
        return;
      }

      await api.delete(`/staff/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
      Toast.success('Staff member deleted successfully');
      
      // Clear cache
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('staff-'))
        .forEach(key => sessionStorage.removeItem(key));
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="staff-management">
      <div className="controls">
        <div className="filters">
          <input
            type="text"
            placeholder="Search staff..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ 
              ...prev, 
              search: e.target.value 
            }))}
          />
          <select
            value={filters.department}
            onChange={e => setFilters(prev => ({ 
              ...prev, 
              department: e.target.value 
            }))}
          >
            <option value="all">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ 
              ...prev, 
              status: e.target.value 
            }))}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button 
          className="add-staff-btn"
          onClick={() => setSelectedStaff({})}
        >
          Add New Staff
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <table className="staff-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td>{s.employeeId}</td>
                <td>{s.firstName} {s.lastName}</td>
                <td>{s.department}</td>
                <td>{s.position}</td>
                <td>
                  <span className={`status-badge ${s.status}`}>
                    {s.status}
                  </span>
                </td>
                <td>{s.email}</td>
                <td>
                  <button 
                    className="edit-btn"
                    onClick={() => setSelectedStaff(s)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteStaff(s.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedStaff && (
        <StaffForm
          staff={selectedStaff}
          onSubmit={selectedStaff.id ? handleUpdateStaff : handleAddStaff}
          onCancel={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
};

export default StaffManagement;