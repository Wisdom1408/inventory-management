import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { Toast } from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';
import AssignmentForm from './AssignmentForm';
import { validateAssignment } from '../../utils/validation';

const AssignmentWorkflow = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    }
  });

  const api = useApi();

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments', { 
        params: {
          ...filters,
          startDate: filters.dateRange.start.toISOString(),
          endDate: filters.dateRange.end.toISOString()
        }
      });
      setAssignments(response.data);
    } catch (error) {
      Toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

  // Fetch available items and staff
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, staffRes] = await Promise.all([
          api.get('/items', { params: { status: 'available' } }),
          api.get('/staff', { params: { status: 'active' } })
        ]);
        setItems(itemsRes.data);
        setStaff(staffRes.data);
      } catch (error) {
        Toast.error('Failed to fetch required data');
      }
    };
    fetchData();
  }, [api]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreateAssignment = async (assignmentData) => {
    try {
      const validationErrors = validateAssignment(assignmentData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => Toast.error(error));
        return;
      }

      const response = await api.post('/assignments', assignmentData);
      setAssignments(prev => [...prev, response.data]);
      Toast.success('Assignment created successfully');
      setSelectedAssignment(null);

      // Update item status
      await api.put(`/items/${assignmentData.itemId}`, {
        status: 'assigned'
      });
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleReturnItem = async (assignmentId) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      
      const response = await api.put(`/assignments/${assignmentId}`, {
        status: 'returned',
        returnDate: new Date().toISOString()
      });

      setAssignments(prev => 
        prev.map(a => a.id === assignmentId ? response.data : a)
      );

      // Update item status
      await api.put(`/items/${assignment.itemId}`, {
        status: 'available'
      });

      Toast.success('Item returned successfully');
    } catch (error) {
      Toast.error('Failed to process return');
    }
  };

  return (
    <div className="assignment-workflow">
      <div className="controls">
        <div className="filters">
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({
              ...prev,
              status: e.target.value
            }))}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </select>

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

          <div className="date-range">
            <input
              type="date"
              value={filters.dateRange.start.toISOString().split('T')[0]}
              onChange={e => setFilters(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  start: new Date(e.target.value)
                }
              }))}
            />
            <input
              type="date"
              value={filters.dateRange.end.toISOString().split('T')[0]}
              onChange={e => setFilters(prev => ({
                ...prev,
                dateRange: {
                  ...prev.dateRange,
                  end: new Date(e.target.value)
                }
              }))}
            />
          </div>
        </div>

        <button
          className="create-assignment-btn"
          onClick={() => setSelectedAssignment({})}
        >
          New Assignment
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <table className="assignments-table">
          <thead>
            <tr>
              <th>Assignment ID</th>
              <th>Staff</th>
              <th>Item</th>
              <th>Department</th>
              <th>Assigned Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr 
                key={assignment.id}
                className={assignment.status === 'overdue' ? 'overdue' : ''}
              >
                <td>{assignment.id}</td>
                <td>{assignment.staffName}</td>
                <td>{assignment.itemName}</td>
                <td>{assignment.department}</td>
                <td>{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${assignment.status}`}>
                    {assignment.status}
                  </span>
                </td>
                <td>
                  {assignment.status === 'active' && (
                    <button
                      className="return-btn"
                      onClick={() => handleReturnItem(assignment.id)}
                    >
                      Return Item
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedAssignment && (
        <AssignmentForm
          assignment={selectedAssignment}
          availableItems={items}
          availableStaff={staff}
          onSubmit={handleCreateAssignment}
          onCancel={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
};

export default AssignmentWorkflow;