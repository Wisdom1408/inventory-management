import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');

const MockedDashboard = () => (
  <BrowserRouter>
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Mock API calls to return pending promises
    api.inventoryAPI.getStaff = jest.fn(() => new Promise(() => {}));
    api.inventoryAPI.getItems = jest.fn(() => new Promise(() => {}));
    api.inventoryAPI.getAssignments = jest.fn(() => new Promise(() => {}));

    render(<MockedDashboard />);
    
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  test('renders dashboard data successfully', async () => {
    // Mock successful API responses
    api.inventoryAPI.getStaff = jest.fn(() => Promise.resolve([
      { id: 1, first_name: 'John', last_name: 'Doe' },
      { id: 2, first_name: 'Jane', last_name: 'Smith' }
    ]));
    
    api.inventoryAPI.getItems = jest.fn(() => Promise.resolve([
      { id: 1, name: 'Laptop', category: { id: 1, name: 'Electronics' } },
      { id: 2, name: 'Mouse', category: { id: 1, name: 'Electronics' } },
      { id: 3, name: 'Keyboard', category: { id: 1, name: 'Electronics' } }
    ]));
    
    api.inventoryAPI.getAssignments = jest.fn(() => Promise.resolve([
      { id: 1, staff: { id: 1 }, item: { id: 1 } }
    ]));

    render(<MockedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument();
    });

    // Check if stats are displayed
    expect(screen.getByText('Total Staff')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total staff count
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Total items count
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    api.inventoryAPI.getStaff = jest.fn(() => Promise.reject(new Error('API Error')));
    api.inventoryAPI.getItems = jest.fn(() => Promise.reject(new Error('API Error')));
    api.inventoryAPI.getAssignments = jest.fn(() => Promise.reject(new Error('API Error')));

    render(<MockedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('refresh button works correctly', async () => {
    // Mock successful API responses
    api.inventoryAPI.getStaff = jest.fn(() => Promise.resolve([]));
    api.inventoryAPI.getItems = jest.fn(() => Promise.resolve([]));
    api.inventoryAPI.getAssignments = jest.fn(() => Promise.resolve([]));

    render(<MockedDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    refreshButton.click();

    // Verify API calls were made again
    expect(api.inventoryAPI.getStaff).toHaveBeenCalledTimes(2);
    expect(api.inventoryAPI.getItems).toHaveBeenCalledTimes(2);
    expect(api.inventoryAPI.getAssignments).toHaveBeenCalledTimes(2);
  });
});
