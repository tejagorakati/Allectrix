import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingScreen from './LoadingScreen';

export const ProtectedRoute = ({ children, userType }) => {
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status on mount
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const loginPath = userType === 'Doctor' ? '/doctor/login' : 
                     userType === 'Admin' ? '/admin/login' : 
                     '/patient/login';
    
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check if user type matches required type
  if (userType && user?.userType !== userType) {
    // Redirect to appropriate dashboard based on user type
    const dashboardPath = user?.userType === 'Doctor' ? '/doctor/dashboard' :
                         user?.userType === 'Admin' ? '/admin/dashboard' :
                         '/patient/dashboard';
    
    return <Navigate to={dashboardPath} replace />;
  }

  // Special case for emergency access
  if (user?.isEmergencyAccess && userType !== 'Emergency') {
    return <Navigate to="/emergency" replace />;
  }

  return children;
};