import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { Toast } from '../common/Toast';
import ItemForm from './ItemForm';
import { ExcelJS } from 'exceljs';

const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: ''
  });

  const api = useApi();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/items', { params: filters });
      setItems(response.data);
    } catch (error) {
      Toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async (itemData) => {
    try {
      const response = await api.post('/items', itemData);
      setItems(prev => [...prev, response.data]);
      Toast.success('Item added successfully');
    } catch (error) {
      Toast.error('Failed to add item');
    }
  };

  const handleUpdateItem = async (id, itemData) => {
    try {
      const response = await api.put(`/items/${id}`, itemData);
      setItems(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
      Toast.success('Item updated successfully');
    } catch (error) {
      Toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await api.delete(`/items/${id}`);
      setItems(prev => prev.filter(item => item.id !== id));
      Toast.success('Item deleted successfully');
    } catch (error) {
      Toast.error('Failed to delete item');
    }
  };

  const exportItems = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Items');

      // Add headers
      worksheet.addRow([
        'ID', 'Name', 'Category', 'Status', 
        'Serial Number', 'Purchase Date', 'Value'
      ]);

      // Add data
      items.forEach(item => {
        worksheet.addRow([
          item.id,
          item.name,
          item.category,
          item.status,
          item.serialNumber,
          item.purchaseDate,
          item.value
        ]);
      });

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-items-${new Date().toISOString()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      Toast.success('Export completed');
    } catch (error) {
      Toast.error('Failed to export items');
    }
  };

  const importItems = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/items/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setItems(prev => [...prev, ...response.data.items]);
      Toast.success(`Imported ${response.data.items.length} items successfully`);
    } catch (error) {
      Toast.error('Failed to import items');
    }
  };

  return (
    <div className="item-management">
      <div className="controls">
        <div className="filters">
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ 
              ...prev, 
              search: e.target.value 
            }))}
          />
          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ 
              ...prev, 
              category: e.target.value 
            }))}
          >
            <option value="all">All Categories</option>
            {/* Add categories dynamically */}
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ 
              ...prev, 
              status: e.target.value 
            }))}
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="actions">
          <button onClick={() => setSelectedItem({})}>Add New Item</button>
          <button onClick={exportItems}>Export Items</button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={importItems}
            style={{ display: 'none' }}
            id="import-items"
          />
          <label htmlFor="import-items" className="button">
            Import Items
          </label>
        </div>
      </div>

      {selectedItem && (
        <ItemForm
          item={selectedItem}
          onSubmit={selectedItem.id ? handleUpdateItem : handleAddItem}
          onCancel={() => setSelectedItem(null)}
        />
      )}

      <table className="items-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Serial Number</th>
            <th>Purchase Date</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.status}</td>
              <td>{item.serialNumber}</td>
              <td>{new Date(item.purchaseDate).toLocaleDateString()}</td>
              <td>${item.value}</td>
              <td>
                <button onClick={() => setSelectedItem(item)}>Edit</button>
                <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemManagement;