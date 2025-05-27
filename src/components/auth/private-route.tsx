
import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from './auth-context'

interface PrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  // Still loading, show a loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Role-based access check if requiredRoles is specified
  if (requiredRoles && !hasPermission(requiredRoles)) {
    return <Navigate to="/access-denied" replace />;
  }
  
  // Authorized, render children
  return <>{children}</>;
}
