import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { inventoryAPI } from '../services/api';
import '../styles.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalStaff: 0,
    staffWithItems: 0,
    staffWithoutItems: 0,
    totalItems: 0,
    availableItems: 0,
    assignedItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummaryData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        // Helper to fetch all pages from paginated endpoints
        const fetchAllPages = async (fn) => {
          let page = 1;
          let all = [];
          while (true) {
            const data = await fn(page);
            // Support both paginated ({results,next}) and array responses
            if (Array.isArray(data)) {
              all = data;
              break;
            }
            const batch = data?.results || data?.data || [];
            all = all.concat(batch);
            if (!data?.next || batch.length === 0) break;
            page += 1;
          }
          return all;
        };

        // Fetch data in parallel
        const [allStaff, allItems, allAssignments] = await Promise.all([
          fetchAllPages((p) => inventoryAPI.getStaff(p)),
          fetchAllPages((p) => inventoryAPI.getItems(p)),
          fetchAllPages((p) => inventoryAPI.getAssignments(p)),
        ]);

        // Compute stats
        const totalStaff = allStaff.length;
        const totalItems = allItems.length;
        const assignedItems = allAssignments.length;
        const availableItems = Math.max(totalItems - assignedItems, 0);
        const uniqueStaffWithItems = new Set(
          allAssignments.map((a) => (a?.staff?.id ?? a?.staff_id))
        );
        const staffWithItems = uniqueStaffWithItems.size;
        const staffWithoutItems = Math.max(totalStaff - staffWithItems, 0);

        setSummary({
          totalStaff,
          staffWithItems,
          staffWithoutItems,
          totalItems,
          availableItems,
          assignedItems,
        });
      } catch (error) {
        console.error('Error fetching summary data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const handleRefresh = () => {
    fetchSummaryData();
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={handleRefresh} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // Calculate percentages for progress bars
  const staffWithItemsPercentage = summary.totalStaff > 0 
    ? Math.round((summary.staffWithItems / summary.totalStaff) * 100) 
    : 0;
  const assignedItemsPercentage = summary.totalItems > 0 
    ? Math.round((summary.assignedItems / summary.totalItems) * 100) 
    : 0;

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="card-title">Dashboard</h1>
              <p className="card-subtitle">Overview of your inventory management system</p>
            </div>
            <button onClick={handleRefresh} className="btn btn-secondary">
              Refresh Data
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="dashboard-stats-row">
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#333', fontSize: '1rem', fontWeight: '500', margin: '0 0 0.5rem 0' }}>Total Staff</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4f46e5' }}>{summary.totalStaff}</div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#333', fontSize: '1rem', fontWeight: '500', margin: '0 0 0.5rem 0' }}>Total Items</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{summary.totalItems}</div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#333', fontSize: '1rem', fontWeight: '500', margin: '0 0 0.5rem 0' }}>Assigned Items</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4caf50' }}>{summary.assignedItems}</div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ color: '#333', fontSize: '1rem', fontWeight: '500', margin: '0 0 0.5rem 0' }}>Available Items</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>{summary.availableItems}</div>
            </div>
          </div>

          <div className="dashboard-charts-row" style={{ marginTop: '2rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Staff Equipment Status</h3>
                <p className="card-subtitle">Distribution of equipment among staff members</p>
              </div>
              <div className="card-body">
                <div className="dashboard-progress-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#333', marginBottom: '0.5rem' }}>
                    <span>Staff with Items: {summary.staffWithItems}</span>
                    <span>{staffWithItemsPercentage}%</span>
                  </div>
                  <div className="dashboard-progress-bar">
                    <div 
                      className="dashboard-progress-fill" 
                      style={{width: `${staffWithItemsPercentage}%`}}
                    ></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#333', marginTop: '1rem', marginBottom: '0.5rem' }}>
                    <span>Staff without Items: {summary.staffWithoutItems}</span>
                    <span>{100 - staffWithItemsPercentage}%</span>
                  </div>
                  <div className="dashboard-progress-bar">
                    <div 
                      className="dashboard-progress-fill secondary" 
                      style={{width: `${100 - staffWithItemsPercentage}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Item Assignment Status</h3>
                <p className="card-subtitle">Current allocation of inventory items</p>
              </div>
              <div className="card-body">
                <div className="dashboard-progress-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#333', marginBottom: '0.5rem' }}>
                    <span>Assigned Items: {summary.assignedItems}</span>
                    <span>{assignedItemsPercentage}%</span>
                  </div>
                  <div className="dashboard-progress-bar">
                    <div 
                      className="dashboard-progress-fill success" 
                      style={{width: `${assignedItemsPercentage}%`}}
                    ></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#333', marginTop: '1rem', marginBottom: '0.5rem' }}>
                    <span>Available Items: {summary.availableItems}</span>
                    <span>{100 - assignedItemsPercentage}%</span>
                  </div>
                  <div className="dashboard-progress-bar">
                    <div 
                      className="dashboard-progress-fill warning" 
                      style={{width: `${100 - assignedItemsPercentage}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
