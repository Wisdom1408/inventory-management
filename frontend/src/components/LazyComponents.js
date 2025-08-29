import React, { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load components for code splitting
const LazyDashboard = lazy(() => import('./Dashboard'));
const LazyItemList = lazy(() => import('./ItemList'));
const LazyItemDetail = lazy(() => import('./ItemDetail'));
const LazyItemForm = lazy(() => import('./ItemForm'));
const LazyStaffConsole = lazy(() => import('./StaffConsole'));
const LazyStaffForm = lazy(() => import('./StaffForm'));
const LazyStaffItemAssignment = lazy(() => import('./StaffItemAssignment'));
const LazyAdminConsole = lazy(() => import('./AdminConsole'));
const LazyExtrasConsole = lazy(() => import('./ExtrasConsole'));

// Higher-order component for lazy loading with suspense
const withLazyLoading = (Component, fallback = <LoadingSpinner size="large" />) => {
  return (props) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Export lazy-loaded components
export const Dashboard = withLazyLoading(LazyDashboard);
export const ItemList = withLazyLoading(LazyItemList);
export const ItemDetail = withLazyLoading(LazyItemDetail);
export const ItemForm = withLazyLoading(LazyItemForm);
export const StaffConsole = withLazyLoading(LazyStaffConsole);
export const StaffForm = withLazyLoading(LazyStaffForm);
export const StaffItemAssignment = withLazyLoading(LazyStaffItemAssignment);
export const AdminConsole = withLazyLoading(LazyAdminConsole);
export const ExtrasConsole = withLazyLoading(LazyExtrasConsole);
