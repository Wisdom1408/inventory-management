import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import '../styles.css';

const ITEMS_PER_PAGE = 20;

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data - replace with actual API calls when backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockCategories = [
          { id: 1, name: 'Laptops', description: 'Portable computers' },
          { id: 2, name: 'Monitors', description: 'Display screens' },
          { id: 3, name: 'Keyboards', description: 'Input devices' },
          { id: 4, name: 'Mice', description: 'Pointing devices' },
          { id: 5, name: 'Headphones', description: 'Audio devices' }
        ];
        
        const mockItems = [
          { id: 1, name: 'Dell Laptop XPS 13', category: 'Laptops', categoryId: 1, status: 'available', assignedTo: null, serialNumber: 'DL001', condition: 'excellent' },
          { id: 2, name: 'MacBook Pro 16"', category: 'Laptops', categoryId: 1, status: 'assigned', assignedTo: 'John Doe', serialNumber: 'MB002', condition: 'good' },
          { id: 3, name: 'Samsung Monitor 27"', category: 'Monitors', categoryId: 2, status: 'available', assignedTo: null, serialNumber: 'SM003', condition: 'excellent' },
          { id: 4, name: 'LG UltraWide Monitor', category: 'Monitors', categoryId: 2, status: 'assigned', assignedTo: 'Jane Smith', serialNumber: 'LG004', condition: 'good' },
          { id: 5, name: 'Mechanical Keyboard', category: 'Keyboards', categoryId: 3, status: 'available', assignedTo: null, serialNumber: 'MK005', condition: 'excellent' },
          { id: 6, name: 'Wireless Mouse', category: 'Mice', categoryId: 4, status: 'assigned', assignedTo: 'Bob Wilson', serialNumber: 'WM006', condition: 'fair' },
          { id: 7, name: 'Sony Headphones', category: 'Headphones', categoryId: 5, status: 'available', assignedTo: null, serialNumber: 'SH007', condition: 'excellent' },
          { id: 8, name: 'HP Laptop EliteBook', category: 'Laptops', categoryId: 1, status: 'maintenance', assignedTo: null, serialNumber: 'HP008', condition: 'needs repair' }
        ];
        
        setCategories(mockCategories);
        setItems(mockItems);
        setFilteredItems(mockItems);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search items
  useEffect(() => {
    let filtered = items;
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === parseInt(filterCategory));
    }
    
    // Filter by search term
    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Sort items
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
    
    setFilteredItems(filtered);
    setPage(1); // Reset to first page when filtering
  }, [items, search, filterCategory, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentPageItems = getCurrentPageItems().map(item => item.id);
    if (selectedItems.length === currentPageItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentPageItems);
    }
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      // Mock delete - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const getStatusBadge = (status) => {
    const statusClasses = {
      available: 'badge-success',
      assigned: 'badge-info',
      maintenance: 'badge-warning',
      retired: 'badge-danger'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'badge-secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading items..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Items</h2>
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
              <h1 className="card-title">Inventory Items</h1>
              <p className="card-subtitle">Manage your equipment and assets</p>
            </div>
            <Link to="/items/new" className="btn btn-primary">
              Add New Item
            </Link>
          </div>
        </div>
        <div className="card-body">
          <div className="item-list-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="item-list-stats">
        <p>Showing {getCurrentPageItems().length} of {filteredItems.length} items</p>
        {selectedItems.length > 0 && (
          <p>{selectedItems.length} items selected</p>
        )}
      </div>

      <div className="table-container">
        <table className="item-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedItems.length === getCurrentPageItems().length && getCurrentPageItems().length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('serialNumber')} className="sortable">
                Serial Number {sortConfig.key === 'serialNumber' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')} className="sortable">
                Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('assignedTo')} className="sortable">
                Assigned To {sortConfig.key === 'assignedTo' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageItems().map(item => (
              <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </td>
                <td>
                  <Link to={`/items/${item.id}`} className="item-link">
                    {item.name}
                  </Link>
                </td>
                <td>{item.category}</td>
                <td>{item.serialNumber}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td>{item.assignedTo || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/items/${item.id}/edit`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item)}
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

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{itemToDelete?.name}"?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ItemList;
