import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import '../styles.css';

// SVG icons for dashboard cards
const icons = {
  staff: (
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20h6M3 20h5v-2a4 4 0 0 0-3-3.87M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
    </svg>
  ),
  items: (
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 3v4M8 3v4" />
    </svg>
  ),
  assignedItems: (
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6M23 11l-3 3-3-3" />
    </svg>
  ),
  availableItems: (
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 3v4M8 3v4" />
    </svg>
  ),
};

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

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data for dashboard - replace with actual API calls when backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockSummary = {
          totalStaff: 25,
          staffWithItems: 18,
          staffWithoutItems: 7,
          totalItems: 150,
          availableItems: 45,
          assignedItems: 105
        };
        
        setSummary(mockSummary);
      } catch (error) {
        console.error('Error fetching summary data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
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
        <div className="dashboard-stat-card primary">
          <div className="dashboard-stat-content">
            <h3>Total Staff</h3>
            <div className="dashboard-stat-value">{summary.totalStaff}</div>
          </div>
        </div>
        
        <div className="dashboard-stat-card info">
          <div className="dashboard-stat-content">
            <h3>Total Items</h3>
            <div className="dashboard-stat-value">{summary.totalItems}</div>
          </div>
        </div>
        
        <div className="dashboard-stat-card success">
          <div className="dashboard-stat-content">
            <h3>Assigned Items</h3>
            <div className="dashboard-stat-value">{summary.assignedItems}</div>
          </div>
        </div>
        
        <div className="dashboard-stat-card warning">
          <div className="dashboard-stat-content">
            <h3>Available Items</h3>
            <div className="dashboard-stat-value">{summary.availableItems}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-row">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Staff Equipment Status</h3>
            <p className="card-subtitle">Distribution of equipment among staff members</p>
          </div>
          <div className="card-body">
            <div className="dashboard-progress-container">
              <div className="dashboard-progress-labels">
                <span>Staff with Items: {summary.staffWithItems}</span>
                <span>{staffWithItemsPercentage}%</span>
              </div>
              <div className="dashboard-progress-bar">
                <div 
                  className="dashboard-progress-fill" 
                  style={{width: `${staffWithItemsPercentage}%`}}
                ></div>
              </div>
              <div className="dashboard-progress-labels">
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
              <div className="dashboard-progress-labels">
                <span>Assigned Items: {summary.assignedItems}</span>
                <span>{assignedItemsPercentage}%</span>
              </div>
              <div className="dashboard-progress-bar">
                <div 
                  className="dashboard-progress-fill success" 
                  style={{width: `${assignedItemsPercentage}%`}}
                ></div>
              </div>
              <div className="dashboard-progress-labels">
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
  );
};

export default Dashboard;
