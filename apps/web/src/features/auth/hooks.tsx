import { AuthService } from '@repo/sdk';
import { useMutation } from '@tanstack/react-query';
import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';

import '@/lib/api-client';
import { getJwtExpiryMs } from '@/lib/jwt';
import { queryClient } from '@/queryClient';

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
    refreshAccessToken: () => Promise<boolean>;
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
            // Clear all cached query data to prevent data leakage between users
            queryClient.clear();
        };

        window.addEventListener('auth:logout', handleLogoutEvent);
        return () =>
            window.removeEventListener('auth:logout', handleLogoutEvent);
    }, []);

    const login = (
        newAccessToken: string,
        newRefreshToken: string,
        newUser: User
    ) => {
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(newUser);

        // Persist to localStorage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Calculate and store token expiry based on JWT exp
        const expiryTime =
            getJwtExpiryMs(newAccessToken) ||
            Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('tokenExpiry', expiryTime.toString());
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);

        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');

        // Clear all cached query data to prevent data leakage between users
        queryClient.clear();
    };

    const refreshAccessToken = async (): Promise<boolean> => {
        const storedRefreshToken = localStorage.getItem('refreshToken');

        if (!storedRefreshToken) {
            logout();
            return false;
        }

        try {
            const response = await AuthService.authControllerRefresh({
                requestBody: {
                    refreshToken: storedRefreshToken,
                },
            });

            const data = response as AuthResponse;

            // Update state with new tokens
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setUser(data.user);

            // Update localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Calculate and store token expiry based on JWT exp
            const expiryTime =
                getJwtExpiryMs(data.accessToken) ||
                Date.now() + 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem('tokenExpiry', expiryTime.toString());

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                isLoading,
                login,
                logout,
                refreshAccessToken,
            }}
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
