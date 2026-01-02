import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, LoginCredentials } from '../services/authService';

interface User {
  nic: string;
  fullName: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isInstructor: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initializeAuth = () => {
      try {
        const isValid = authService.validateAuthentication();
        
        if (isValid) {
          const currentUser = authService.getCurrentUser();
          if (currentUser.isAuthenticated && currentUser.nic && currentUser.role) {
            setUser({
              nic: currentUser.nic,
              fullName: currentUser.fullName,
              role: currentUser.role
            });
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        // Clear any corrupted auth state
        authService.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      setUser({
        nic: response.nic,
        fullName: response.fullName || null,
        role: response.role
      });
      
      console.log('Login successful, user set:', {
        nic: response.nic,
        fullName: response.fullName,
        role: response.role
      });
      
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('ADMIN'); // Backend uses 'ADMIN'
  };

  const isInstructor = (): boolean => {
    return hasRole('INSTRUCTOR') || hasRole('LECTURER'); // Backend might use either
  };

  const isStudent = (): boolean => {
    return hasRole('STUDENT');
  };

  const value = {
    user,
    loading,
    isAuthenticated: user !== null,
    signIn,
    signOut,
    hasRole,
    isAdmin,
    isInstructor,
    isStudent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
