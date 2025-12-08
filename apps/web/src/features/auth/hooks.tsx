import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthService } from '@repo/sdk';
import '@/lib/api-client';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
  };
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Listen for logout events from the API interceptor
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = (newAccessToken: string, newRefreshToken: string, newUser: User) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);

    // Persist to localStorage
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, refreshToken, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Mutations
export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await AuthService.authControllerLogin({
        requestBody: data,
      });
      return response as AuthResponse;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
    },
  });
}

export function useRegister() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await AuthService.authControllerRegister({
        requestBody: data,
      });
      return response as AuthResponse;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, data.user);
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await AuthService.authControllerLogout();
    },
    onSuccess: () => {
      logout();
    },
  });
}
