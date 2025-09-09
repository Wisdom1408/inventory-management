import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';
import { Chart } from 'react-chartjs-2';
import { Toast } from './common/Toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    assignedItems: 0,
    availableItems: 0,
    totalStaff: 0,
    recentActivity: [],
    itemsByCategory: {},
    assignmentsByDepartment: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const api = useApi();

  // Add refresh interval state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Add date range filter
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date()
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/dashboard/stats', {
        params: {
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString()
        }
      });
      setStats(data);
      // Show success toast
      Toast.success('Dashboard data updated');
    } catch (err) {
      setError(err.message);
      Toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [api, dateRange]);

  // Handle auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      }
    }
  };

  // Add export functionality
  const exportDashboardData = () => {
    const data = {
      stats: {
        totalItems: stats.totalItems,
        assignedItems: stats.assignedItems,
        availableItems: stats.availableItems,
        totalStaff: stats.totalStaff
      },
      itemsByCategory: stats.itemsByCategory,
      assignmentsByDepartment: stats.assignmentsByDepartment,
      recentActivity: stats.recentActivity
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <ErrorBoundary>
      <div className="dashboard-container">
        {/* Add control panel */}
        <div className="dashboard-controls">
          <div className="date-filters">
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                start: new Date(e.target.value)
              }))}
            />
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                end: new Date(e.target.value)
              }))}
            />
          </div>

          <div className="refresh-controls">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`refresh-toggle ${autoRefresh ? 'active' : ''}`}
            >
              {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
            </button>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={15000}>15 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
            </select>
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="manual-refresh"
            >
              Refresh Now
            </button>
          </div>

          <button 
            onClick={exportDashboardData}
            className="export-button"
          >
            Export Dashboard Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <h3>Total Items</h3>
            <p>{stats.totalItems}</p>
          </div>
          <div className="card">
            <h3>Assigned Items</h3>
            <p>{stats.assignedItems}</p>
          </div>
          <div className="card">
            <h3>Available Items</h3>
            <p>{stats.availableItems}</p>
          </div>
          <div className="card">
            <h3>Total Staff</h3>
            <p>{stats.totalStaff}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          <div className="chart">
            <h3>Items by Category</h3>
            <Chart 
              type="pie"
              data={{
                labels: Object.keys(stats.itemsByCategory),
                datasets: [{
                  data: Object.values(stats.itemsByCategory),
                  backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                  ]
                }]
              }}
              options={chartOptions}
            />
          </div>

          <div className="chart">
            <h3>Assignments by Department</h3>
            <Chart
              type="bar" 
              data={{
                labels: Object.keys(stats.assignmentsByDepartment),
                datasets: [{
                  data: Object.values(stats.assignmentsByDepartment),
                  backgroundColor: '#36A2EB'
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {stats.recentActivity.length === 0 ? (
              <p className="no-activity">No recent activity</p>
            ) : (
              <ul>
                {stats.recentActivity.map(activity => (
                  <li key={activity.id} className="activity-item">
                    <div className="activity-content">
                      <p className="activity-description">{activity.description}</p>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
