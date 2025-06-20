import { Permission } from '@/lib/permission-api';

// Define all available routes with their permissions
export const availableRoutes = [
  {
    path: "/dashboard",
    permission: "route.dashboard",
    priority: 1, // Higher priority = preferred route
  },
  {
    path: "/notifications", 
    permission: "notifications.view",
    priority: 2,
  },
  {
    path: "/carrier-management",
    permission: "route.carrier-profiles", 
    priority: 3,
  },
  {
    path: "/carrier-management/approvals",
    permission: "carrier.approval.view",
    priority: 4,
  },
  {
    path: "/dispatch-management",
    permission: "route.active-dispatches",
    priority: 3,
  },
  {
    path: "/dispatch-management/approvals", 
    permission: "dispatch.approval.view",
    priority: 4,
  },
  {
    path: "/contact-management",
    permission: "route.brokers",
    priority: 5,
  },
  {
    path: "/contact-management/brokers",
    permission: "route.brokers", 
    priority: 6,
  },
  {
    path: "/contact-management/shippers",
    permission: "route.shippers",
    priority: 6, 
  },
  {
    path: "/contact-management/consignees",
    permission: "route.consignees",
    priority: 6,
  },
  {
    path: "/commission-management",
    permission: "route.commission-management",
    priority: 7,
  },
  {
    path: "/employee-attendance", 
    permission: "route.attendance-records",
    priority: 7,
  },
  {
    path: "/invoices",
    permission: "route.invoices",
    priority: 7,
  },
  {
    path: "/user-management",
    permission: "route.user-management", 
    priority: 8,
  },
  {
    path: "/profile", // Profile page - everyone should have access
    permission: null, // No permission required for profile
    priority: 99, // Lowest priority - fallback
  }
];

/**
 * Find the first route a user has permission to access
 * @param userPermissions - Array of user permissions
 * @param isAdmin - Whether the user is an admin (admins have access to everything)
 * @returns The path of the first accessible route
 */
export const findFirstAccessibleRoute = (
  userPermissions: Permission[], 
  isAdmin: boolean = false
): string => {
  console.log('Finding first accessible route...');
  console.log('User permissions:', userPermissions);
  console.log('Is admin:', isAdmin);
  
  // Admin users have access to everything, prefer dashboard or user-management
  if (isAdmin) {
    console.log('User is admin, redirecting to dashboard');
    return '/dashboard';
  }
  
  // If user has no permissions, redirect to profile page
  if (!userPermissions || userPermissions.length === 0) {
    console.log('User has no permissions, redirecting to profile');
    return '/profile';
  }
  
  // Sort routes by priority (lower number = higher priority)
  const sortedRoutes = availableRoutes.sort((a, b) => a.priority - b.priority);
  
  for (const route of sortedRoutes) {
    // If no permission required (e.g., profile page), allow access
    if (!route.permission) {
      console.log(`Route ${route.path} has no permission requirement, allowing access`);
      return route.path;
    }
    
    // Check if user has the required permission
    const hasPermission = userPermissions.some(permission => 
      permission.name === route.permission || 
      permission.name?.toLowerCase() === route.permission?.toLowerCase()
    );
    
    if (hasPermission) {
      console.log(`User has permission for ${route.path} (${route.permission})`);
      return route.path;
    }
  }
  
  // Fallback to profile page if no other routes are accessible
  console.log('No accessible routes found, falling back to profile');
  return '/profile';
};

/**
 * Check if user is admin based on role
 * @param user - User object with role information
 * @returns Whether the user is an admin
 */
export const isUserAdmin = (user: any): boolean => {
  if (!user) return false;
  
  const adminRoles = ['admin', 'super admin'];
  
  return adminRoles.some(role => 
    user.role_name?.toLowerCase() === role ||
    user.category?.toLowerCase() === role ||
    user.role?.toLowerCase() === role
  );
};
