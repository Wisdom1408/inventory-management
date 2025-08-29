
import React, { useState } from 'react';
import { inventoryAPI } from '../../services/api';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { showToast } from '../common/ToastContainer';
import { parseExcelFile, validateStaffData, generateStaffTemplate } from '../../utils/excelUtils';
import '../../styles.css';
import '../common/common.css';
import './admin.css';

const StaffImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [importStep, setImportStep] = useState('upload'); // upload, preview, confirm

  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      showToast('error', 'Please select an Excel file (.xlsx or .xls)');
      return;
    }
    
    setFile(selectedFile);
    setLoading(true);
    
    try {
      // Parse Excel file
      const data = await parseExcelFile(selectedFile);
      
      // Validate data
      const { validData, errors } = validateStaffData(data);
      
      setPreviewData(validData);
      setErrors(errors);
      setImportStep('preview');
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle import confirmation
  const handleImport = async () => {
    if (!previewData || previewData.length === 0) {
      showToast('error', 'No valid data to import');
      return;
    }
    
    setLoading(true);
    
    try {
      // Import each staff member
      const importPromises = previewData.map(staff => inventoryAPI.createStaff(staff));
      
      // Wait for all imports to complete
      await Promise.all(importPromises);
      
      showToast('success', `Successfully imported ${previewData.length} staff members`);
      
      // Reset state
      setFile(null);
      setPreviewData(null);
      setErrors([]);
      setImportStep('upload');
      
      // Notify parent component
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      showToast('error', 'Failed to import staff members: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    const template = generateStaffTemplate();
    const url = URL.createObjectURL(template);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'staff_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  // Handle cancel
  const handleCancel = () => {
    setFile(null);
    setPreviewData(null);
    setErrors([]);
    setImportStep('upload');
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="import-upload-container">
      <div className="import-instructions">
        <h3>Import Staff from Excel</h3>
        <p>Upload an Excel file with staff data. The file should have the following columns:</p>
        <ul>
          <li><strong>name</strong> - Staff member's name (required)</li>
          <li><strong>email</strong> - Staff member's email (required)</li>
          <li><strong>department</strong> - Staff member's department (required)</li>
        </ul>
        <Button 
          variant="outline" 
          onClick={handleDownloadTemplate}
          className="import-template-button"
        >
          Download Template
        </Button>
      </div>
      
      <div className="import-upload-area">
        <input
          type="file"
          id="staff-import-file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="staff-import-file" className="import-file-label">
          <svg xmlns="http://www.w3.org/2000/svg" className="import-upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Click to select file or drag and drop</span>
          <span className="import-file-hint">.xlsx or .xls files only</span>
        </label>
      </div>
    </div>
  );

  // Render preview step
  const renderPreviewStep = () => (
    <div className="import-preview-container">
      <h3>Preview Import Data</h3>
      
      {errors.length > 0 && (
        <div className="import-errors">
          <h4>Errors Found ({errors.length})</h4>
          <ul className="import-error-list">
            {errors.map((error, index) => (
              <li key={index} className="import-error-item">
                <strong>Row {error.row}:</strong> {error.errors.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="import-preview-table-container">
        <h4>Valid Records ({previewData.length})</h4>
        {previewData.length > 0 ? (
          <table className="import-preview-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((staff, index) => (
                <tr key={index}>
                  <td>{staff.name}</td>
                  <td>{staff.email}</td>
                  <td>{staff.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="import-no-valid-data">
            No valid data found. Please check your file and try again.
          </div>
        )}
      </div>
      
      <div className="import-actions">
        <Button 
          variant="outline" 
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleImport}
          disabled={previewData.length === 0}
        >
          Import {previewData.length} Staff Members
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="import-loading">
        <LoadingSpinner size="lg" text="Processing..." />
      </div>
    );
  }

  return (
    <div className="import-container">
      {importStep === 'upload' && renderUploadStep()}
      {importStep === 'preview' && renderPreviewStep()}
    </div>
  );
};

export default StaffImport;
