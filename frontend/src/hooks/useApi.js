import { useState, useEffect, useCallback } from 'react';
import { inventoryAPI } from '../services/api';

// Custom hook for API calls with loading, error, and data state management
export const useApi = (apiCall, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, refetch: execute };
};

// Specific hooks for common API operations
export const useItems = (page = 1) => {
  return useApi(() => inventoryAPI.getItems(page), [page]);
};

export const useItem = (id) => {
  return useApi(() => inventoryAPI.getItem(id), [id], !!id);
};

export const useCategories = () => {
  return useApi(() => inventoryAPI.getCategories(), []);
};

export const useSuppliers = () => {
  return useApi(() => inventoryAPI.getSuppliers(), []);
};

export const useStaff = () => {
  return useApi(() => inventoryAPI.getStaff(), []);
};

export const useAssignments = (page = 1) => {
  return useApi(() => inventoryAPI.getAssignments(page), [page]);
};

// Hook for mutations (create, update, delete)
export const useMutation = (apiCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(...args);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { mutate, loading, error };
};
