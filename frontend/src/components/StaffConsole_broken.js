import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import '../styles.css';

const STAFF_PER_PAGE = 20;

const StaffConsole = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  // Fetch staff data with mock data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data - replace with actual API calls when backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockStaff = [
          { id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'IT', position: 'Software Engineer', itemsAssigned: 3, phone: '+1-555-0101', status: 'active' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', department: 'HR', position: 'HR Manager', itemsAssigned: 1, phone: '+1-555-0102', status: 'active' },
          { id: 3, name: 'Bob Wilson', email: 'bob.wilson@company.com', department: 'Finance', position: 'Accountant', itemsAssigned: 2, phone: '+1-555-0103', status: 'active' },
          { id: 4, name: 'Alice Johnson', email: 'alice.johnson@company.com', department: 'IT', position: 'System Admin', itemsAssigned: 5, phone: '+1-555-0104', status: 'active' },
          { id: 5, name: 'Charlie Brown', email: 'charlie.brown@company.com', department: 'Marketing', position: 'Marketing Specialist', itemsAssigned: 1, phone: '+1-555-0105', status: 'inactive' },
          { id: 6, name: 'Diana Prince', email: 'diana.prince@company.com', department: 'Operations', position: 'Operations Manager', itemsAssigned: 4, phone: '+1-555-0106', status: 'active' }
        ];
        
        setStaff(mockStaff);
        setFilteredStaff(mockStaff);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Failed to load staff data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Filter and search staff
  useEffect(() => {
    let filtered = staff;
    
    // Filter by search term
    if (search) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(search.toLowerCase()) ||
        person.email.toLowerCase().includes(search.toLowerCase()) ||
        person.department.toLowerCase().includes(search.toLowerCase()) ||
        person.position.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort staff
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (sortConfig.direction === 'ascending') {
          return aValue.toString().localeCompare(bValue.toString());
        } else {
          return bValue.toString().localeCompare(aValue.toString());
        }
      });
    }
    
    setFilteredStaff(filtered);
    setPage(1); // Reset to first page when filtering
  }, [staff, search, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDeleteStaff = (person) => {
    setDeleteConfirm(person);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      // Mock delete - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStaff(prev => prev.filter(person => person.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting staff:', err);
      setError('Failed to delete staff member. Please try again.');
    }
  };

  const getCurrentPageStaff = () => {
    const startIndex = (page - 1) * STAFF_PER_PAGE;
    const endIndex = startIndex + STAFF_PER_PAGE;
    return filteredStaff.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredStaff.length / STAFF_PER_PAGE);

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'badge-success',
      inactive: 'badge-warning',
      suspended: 'badge-danger'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading staff..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Staff</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="card-title">Staff Management</h1>
              <p className="card-subtitle">Manage your team members and their information</p>
            </div>
            <Link to="/staff/new" className="btn btn-primary">
              Add New Staff Member
            </Link>
          </div>
        </div>
        <div className="card-body">

      <div className="staff-console-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="staff-console-stats">
        <p>Showing {getCurrentPageStaff().length} of {filteredStaff.length} staff members</p>
      </div>

      <div className="table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {sortConfig.key === 'email' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('department')} className="sortable">
                Department {sortConfig.key === 'department' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('position')} className="sortable">
                Position {sortConfig.key === 'position' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('itemsAssigned')} className="sortable">
                Items Assigned {sortConfig.key === 'itemsAssigned' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageStaff().map(person => (
              <tr key={person.id}>
                <td>
                  <Link to={`/staff/${person.id}`} className="staff-link">
                    {person.name}
                  </Link>
                </td>
                <td>{person.email}</td>
                <td>{person.department}</td>
                <td>{person.position}</td>
                <td>
                  <span className="items-count">
                    {person.itemsAssigned}
                  </span>
                </td>
                <td>{getStatusBadge(person.status)}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/staff/${person.id}`} className="btn btn-sm btn-info">
                      View
                    </Link>
                    <Link to={`/staff/${person.id}/edit`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteStaff(person)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{deleteConfirm.name}"?</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffConsole;
