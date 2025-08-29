
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
// import { AuthProvider } from './contexts/AuthContext'; // Removed - using simple auth
import { isAuthenticated } from './authUtils';
import Header from './components/Header';
import {
  Dashboard,
  ItemList,
  ItemDetail,
  ItemForm,
  StaffConsole,
  StaffForm,
  StaffItemAssignment,
  AdminConsole,
  ExtrasConsole
} from './components/LazyComponents';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/common/ToastContainer';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles.css';
import './styles/modern.css';
import './styles/auth.css';
import './styles/responsive.css';
import './styles/animations.css';
import './components/common/common.css';
import './components/admin/admin.css';
import { NotificationProvider } from './NotificationSystem';

// New component to handle state and navigation within the Router context
const MainContent = () => {
  const location = useLocation();
  
  // Force re-render when authentication state changes
  const [authState, setAuthState] = React.useState(isAuthenticated());
  
  React.useEffect(() => {
    const checkAuth = () => {
      const currentAuthState = isAuthenticated();
      if (currentAuthState !== authState) {
        setAuthState(currentAuthState);
      }
    };
    
    // Check auth state on location change
    checkAuth();
  }, [location.pathname, authState]);

  return (
    <>
      <ToastContainer />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Header />
            <Dashboard key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/items" element={
          <ProtectedRoute>
            <Header />
            <ItemList key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/items/:id" element={
          <ProtectedRoute>
            <Header />
            <ItemDetail key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/items/new" element={
          <ProtectedRoute>
            <Header />
            <ItemForm key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/items/:id/edit" element={
          <ProtectedRoute>
            <Header />
            <ItemForm key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/staff" element={
          <ProtectedRoute>
            <Header />
            <StaffConsole key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/staff/new" element={
          <ProtectedRoute>
            <Header />
            <StaffForm key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/staff/:id/edit" element={
          <ProtectedRoute>
            <Header />
            <StaffForm key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/assignments" element={
          <ProtectedRoute>
            <Header />
            <StaffItemAssignment key={location.pathname}/>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <Header key="admin-header" />
            <AdminConsole key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/extras" element={
          <ProtectedRoute adminOnly={true}>
            <Header key="extras-header" />
            <ExtrasConsole key={location.pathname} />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
          <div className="app-container">
            <MainContent />
          </div>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
