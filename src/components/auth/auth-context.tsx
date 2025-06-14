import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient, User } from '@/lib/auth-client';
import { jwtDecode } from "jwt-decode";
import { Permission } from '@/lib/permission-api';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (roles: string[]) => boolean;
  hasSpecificPermission: (permissionName: string) => boolean;
  userPermissions: Permission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  id: number;
  role: string;
  category: string;
  exp: number;
  permissions?: string[];
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('authToken');
            setCurrentUser(null);
            setIsLoading(false);
            return;
          }
          
          // Try to get user data from API
          try {
            const response = await authClient.getCurrentUser();
            console.log('Auth init response:', response); // Debug log
            console.log('Permissions from /auth/me:', response.data.permissions);
            
            setCurrentUser(response.data);
            
            // Save permissions if available
            if (response.data.permissions) {
              console.log('Setting user permissions from /auth/me:', response.data.permissions);
              setUserPermissions(response.data.permissions);
            } else {
              console.warn('No permissions found in auth init response');
              setUserPermissions([]);
            }
            
            // Log the current user state after setting
            console.log('Current user after auth init:', {
              email: response.data.email,
              role_name: response.data.role_name,
              category: response.data.category,
              permissions: response.data.permissions?.length || 0
            });
          } catch (err) {
            console.error("Failed to fetch user data:", err);
            // If API call fails, clear token and redirect to login
            localStorage.removeItem('authToken');
            setCurrentUser(null);
          }
        } catch (e) {
          console.error("Token decode error:", e);
          localStorage.removeItem('authToken');
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await authClient.login(email, password);
    console.log('Login response:', response); // Debug log
    
    // Store token in localStorage
    localStorage.setItem('authToken', response.data.token);
    
    // Update user state
    setCurrentUser(response.data.user);
    
    // Save permissions if available
    if (response.data.user.permissions) {
      console.log('Setting user permissions from login response:', response.data.user.permissions);
      setUserPermissions(response.data.user.permissions);
    } else {
      console.warn('No permissions found in login response');
      setUserPermissions([]);
    }
      
    // Log permissions for debugging
    console.log('User permissions:', response.data.user.permissions || 'No permissions');
    console.log('User role:', response.data.user.role_name || response.data.user.category);

    // Redirect based on role - use role_name first if available, then fall back to category
    const userRole = response.data.user.role_name || response.data.user.category;
    
    if (['Admin', 'admin', 'Manager', 'manager', 'Super Admin', 'super admin'].some(r => 
        userRole?.toLowerCase() === r.toLowerCase())) {
      navigate('/user-management');
    } else if (userRole?.toLowerCase() === 'dispatch') {
      navigate('/dispatch-management'); // Dispatch users go directly to dispatch management
    } else {
      navigate('/carrier-management');
    }
  };

  const logout = () => {
    authClient.logout();
    setCurrentUser(null);
    setUserPermissions([]);
  };
  
  // Check if user has a specific role
  const hasPermission = (allowedRoles: string[]): boolean => {
    if (!currentUser) return false;
    
    console.log('Checking user role against allowed roles:', allowedRoles);
    console.log('Current user role:', currentUser.role_name || currentUser.category);
    
    // Admin roles always have all permissions (check both systems)
    if (
      currentUser.role_name?.toLowerCase() === 'admin' || 
      currentUser.role_name?.toLowerCase() === 'super admin' ||
      currentUser.category?.toLowerCase() === 'admin' ||
      currentUser.category?.toLowerCase() === 'super admin' ||
      currentUser.role?.toLowerCase() === 'admin' ||
      currentUser.role?.toLowerCase() === 'super admin'
    ) {
      console.log('User has admin role, granting access to all roles');
      return true;
    }
    
    // Check both role_name (new system) and category (legacy)
    const hasRole = 
      (currentUser.role_name && allowedRoles.some(role => 
        role.toLowerCase() === currentUser.role_name?.toLowerCase())) ||
      (currentUser.category && allowedRoles.some(role => 
        role.toLowerCase() === currentUser.category?.toLowerCase()));
    
    console.log(`Role check result: ${hasRole ? 'GRANTED' : 'DENIED'}`);
    return hasRole;
  };
  
  // Check if user has a specific permission
  const hasSpecificPermission = (permissionName: string): boolean => {
    if (!currentUser) return false;
    
    console.log(`Checking permission: ${permissionName}`);
    console.log(`User permissions:`, userPermissions);
    console.log(`Current user role: ${currentUser.role_name || currentUser.category}`);
    
    // Admin roles always have all permissions (check both systems)
    if (
      currentUser.role_name?.toLowerCase() === 'admin' || 
      currentUser.role_name?.toLowerCase() === 'super admin' ||
      currentUser.category?.toLowerCase() === 'admin' ||
      currentUser.category?.toLowerCase() === 'super admin' ||
      currentUser.role?.toLowerCase() === 'admin' ||
      currentUser.role?.toLowerCase() === 'super admin'
    ) {
      console.log('User has admin role, granting all permissions');
      return true;
    }
    
    // Check if the user has this specific permission
    // First check if permissions array exists and has the required permission name
    if (userPermissions && userPermissions.length > 0) {
      const hasPermission = userPermissions.some(permission => 
        permission.name === permissionName || 
        permission.name?.toLowerCase() === permissionName?.toLowerCase()
      );
      console.log(`Permission check result for ${permissionName}: ${hasPermission ? 'GRANTED' : 'DENIED'}`);
      return hasPermission;
    } else {
      console.log(`No permissions found for user, denying access to ${permissionName}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        logout,
        hasPermission,
        hasSpecificPermission,
        userPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const withAuth = (Component: React.ComponentType, allowedRoles?: string[]) => {
  return (props: any) => {
    const { currentUser, isLoading, hasPermission } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!isLoading && !currentUser) {
        navigate('/auth/login');
      }

      if (!isLoading && currentUser && allowedRoles && !hasPermission(allowedRoles)) {
        navigate('/access-denied');
      }
    }, [isLoading, currentUser, navigate, allowedRoles, hasPermission]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!currentUser) {
      return null; // Will redirect in useEffect
    }

    if (allowedRoles && !hasPermission(allowedRoles)) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
};
