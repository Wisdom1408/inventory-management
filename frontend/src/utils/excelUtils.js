
import * as XLSX from 'xlsx';

/**
 * Parse Excel file and return data as JSON
 * @param {File} file - The Excel file to parse
 * @returns {Promise<Array>} - Promise resolving to array of objects representing the Excel data
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract headers and data
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        
        // Convert to array of objects
        const result = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        resolve(result);
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + error.message));
      }
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read Excel file: ' + error.message));
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * Validate staff data from Excel import
 * @param {Array} data - Array of staff objects
 * @returns {Object} - Object containing valid data and errors
 */
export const validateStaffData = (data) => {
  const validData = [];
  const errors = [];
  
  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip the header row
    const rowErrors = [];
    
    // Check required fields
    if (!row.name) {
      rowErrors.push('Name is required');
    }
    
    if (!row.email) {
      rowErrors.push('Email is required');
    } else if (!isValidEmail(row.email)) {
      rowErrors.push('Email is invalid');
    }
    
    if (!row.department) {
      rowErrors.push('Department is required');
    }
    
    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        errors: rowErrors
      });
    } else {
      validData.push({
        name: row.name,
        email: row.email,
        department: row.department
      });
    }
  });
  
  return { validData, errors };
};

/**
 * Validate item data from Excel import
 * @param {Array} data - Array of item objects
 * @returns {Object} - Object containing valid data and errors
 */
export const validateItemData = (data) => {
  const validData = [];
  const errors = [];
  
  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip the header row
    const rowErrors = [];
    
    // Check required fields
    if (!row.name) {
      rowErrors.push('Name is required');
    }
    
    if (!row.tag_number) {
      rowErrors.push('Tag number is required');
    }
    
    if (rowErrors.length > 0) {
      errors.push({
        row: rowNumber,
        errors: rowErrors
      });
    } else {
      validData.push({
        name: row.name,
        tag_number: row.tag_number,
        serial_number: row.serial_number || '',
        model: row.model || '',
        category: row.category || '',
        supplier: row.supplier || '',
        purchase_date: row.purchase_date || '',
        purchase_price: row.purchase_price || '',
        notes: row.notes || ''
      });
    }
  });
  
  return { validData, errors };
};

/**
 * Generate Excel template for staff import
 * @returns {Blob} - Excel file as Blob
 */
export const generateStaffTemplate = () => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Define the headers
  const headers = ['name', 'email', 'department'];
  
  // Create a worksheet with headers and one example row
  const worksheet = XLSX.utils.aoa_to_sheet([
    headers,
    ['John Doe', 'john.doe@example.com', 'IT']
  ]);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Template');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Generate Excel template for item import
 * @returns {Blob} - Excel file as Blob
 */
export const generateItemTemplate = () => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Define the headers
  const headers = [
    'name', 
    'tag_number', 
    'serial_number', 
    'model', 
    'category', 
    'supplier', 
    'purchase_date', 
    'purchase_price', 
    'notes'
  ];
  
  // Create a worksheet with headers and one example row
  const worksheet = XLSX.utils.aoa_to_sheet([
    headers,
    [
      'Laptop', 
      'IT-001', 
      'SN12345678', 
      'Dell XPS 13', 
      'Computers', 
      'Dell', 
      '2023-01-15', 
      '1200.00', 
      'Assigned to IT department'
    ]
  ]);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Items Template');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Export assignments data to Excel
 * @param {Array} assignments - Array of assignment objects
 * @param {string} period - Period for the export (daily, weekly, monthly, annually)
 * @returns {Blob} - Excel file as Blob
 */
export const exportAssignmentsToExcel = (assignments, period) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Define the headers
  const headers = [
    'Staff Name',
    'Staff Email',
    'Staff Department',
    'Item Name',
    'Item Tag Number',
    'Item Serial Number',
    'Assignment Date'
  ];
  
  // Convert assignments to rows
  const rows = assignments.map(assignment => [
    assignment.staff.name,
    assignment.staff.email,
    assignment.staff.department,
    assignment.item.name,
    assignment.item.tag_number,
    assignment.item.serial_number || '',
    assignment.assignment_date
  ]);
  
  // Create a worksheet with headers and data
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Get current date for filename
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, `Assignments ${period}`);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
