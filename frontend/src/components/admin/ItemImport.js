
import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../services/api';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { showToast } from '../common/ToastContainer';
import { parseExcelFile, validateItemData, generateItemTemplate } from '../../utils/excelUtils';
import '../../styles.css';
import '../common/common.css';
import './importExport.css';

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d)) return null;
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

const ItemImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [importStep, setImportStep] = useState('upload'); // upload, preview, confirm
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [importResults, setImportResults] = useState({
    success: 0,
    failed: 0,
    details: []
  });

  // Fetch categories and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, suppliersData] = await Promise.all([
          inventoryAPI.getCategories(),
          inventoryAPI.getSuppliers()
        ]);

        setCategories(categoriesData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Failed to fetch categories and suppliers:', error);
        showToast('error', 'Failed to fetch categories and suppliers. Please try again.');
      }
    };

    fetchData();
  }, []);

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
      const { validData, errors } = validateItemData(data);
      
      // Process category and supplier names to IDs
      const processedData = validData.map(item => {
        const processedItem = { ...item };
        
        // Find category ID if category name is provided
        if (item.category) {
          const category = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
          if (category) {
            processedItem.category_id = category.id;
          }
        }
        
        // Find supplier ID if supplier name is provided
        if (item.supplier) {
          const supplier = suppliers.find(s => s.name.toLowerCase() === item.supplier.toLowerCase());
          if (supplier) {
            processedItem.supplier_id = supplier.id;
          }
        }
        
        return processedItem;
      });
      
      setPreviewData(processedData);
      setErrors(errors);
      setImportStep('preview');
    } catch (error) {
      showToast('error', error.message || 'Failed to parse Excel file');
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
    const results = {
      success: 0,
      failed: 0,
      details: []
    };

    try {
      // Import each item
      for (const item of previewData) {
        try {
          // Prepare item data for API - Match field names with backend
          const itemData = {
            name: item.name,
            tag_number: item.tag_number,
            serial_number: item.serial_number || '',
            model: item.model || '',
            category_id: item.category_id || null,
            supplier_id: item.supplier_id || null,
            date_of_purchase: formatDate(item.purchase_date) || null,
            purchase_price: item.purchase_price || null,
            notes: item.notes || ''
          };
          
          // Send the request via centralized API
          await inventoryAPI.createItem(itemData);
          
          // Update success count
          results.success++;
          results.details.push({
            item: item.name,
            status: 'success',
            message: 'Successfully imported'
          });
        } catch (error) {
          // Update failed count
          results.failed++;
          results.details.push({
            item: item.name,
            status: 'error',
            message: error.response?.data?.detail || error.message || 'Unknown error'
          });
        }
      }
      
      // Set import results
      setImportResults(results);
      
      // Show toast with summary
      if (results.failed === 0) {
        showToast('success', `Successfully imported all ${results.success} items`);
      } else {
        showToast('warning', `Imported ${results.success} items, ${results.failed} failed`);
      }
      
      // Reset state
      setFile(null);
      setPreviewData(null);
      setErrors([]);
      setImportStep('results');
      
      // Notify parent component
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast('error', 'Failed to import items: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    try {
      const template = generateItemTemplate();
      const url = URL.createObjectURL(template);

      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'item_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
      
      showToast('success', 'Template downloaded successfully');
    } catch (error) {
      showToast('error', 'Failed to download template: ' + error.message);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFile(null);
    setPreviewData(null);
    setErrors([]);
    setImportStep('upload');
  };

  // Handle restart
  const handleRestart = () => {
    setImportResults({
      success: 0,
      failed: 0,
      details: []
    });
    setImportStep('upload');
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="import-upload-container">
      <div className="import-instructions">
        <h3>Import Items from Excel</h3>
        <p>Upload an Excel file with item data. The file should have the following columns:</p>
        <ul>
          <li><strong>name</strong> - Item name (required)</li>
          <li><strong>tag_number</strong> - Item tag number (required)</li>
          <li><strong>serial_number</strong> - Item serial number (optional)</li>
          <li><strong>model</strong> - Item model (optional)</li>
          <li><strong>category</strong> - Item category name (optional)</li>
          <li><strong>supplier</strong> - Item supplier name (optional)</li>
          <li><strong>purchase_date</strong> - Purchase date (YYYY-MM-DD) (optional)</li>
          <li><strong>purchase_price</strong> - Purchase price (optional)</li>
          <li><strong>notes</strong> - Additional notes (optional)</li>
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
          id="item-import-file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="item-import-file" className="import-file-label">
          <svg xmlns="http://www.w3.org/2000/svg" className="import-upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Click to select file or drag and drop</span>
          <span className="import-file-hint">.xlsx or .xls files only</span>
        </label>
        {file && (
          <div className="import-file-name">
            Selected file: <strong>{file.name}</strong>
          </div>
        )}
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
          <div className="import-table-scroll">
            <table className="import-preview-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tag Number</th>
                  <th>Serial Number</th>
                  <th>Model</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Purchase Date</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.tag_number}</td>
                    <td>{item.serial_number || '-'}</td>
                    <td>{item.model || '-'}</td>
                    <td>{item.category || '-'}</td>
                    <td>{item.supplier || '-'}</td>
                    <td>{item.purchase_date || '-'}</td>
                    <td>{item.purchase_price || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          Import {previewData.length} Items
        </Button>
      </div>
    </div>
  );

  // Render results step
  const renderResultsStep = () => (
    <div className="import-results-container">
      <h3>Import Results</h3>
      
      <div className="import-results-summary">
        <div className="import-results-card success">
          <div className="results-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" className="results-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="results-count">{importResults.success}</div>
          <div className="results-label">Successful</div>
        </div>
        
        <div className="import-results-card error">
          <div className="results-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" className="results-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="results-count">{importResults.failed}</div>
          <div className="results-label">Failed</div>
        </div>
        
        <div className="import-results-card total">
          <div className="results-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" className="results-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
          <div className="results-count">{importResults.success + importResults.failed}</div>
          <div className="results-label">Total</div>
        </div>
      </div>
      
      {importResults.details.length > 0 && (
        <div className="import-results-details">
          <h4>Import Details</h4>
          <div className="import-table-scroll">
            <table className="import-results-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {importResults.details.map((detail, index) => (
                  <tr key={index} className={detail.status === 'success' ? 'success-row' : 'error-row'}>
                    <td>{detail.item}</td>
                    <td>
                      {detail.status === 'success' ? (
                        <span className="status-badge success">Success</span>
                      ) : (
                        <span className="status-badge error">Failed</span>
                      )}
                    </td>
                    <td>{detail.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="import-actions">
        <Button 
          variant="primary" 
          onClick={handleRestart}
        >
          Import More Items
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
      {importStep === 'results' && renderResultsStep()}
    </div>
  );
};

export default ItemImport;
