import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ItemList from '../ItemList';
import { AuthProvider } from '../../contexts/AuthContext';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');
jest.mock('../../hooks/useApi');

const mockItems = [
  {
    id: 1,
    name: 'Laptop',
    model: 'Dell XPS 13',
    serial_number: 'ABC123',
    tag_number: 'TAG001',
    date_of_purchase: '2023-01-15',
    category: { id: 1, name: 'Electronics' }
  },
  {
    id: 2,
    name: 'Mouse',
    model: 'Logitech MX',
    serial_number: 'DEF456',
    tag_number: 'TAG002',
    date_of_purchase: '2023-02-20',
    category: { id: 1, name: 'Electronics' }
  }
];

const mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Furniture' }
];

const MockedItemList = () => (
  <BrowserRouter>
    <AuthProvider>
      <ItemList />
    </AuthProvider>
  </BrowserRouter>
);

describe('ItemList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the custom hooks
    require('../../hooks/useApi').useItems.mockReturnValue({
      data: mockItems,
      loading: false,
      error: null,
      refetch: jest.fn()
    });
    
    require('../../hooks/useApi').useCategories.mockReturnValue({
      data: mockCategories,
      loading: false,
      error: null
    });
    
    require('../../hooks/useApi').useMutation.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null
    });
  });

  test('renders item list with data', async () => {
    render(<MockedItemList />);
    
    await waitFor(() => {
      expect(screen.getByText('Inventory Items')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Mouse')).toBeInTheDocument();
    });
  });

  test('search functionality works', async () => {
    render(<MockedItemList />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search by name, model, serial, or tag...');
    fireEvent.change(searchInput, { target: { value: 'Laptop' } });
    
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.queryByText('Mouse')).not.toBeInTheDocument();
  });

  test('category filter works', async () => {
    render(<MockedItemList />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    const categorySelect = screen.getByLabelText('Filter by Category:');
    fireEvent.change(categorySelect, { target: { value: '1' } });
    
    // Both items should still be visible as they're both Electronics
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
  });

  test('sorting functionality works', async () => {
    render(<MockedItemList />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    const nameHeader = screen.getByText('Name ↑');
    fireEvent.click(nameHeader);
    
    // Should show descending indicator
    expect(screen.getByText('Name ↓')).toBeInTheDocument();
  });

  test('item selection works', async () => {
    render(<MockedItemList />);
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    const checkboxes = screen.getAllByRole('checkbox');
    const itemCheckbox = checkboxes[1]; // First checkbox is select all
    
    fireEvent.click(itemCheckbox);
    
    expect(screen.getByText('1 items selected')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    require('../../hooks/useApi').useItems.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn()
    });
    
    render(<MockedItemList />);
    
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  test('shows error state', () => {
    require('../../hooks/useApi').useItems.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to fetch items',
      refetch: jest.fn()
    });
    
    render(<MockedItemList />);
    
    expect(screen.getByText('Error Loading Items')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch items')).toBeInTheDocument();
  });

  test('shows empty state when no items', async () => {
    require('../../hooks/useApi').useItems.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    });
    
    render(<MockedItemList />);
    
    await waitFor(() => {
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Add your first inventory item to get started')).toBeInTheDocument();
    });
  });
});
