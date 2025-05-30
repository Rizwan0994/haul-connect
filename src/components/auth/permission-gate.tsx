import React, { ReactNode } from 'react';
import { useAuth } from './auth-context';

interface PermissionGateProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string[];
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders children based on user permissions
 * Usage:
 * <PermissionGate requiredPermission="users.create">
 *   <Button>Create User</Button>
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback = null
}) => {
  const { hasSpecificPermission, hasPermission } = useAuth();
  
  // Check for specific permission
  if (requiredPermission && !hasSpecificPermission(requiredPermission)) {
    return <>{fallback}</>;
  }
  
  // Check for role (legacy)
  if (requiredRole && !hasPermission(requiredRole)) {
    return <>{fallback}</>;
  }
  
  // If no permission or role is required, or if the user has the required permission/role
  return <>{children}</>;
};

export default PermissionGate;
