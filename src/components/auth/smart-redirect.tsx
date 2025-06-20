import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/auth-context';
import { findFirstAccessibleRoute, isUserAdmin } from '@/lib/route-utils';

/**
 * Smart redirect component that redirects users to the first page they have access to
 * instead of hardcoding a redirect to /dashboard
 */
export const SmartRedirect: React.FC = () => {
  const { currentUser, userPermissions, isLoading } = useAuth();
  
  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Find the first accessible route for this user
  const userIsAdmin = isUserAdmin(currentUser);
  const redirectPath = findFirstAccessibleRoute(userPermissions, userIsAdmin);
  
  console.log('SmartRedirect: Redirecting to', redirectPath);
  
  return <Navigate to={redirectPath} replace />;
};
