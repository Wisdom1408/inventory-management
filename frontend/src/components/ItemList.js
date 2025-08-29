import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { inventoryAPI } from '../services/api';
import { showToast } from './common/ToastContainer';
import '../styles.css';

const ITEMS_PER_PAGE = 20;

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // no navigation needed in this component currently

  useEffect(() => {
    const fetchAllPages = async (fn) => {
      let page = 1;
      let all = [];
      while (true) {
        const data = await fn(page);
        // normalize paginated responses {results, next}
        const batch = Array.isArray(data) ? data : (data?.results || data?.data || []);
        all = all.concat(batch);
        if (!data?.next || batch.length === 0) break;
        page += 1;
      }
      return all;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const catsResp = await inventoryAPI.getCategories();
        const cats = Array.isArray(catsResp) ? catsResp : (catsResp?.results || catsResp?.data || []);
        setCategories(cats);
        const categoryNameById = new Map(cats.map(c => [c.id, c.name]));

        // Fetch all items (paginate)
        const allItems = await fetchAllPages(inventoryAPI.getItems);

        // Normalize items to UI shape expected by table
        const normalizedItems = allItems.map(it => {
          const categoryName = it.category?.name || categoryNameById.get(it.category_id) || it.category || '';
          const serialNumber = it.serial_number || it.serialNumber || '';
          const assignedTo = it.assigned_to_name || it.assigned_to?.name || it.assignedTo || null;
          const status = it.status || (assignedTo ? 'assigned' : 'available');
          return {
            id: it.id,
            name: it.name,
            category: categoryName,
            categoryId: it.category_id || it.categoryId,
            serialNumber,
            status,
            assignedTo,
            // capture creation date for sorting
            createdAt: it.created_at || it.createdAt || null,
          };
        });

        setItems(normalizedItems);
        setFilteredItems(normalizedItems);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to refetch items on-demand (e.g., when changing sort)
  const refetchItems = async () => {
    try {
      setRefreshing(true);
      // Fetch all items only (categories are static for this action)
      // Local helper for pagination
      const fetchAllPagesLocal = async (fn) => {
        let page = 1;
        let all = [];
        while (true) {
          const data = await fn(page);
          const batch = Array.isArray(data) ? data : (data?.results || data?.data || []);
          all = all.concat(batch);
          if (!data?.next || batch.length === 0) break;
          page += 1;
        }
        return all;
      };

      const allItems = await refetchItems._itemsPromise || fetchAllPagesLocal(inventoryAPI.getItems);

      // Normalize items (reuse logic)
      const categoryNameById = new Map(categories.map(c => [c.id, c.name]));
      const normalizedItems = allItems.map(it => {
        const categoryName = it.category?.name || categoryNameById.get(it.category_id) || it.category || '';
        const serialNumber = it.serial_number || it.serialNumber || '';
        const assignedTo = it.assigned_to_name || it.assigned_to?.name || it.assignedTo || null;
        const status = it.status || (assignedTo ? 'assigned' : 'available');
        return {
          id: it.id,
          name: it.name,
          category: categoryName,
          categoryId: it.category_id || it.categoryId,
          serialNumber,
          status,
          assignedTo,
          createdAt: it.created_at || it.createdAt || null,
        };
      });
      setItems(normalizedItems);
    } catch (e) {
      console.error('Error refreshing items:', e);
    } finally {
      setRefreshing(false);
      setPage(1);
    }
  };

  // Filter and search items
  useEffect(() => {
    // Start from a shallow copy to avoid mutating state arrays during sort
    let filtered = [...items];
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === parseInt(filterCategory));
    }
    
    // Filter by search term
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(q))
      );
    }
    
    // Sort items
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        // Strict chronological when using createdAt
        if (sortConfig.key === 'createdAt') {
          const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
          return sortConfig.direction === 'ascending' ? aTime - bTime : bTime - aTime;
        }

        // Generic sorting for other fields
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        const aNum = typeof aValue === 'number' ? aValue : Number.NaN;
        const bNum = typeof bValue === 'number' ? bValue : Number.NaN;
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
        }

        aValue = (aValue ?? '').toString();
        bValue = (bValue ?? '').toString();
        return sortConfig.direction === 'ascending'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
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

  // Confirm delete from modal (component scope)
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeletingId(itemToDelete.id);
      await inventoryAPI.deleteItem(itemToDelete.id);
      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      showToast('success', 'Item deleted successfully');
      await refetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      showToast('error', 'Failed to delete item. Please try again.');
    } finally {
      setDeletingId(null);
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

            <div className="filter-container">
              <select
                value={sortConfig.key === 'createdAt' ? (sortConfig.direction === 'descending' ? 'recent' : 'oldest') : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'recent') {
                    setSortConfig({ key: 'createdAt', direction: 'descending' });
                  } else if (val === 'oldest') {
                    setSortConfig({ key: 'createdAt', direction: 'ascending' });
                  } else {
                    setSortConfig({ key: 'name', direction: 'ascending' });
                  }
                  // Auto-refresh data to reflect sorting selection
                  refetchItems();
                }}
                className="filter-select"
              >
                <option value="">Sort by</option>
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {refreshing && (
            <div className="item-list-refreshing" style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
              Refreshing items...
            </div>
          )}

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
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
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
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{itemToDelete?.name}"?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-danger" disabled={!!deletingId}>
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList;
