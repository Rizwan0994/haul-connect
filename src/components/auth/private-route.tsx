
import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from './auth-context'

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermission?: string;
}

export default function PrivateRoute({ children, requiredRoles, requiredPermission }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasSpecificPermission, currentUser } = useAuth();

  console.log('PrivateRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', currentUser); // Debug log

  // Still loading, show a loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login'); // Debug log
    return <Navigate to="/auth/login" replace />;
  }

  // Permission-based access check if requiredPermission is specified
  if (requiredPermission && !hasSpecificPermission(requiredPermission)) {
    console.log('Access denied, missing required permission: ', requiredPermission); // Debug log
    return <Navigate to="/access-denied" replace />;
  }
  
  // Legacy role-based access check if requiredRoles is specified
  if (requiredRoles && !hasPermission(requiredRoles)) {
    console.log('Access denied, insufficient role: ', requiredRoles); // Debug log
    return <Navigate to="/access-denied" replace />;
  }
  
  // Authorized, render children
  console.log('Access granted, rendering children'); // Debug log
  return <>{children}</>;
}
