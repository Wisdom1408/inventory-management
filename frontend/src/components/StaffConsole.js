import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { inventoryAPI } from '../services/api';
import { showToast } from './common/ToastContainer';
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

  // Fetch staff data from API with pagination
  useEffect(() => {
    const fetchAllPages = async (fn) => {
      let pageNum = 1;
      let all = [];
      while (true) {
        const data = await fn(pageNum);
        const batch = Array.isArray(data) ? data : (data?.results || data?.data || []);
        all = all.concat(batch);
        if (!data?.next || batch.length === 0) break;
        pageNum += 1;
      }
      return all;
    };

    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);

        const allStaff = await fetchAllPages(inventoryAPI.getStaff);
        const normalized = allStaff.map(p => ({
          id: p.id,
          name: p.name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          email: p.email || p.work_email || '',
          department: p.department || p.department_name || '',
          position: p.position || p.role || '',
          itemsAssigned: p.items_assigned ?? p.itemsAssigned ?? 0,
          phone: p.phone || p.phone_number || '',
          status: p.status || 'active',
        }));

        setStaff(normalized);
        setFilteredStaff(normalized);
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
      await inventoryAPI.deleteStaff(deleteConfirm.id);
      
      setStaff(prev => prev.filter(person => person.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      showToast('success', 'Staff member deleted successfully');
    } catch (err) {
      console.error('Error deleting staff:', err);
      // Do not replace the whole page; surface a toast instead
      showToast('error', 'Failed to delete staff member. Please try again.');
    }
  };

  // Immediate delete with a browser confirm dialog (simpler, avoids modal/overlay issues)
  const deleteById = async (id, name) => {
    const ok = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!ok) return;
    try {
      await inventoryAPI.deleteStaff(id);
      setStaff(prev => prev.filter(person => person.id !== id));
      showToast('success', 'Staff member deleted successfully');
    } catch (err) {
      console.error('Error deleting staff:', err);
      showToast('error', 'Failed to delete staff member. Please try again.');
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
                {getCurrentPageStaff().map((person) => (
                  <tr key={person.id}>
                    <td>
                      {/* No dedicated view route; link to edit for now */}
                      <Link to={`/staff/${person.id}/edit`} className="staff-link">
                        {person.name}
                      </Link>
                    </td>
                    <td>{person.email}</td>
                    <td>{person.department}</td>
                    <td>{person.position}</td>
                    <td>
                      <span className="items-count">{person.itemsAssigned}</span>
                    </td>
                    <td>{getStatusBadge(person.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/staff/${person.id}/edit`} className="btn btn-sm btn-secondary">
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteById(person.id, person.name)}
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
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>

              <span className="pagination-info">Page {page} of {totalPages}</span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffConsole;
