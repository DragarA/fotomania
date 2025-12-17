import { OpenAPI } from '@repo/sdk';

// Configure the OpenAPI client
OpenAPI.BASE =
    (import.meta.env?.VITE_API_BASE_URL as string) ||
    'http://localhost:3000';

// Export the base URL for use in components that need direct URL access
export const API_BASE_URL = OpenAPI.BASE;

// Track if a refresh is in progress to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Function to check if token is expired or about to expire
const isTokenExpired = (): boolean => {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return true;

    const expiryTime = parseInt(tokenExpiry, 10);
    const now = Date.now();
    // Refresh if token expires in less than 5 minutes
    const bufferTime = 5 * 60 * 1000;

    return now >= expiryTime - bufferTime;
};

// Function to refresh the token
const refreshTokens = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${OpenAPI.BASE}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Refresh failed');
        }

        const data = await response.json();

        // Update localStorage with new tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Calculate and store new token expiry (7 days from now)
        const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('tokenExpiry', expiryTime.toString());

        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
};

// Add request interceptor to include JWT token and handle token refresh
OpenAPI.TOKEN = async () => {
    // Check if token is expired before making a request
    if (isTokenExpired()) {
        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const success = await refreshTokens();
                isRefreshing = false;

                if (success) {
                    processQueue();
                    return localStorage.getItem('accessToken') || '';
                } else {
                    processQueue(new Error('Token refresh failed'));
                    // Trigger logout
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('tokenExpiry');
                    window.dispatchEvent(new Event('auth:logout'));
                    return '';
                }
            } catch (error) {
                isRefreshing = false;
                processQueue(error as Error);
                throw error;
            }
        } else {
            // Wait for the ongoing refresh to complete
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => localStorage.getItem('accessToken') || '');
        }
    }

    return localStorage.getItem('accessToken') || '';
};

// Add response interceptor to handle 401 errors
OpenAPI.interceptors.response.use(async (response: Response) => {
    if (response.status === 401) {
        const originalRequest = response.clone();

        // Don't retry if this is already a refresh request
        if (originalRequest.url.includes('/auth/refresh')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.dispatchEvent(new Event('auth:logout'));
            return response;
        }

        // Try to refresh the token
        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const success = await refreshTokens();
                isRefreshing = false;

                if (success) {
                    processQueue();
                    // Retry the original request with the new token
                    const newToken = localStorage.getItem('accessToken');
                    if (newToken) {
                        const retryResponse = await fetch(originalRequest.url, {
                            ...originalRequest,
                            headers: {
                                ...Object.fromEntries(
                                    originalRequest.headers.entries()
                                ),
                                Authorization: `Bearer ${newToken}`,
                            },
                        });
                        return retryResponse;
                    }
                } else {
                    processQueue(new Error('Token refresh failed'));
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('tokenExpiry');
                    window.dispatchEvent(new Event('auth:logout'));
                }
            } catch (error) {
                isRefreshing = false;
                processQueue(error as Error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('tokenExpiry');
                window.dispatchEvent(new Event('auth:logout'));
            }
        }
    }
    return response;
});

export { OpenAPI };
