
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';

/**
 * StaffListItem component - Renders a single staff member row
 * Using React.memo to prevent unnecessary re-renders
 */
const StaffListItem = memo(({ 
  staffMember, 
  onDelete, 
  deleteConfirm, 
  onCancelDelete 
}) => {
  const navigate = useNavigate();
  
  // Handle edit button click
  const handleEdit = () => {
    navigate(`/staff/edit/${staffMember.id}`);
  };
  
  // Handle delete button click
  const handleDelete = () => {
    if (deleteConfirm === staffMember.id) {
      onDelete(staffMember.id);
    } else {
      onDelete(staffMember.id, false); // Just set the confirm state, don't delete yet
    }
  };
  
  return (
    <tr>
      <td>{staffMember.name}</td>
      <td>{staffMember.email}</td>
      <td>{staffMember.department}</td>
      <td className="text-center">
        <div className="staff-action-buttons">
          <Button
            variant="primary"
            size="sm"
            onClick={handleEdit}
            className="staff-action-button edit-button"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            }
          >
            Edit
          </Button>
          
          {deleteConfirm === staffMember.id ? (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                className="staff-action-button delete-button"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                }
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelDelete}
                className="staff-action-button"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="staff-action-button delete-button"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              }
            >
              Delete
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these props change
  return (
    prevProps.staffMember.id === nextProps.staffMember.id &&
    prevProps.staffMember.name === nextProps.staffMember.name &&
    prevProps.staffMember.email === nextProps.staffMember.email &&
    prevProps.staffMember.department === nextProps.staffMember.department &&
    prevProps.deleteConfirm === nextProps.deleteConfirm
  );
});

export default StaffListItem;
