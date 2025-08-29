import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import '../styles.css';

const StaffItemAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data with mock data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data - replace with actual API calls when backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockStaff = [
          { id: 1, name: 'John Doe', email: 'john.doe@company.com', department: 'IT' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', department: 'HR' },
          { id: 3, name: 'Bob Wilson', email: 'bob.wilson@company.com', department: 'Finance' },
          { id: 4, name: 'Alice Johnson', email: 'alice.johnson@company.com', department: 'IT' },
          { id: 5, name: 'Charlie Brown', email: 'charlie.brown@company.com', department: 'Marketing' }
        ];
        
        const mockItems = [
          { id: 1, name: 'Dell Laptop XPS 13', serialNumber: 'DL001', category: 'Laptops', status: 'available' },
          { id: 2, name: 'MacBook Pro 16"', serialNumber: 'MB002', category: 'Laptops', status: 'available' },
          { id: 3, name: 'Samsung Monitor 27"', serialNumber: 'SM003', category: 'Monitors', status: 'available' },
          { id: 4, name: 'Mechanical Keyboard', serialNumber: 'MK005', category: 'Keyboards', status: 'available' },
          { id: 5, name: 'Wireless Mouse', serialNumber: 'WM006', category: 'Mice', status: 'available' }
        ];
        
        const mockAssignments = [
          { 
            id: 1, 
            staff: { id: 1, name: 'John Doe' }, 
            item: { id: 2, name: 'MacBook Pro 16"', serialNumber: 'MB002' }, 
            assignmentDate: '2024-01-15',
            status: 'active'
          },
          { 
            id: 2, 
            staff: { id: 2, name: 'Jane Smith' }, 
            item: { id: 3, name: 'Samsung Monitor 27"', serialNumber: 'SM003' }, 
            assignmentDate: '2024-01-10',
            status: 'active'
          }
        ];
        
        setStaff(mockStaff);
        setItems(mockItems);
        setAssignments(mockAssignments);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load assignment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!selectedStaff || !selectedItem) {
      setError('Please select both staff member and item.');
      return;
    }

    try {
      // Mock assignment creation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const staffMember = staff.find(s => s.id === parseInt(selectedStaff));
      const item = items.find(i => i.id === parseInt(selectedItem));
      
      const newAssignment = {
        id: assignments.length + 1,
        staff: staffMember,
        item: item,
        assignmentDate: assignmentDate,
        status: 'active'
      };
      
      setAssignments(prev => [...prev, newAssignment]);
      
      // Reset form
      setSelectedStaff('');
      setSelectedItem('');
      setAssignmentDate(new Date().toISOString().split('T')[0]);
      setError(null);
      
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Failed to create assignment. Please try again.');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      // Mock assignment removal
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    } catch (err) {
      console.error('Error removing assignment:', err);
      setError('Failed to remove assignment. Please try again.');
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      assignment.staff.name.toLowerCase().includes(searchLower) ||
      assignment.item.name.toLowerCase().includes(searchLower) ||
      assignment.item.serialNumber.toLowerCase().includes(searchLower)
    );
  });

  const availableItems = items.filter(item => 
    !assignments.some(assignment => assignment.item.id === item.id)
  );

  if (loading) {
    return <LoadingSpinner size="large" text="Loading assignments..." />;
  }

  if (error && assignments.length === 0) {
    return (
      <div className="error-container">
        <h2>Error Loading Assignments</h2>
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
          <h1 className="card-title">Staff & Item Assignments</h1>
          <p className="card-subtitle">Manage equipment assignments for your team members</p>
        </div>
        <div className="card-body">

      {/* Create New Assignment Form */}
      <div className="assignment-card">
        <div className="card-header">
          <h2>Create New Assignment</h2>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '0.375rem', color: '#c33' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreateAssignment} className="assignment-form">
          <div className="form-field">
            <label htmlFor="staff_id">Staff Member:</label>
            <select
              id="staff_id"
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              required
            >
              <option value="">Select Staff Member</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="item_id">Available Items:</label>
            <select
              id="item_id"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              required
            >
              <option value="">Select Item</option>
              {availableItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.serialNumber})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
              {availableItems.length} items available for assignment
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="assignment_date">Assignment Date:</label>
            <input
              type="date"
              id="assignment_date"
              value={assignmentDate}
              onChange={(e) => setAssignmentDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Create Assignment
          </button>
        </form>
      </div>

      {/* Current Assignments */}
      <div className="assignment-card">
        <div className="card-header">
          <h2>Current Assignments</h2>
        </div>

        <div className="search-container" style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredAssignments.length > 0 ? (
          <div className="table-container">
            <table className="assignment-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Item</th>
                  <th>Serial Number</th>
                  <th>Assignment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td>{assignment.staff.name}</td>
                    <td>{assignment.item.name}</td>
                    <td>{assignment.item.serialNumber}</td>
                    <td>{assignment.assignmentDate}</td>
                    <td>
                      <span className={`badge ${assignment.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-assignments" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            {searchTerm ? (
              <>
                <p>No assignments match your search.</p>
                <button onClick={() => setSearchTerm('')} className="btn btn-secondary">
                  Clear Search
                </button>
              </>
            ) : (
              <p>No assignments found. Create your first assignment above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffItemAssignment;
