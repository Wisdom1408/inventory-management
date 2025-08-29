import React, { memo } from 'react';

/**
 * AssignmentItem component - Renders a single assignment item
 * Using React.memo to prevent unnecessary re-renders
 */
const AssignmentItem = memo(({
  assignment,
  onRemove,
  onEdit
}) => {
  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle remove button click
  const handleRemove = () => {
    if (window.confirm(`Remove assignment of ${assignment.item.name} from ${assignment.staff.name}?`)) {
      onRemove(assignment.id, assignment.item.id); // Pass the assignment and item ID to the parent
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    onEdit(assignment);
  };

  return (
    <li className="assignment-item" style={{
      padding: '1.25rem',
      borderRadius: '0.5rem',
      backgroundColor: '#ffffff', // Strong contrast
      borderLeft: '4px solid var(--primary-color)',
      transition: 'all 0.2s ease-in-out',
      marginBottom: '0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 60%' }}>
          <h3 className="assignment-name" style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>
            {assignment.staff.name}
          </h3>
          <p className="assignment-details" style={{ margin: '0 0 0.5rem' }}>
            Assigned on: {formatDate(assignment.assignment_date)}
          </p>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', margin: 0 }}>
            <li key={assignment.item.id} className="assignment-detail-row" style={{ marginBottom: '0.25rem', fontSize: '0.95rem', color: '#1f2937' }}>
              {assignment.item.name} ({assignment.item.tag_number})
              {assignment.item.serial_number && <span style={{ color: '#374151' }}> - S/N: {assignment.item.serial_number}</span>}
            </li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleEdit}
            aria-label="Edit assignment"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease-in-out',
              color: '#6b7280'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={handleRemove}
            aria-label="Remove assignment"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s ease-in-out',
              color: 'var(--danger-color)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
});

export default AssignmentItem;