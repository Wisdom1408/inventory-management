import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/common/LoadingSpinner';
import ToastContainer from './components/common/ToastContainer';
import useNetworkStatus from './hooks/useNetworkStatus';

// Import styles
import './styles.css';
import './styles/modern.css';
import './styles/auth.css';
import './styles/responsive.css';
import './styles/animations.css';
import './components/common/common.css';
import './components/admin/admin.css';

// Lazy load components
const Login = React.lazy(() => import('./components/auth/Login'));
const Register = React.lazy(() => import('./components/auth/Register'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const ItemManagement = React.lazy(() => import('./components/inventory/ItemManagement'));
const StaffManagement = React.lazy(() => import('./components/StaffManagement'));
const AssignmentWorkflow = React.lazy(() => import('./components/assignments/AssignmentWorkflow'));
const AdminConsole = React.lazy(() => import('./components/AdminConsole'));
const NotFound = React.lazy(() => import('./components/NotFound'));
const Unauthorized = React.lazy(() => import('./components/Unauthorized'));

function App() {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="offline-message">
        <h2>You are offline</h2>
        <p>Please check your internet connection and try again.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="app">
              <Navigation />
              <main className="main-content">
                <ToastContainer />
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Protected routes */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/items/*" 
                      element={
                        <ProtectedRoute>
                          <ItemManagement />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/staff/*" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <StaffManagement />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/assignments/*" 
                      element={
                        <ProtectedRoute>
                          <AssignmentWorkflow />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminConsole />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Default routes */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;