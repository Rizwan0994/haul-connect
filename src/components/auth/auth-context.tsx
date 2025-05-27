import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient, User } from '@/lib/auth-client';
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  id: number;
  role: string;
  category: string;
  exp: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
            // The API returns { status, message, data: { id, email, firstName, lastName, role, category } }
            setCurrentUser(response.data);
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

    // Redirect based on role
    if (['hr_manager', 'hr_user', 'admin_manager', 'admin_user', 'super_admin'].includes(response.data.user.category)) {
      navigate('/user-management');
    } else {
      navigate('/carrier-management');
    }
  };

  const logout = () => {
    authClient.logout();
    setCurrentUser(null);
  };

  const hasPermission = (allowedRoles: string[]): boolean => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.category);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
        login,
        logout,
        hasPermission
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
