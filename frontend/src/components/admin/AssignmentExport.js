
import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import Button from './../common/Button';
import LoadingSpinner from './../common/LoadingSpinner';
import { showToast } from './../common/ToastContainer';
import { exportAssignmentsToExcel } from '../../utils/excelUtils';
import '../../styles.css';
import './../common/common.css';
import './importExport.css';

const AssignmentExport = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportPeriod, setExportPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('excel');
  const [includeFields, setIncludeFields] = useState({
    staff: true,
    item: true,
    date: true,
    category: true,
    supplier: true,
    serialNumber: true,
    tagNumber: true,
    purchaseDate: false,
    purchasePrice: false,
    notes: false
  });
  const [exportInProgress, setExportInProgress] = useState(false);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await inventoryAPI.getAssignments(1);
        // Handle possible pagination or array response shapes
        const list = Array.isArray(response) ? response : (response?.results || response?.items || response?.data || []);

        // Process assignments to ensure all required fields are present
        const processedAssignments = list.map(assignment => ({
          ...assignment,
          assignment_date: assignment.assignment_date || new Date().toISOString().split('T')[0],
          staff: {
            ...assignment.staff,
            department: assignment.staff.department || 'N/A'
          },
          item: {
            ...assignment.item,
            serial_number: assignment.item.serial_number || 'N/A',
            category: assignment.item.category || { name: 'Uncategorized' },
            supplier: assignment.item.supplier || { name: 'Unknown' }
          }
        }));
        
        setAssignments(processedAssignments);
        setError(null);
      } catch (err) {
        const errorMessage = "Failed to fetch assignments. Please check your connection and try again.";
        setError(errorMessage);
        showToast('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);

  // Handle export period change
  const handlePeriodChange = (e) => {
    const period = e.target.value;
    setExportPeriod(period);
    
    // Set default date range based on period
    const today = new Date();
    let start = new Date();
    
    switch (period) {
      case 'daily':
        // Today
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'weekly':
        // Last 7 days
        start.setDate(today.getDate() - 7);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'monthly':
        // Last 30 days
        start.setDate(today.getDate() - 30);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'annually':
        // Last 365 days
        start.setDate(today.getDate() - 365);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'custom':
        // Keep current dates or set to empty if they're not set
        break;
      default:
        // All time
        setStartDate('');
        setEndDate('');
    }
  };

  // Handle field toggle
  const handleFieldToggle = (field) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Filter assignments by date range
  const getFilteredAssignments = () => {
    if (exportPeriod === 'all') {
      return assignments;
    }
    
    if (!startDate || !endDate) {
      return assignments;
    }
    
    return assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.assignment_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end day
      
      return assignmentDate >= start && assignmentDate <= end;
    });
  };

  // Handle export
  const handleExport = async () => {
    if (assignments.length === 0) {
      showToast('error', 'No assignments to export');
      return;
    }
    
    try {
      setExportInProgress(true);
      
      // Get filtered assignments
      const filteredAssignments = getFilteredAssignments();
      
      if (filteredAssignments.length === 0) {
        showToast('warning', 'No assignments found in the selected date range');
        setExportInProgress(false);
        return;
      }
      
      // Generate filename with date range
      let filename = 'assignments';
      if (exportPeriod !== 'all' && startDate && endDate) {
        filename += `_${startDate}_to_${endDate}`;
      } else {
        filename += '_all_time';
      }
      
      if (exportFormat === 'excel') {
        // Generate Excel file
        const excelBlob = await exportAssignmentsToExcel(
          filteredAssignments, 
          exportPeriod,
          includeFields
        );
        
        // Create download link
        const url = URL.createObjectURL(excelBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'csv') {
        // Generate CSV content
        let csvContent = '';
        
        // Add headers
        const headers = [];
        if (includeFields.staff) headers.push('Staff Name');
        if (includeFields.item) headers.push('Item Name');
        if (includeFields.date) headers.push('Assignment Date');
        if (includeFields.category) headers.push('Category');
        if (includeFields.supplier) headers.push('Supplier');
        if (includeFields.serialNumber) headers.push('Serial Number');
        if (includeFields.tagNumber) headers.push('Tag Number');
        if (includeFields.purchaseDate) headers.push('Purchase Date');
        if (includeFields.purchasePrice) headers.push('Purchase Price');
        if (includeFields.notes) headers.push('Notes');
        
        csvContent += headers.join(',') + '\
';
        
        // Add data rows
        filteredAssignments.forEach(assignment => {
          const row = [];
          if (includeFields.staff) row.push(`"${assignment.staff.name}"`);
          if (includeFields.item) row.push(`"${assignment.item.name}"`);
          if (includeFields.date) row.push(assignment.assignment_date);
          if (includeFields.category) row.push(`"${assignment.item.category?.name || 'Uncategorized'}"`);
          if (includeFields.supplier) row.push(`"${assignment.item.supplier?.name || 'Unknown'}"`);
          if (includeFields.serialNumber) row.push(`"${assignment.item.serial_number || ''}"`);
          if (includeFields.tagNumber) row.push(`"${assignment.item.tag_number}"`);
          if (includeFields.purchaseDate) row.push(assignment.item.date_of_purchase || '');
          if (includeFields.purchasePrice) row.push(assignment.item.purchase_price || '');
          if (includeFields.notes) row.push(`"${assignment.item.notes || ''}"`);
          
          csvContent += row.join(',') + '\
';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
      }
      
      showToast('success', `Successfully exported ${filteredAssignments.length} assignments`);
    } catch (error) {
      showToast('error', 'Failed to export assignments: ' + error.message);
    } finally {
      setExportInProgress(false);
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="export-loading">
        <LoadingSpinner size="lg" text="Loading assignments..." />
      </div>
    );
  }

  return (
    <div className="export-container">
      <div className="export-header">
        <h3>Export Assignments</h3>
        <p>Export assignment data for reporting and analysis</p>
      </div>
      
      <div className="export-options">
        <div className="export-section">
          <h4>Date Range</h4>
          <div className="export-option">
            <label htmlFor="export-period">Export Period:</label>
            <select
              id="export-period"
              value={exportPeriod}
              onChange={handlePeriodChange}
              className="export-select"
            >
              <option value="all">All Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {(exportPeriod !== 'all') && (
            <div className="export-date-range">
              <div className="export-date-field">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="export-date-input"
                />
              </div>
              
              <div className="export-date-field">
                <label htmlFor="end-date">End Date:</label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="export-date-input"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="export-section">
          <h4>Export Format</h4>
          <div className="export-format-options">
            <label className="export-format-option">
              <input
                type="radio"
                name="export-format"
                value="excel"
                checked={exportFormat === 'excel'}
                onChange={() => setExportFormat('excel')}
              />
              <span className="format-label">Excel (.xlsx)</span>
            </label>
            
            <label className="export-format-option">
              <input
                type="radio"
                name="export-format"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={() => setExportFormat('csv')}
              />
              <span className="format-label">CSV (.csv)</span>
            </label>
          </div>
        </div>
        
        <div className="export-section">
          <h4>Fields to Include</h4>
          <div className="export-fields-grid">
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.staff}
                onChange={() => handleFieldToggle('staff')}
              />
              <span>Staff Name</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.item}
                onChange={() => handleFieldToggle('item')}
              />
              <span>Item Name</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.date}
                onChange={() => handleFieldToggle('date')}
              />
              <span>Assignment Date</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.category}
                onChange={() => handleFieldToggle('category')}
              />
              <span>Category</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.supplier}
                onChange={() => handleFieldToggle('supplier')}
              />
              <span>Supplier</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.serialNumber}
                onChange={() => handleFieldToggle('serialNumber')}
              />
              <span>Serial Number</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.tagNumber}
                onChange={() => handleFieldToggle('tagNumber')}
              />
              <span>Tag Number</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.purchaseDate}
                onChange={() => handleFieldToggle('purchaseDate')}
              />
              <span>Purchase Date</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.purchasePrice}
                onChange={() => handleFieldToggle('purchasePrice')}
              />
              <span>Purchase Price</span>
            </label>
            
            <label className="export-field-option">
              <input
                type="checkbox"
                checked={includeFields.notes}
                onChange={() => handleFieldToggle('notes')}
              />
              <span>Notes</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="export-summary">
        <h4>Export Summary</h4>
        <p>
          {exportPeriod === 'all' ? (
            <span>Exporting all assignments ({assignments.length} records)</span>
          ) : (
            <span>
              Exporting assignments from {startDate || 'beginning'} to {endDate || 'today'}
              {startDate && endDate && (
                <>
                  {' '}
                  ({getFilteredAssignments().length} records)
                </>
              )}
            </span>
          )}
        </p>
      </div>
      
      <div className="export-actions">
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={loading || assignments.length === 0 || exportInProgress}
          isLoading={exportInProgress}
        >
          {exportInProgress ? 'Exporting...' : `Export to ${exportFormat === 'excel' ? 'Excel' : 'CSV'}`}
        </Button>
      </div>
    </div>
  );
};

export default AssignmentExport;
