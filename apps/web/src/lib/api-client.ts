import { OpenAPI } from '@repo/sdk';

import { installFotomaniaDemoMode, IS_DEMO_MODE } from './demo-mode';
import { getJwtExpiryMs } from './jwt';

installFotomaniaDemoMode();

// Configure the OpenAPI client
OpenAPI.BASE = IS_DEMO_MODE
    ? (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    : (import.meta.env?.VITE_API_BASE_URL as string) ||
      'http://localhost:3000';

// Export the base URL for use in components that need direct URL access
export const API_BASE_URL = OpenAPI.BASE;

// Track if a refresh is in progress to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: boolean) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, success = false) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(success);
        }
    });
    failedQueue = [];
};

type RequestMeta = {
    method: string;
    headers?: Record<string, unknown>;
    body?: unknown;
    formData?: Record<string, unknown>;
    mediaType?: string;
};

const requestCache = new Map<string, RequestMeta>();

const encodePair = (key: string, value: unknown, qs: string[]) => {
    if (value === undefined || value === null) return;

    if (value instanceof Date) {
        qs.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(value.toISOString())}`
        );
    } else if (Array.isArray(value)) {
        value.forEach((v) => encodePair(key, v, qs));
    } else if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) =>
            encodePair(`${key}[${k}]`, v, qs)
        );
    } else {
        qs.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        );
    }
};

const buildUrl = (options: any) => {
    const path = String(options.url || '').replace(
        /{(.*?)}/g,
        (substring: string, group: string) => {
            if (
                options.path &&
                Object.prototype.hasOwnProperty.call(options.path, group)
            ) {
                return encodeURIComponent(String(options.path[group]));
            }
            return substring;
        }
    );

    const qs: string[] = [];
    if (options.query) {
        Object.entries(options.query).forEach(([key, value]) =>
            encodePair(key, value, qs)
        );
    }

    const url = OpenAPI.BASE + path;
    return qs.length ? `${url}?${qs.join('&')}` : url;
};

const buildFormData = (formData: Record<string, unknown>) => {
    const data = new FormData();

    const process = (key: string, value: unknown) => {
        if (typeof value === 'string' || value instanceof Blob) {
            data.append(key, value);
        } else {
            data.append(key, JSON.stringify(value));
        }
    };

    Object.entries(formData)
        .filter(([, value]) => value !== undefined && value !== null)
        .forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((v) => process(key, v));
            } else {
                process(key, value);
            }
        });

    return data;
};

const buildRequestBody = (meta: RequestMeta) => {
    if (meta.body === undefined) return undefined;
    if (
        meta.mediaType?.includes('application/json') ||
        meta.mediaType?.includes('+json')
    ) {
        return JSON.stringify(meta.body);
    }
    if (typeof meta.body === 'string' || meta.body instanceof Blob) {
        return meta.body;
    }
    return JSON.stringify(meta.body);
};

const getStoredExpiry = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        const expiry = getJwtExpiryMs(accessToken);
        if (expiry) return expiry;
    }

    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return null;

    const expiryTime = parseInt(tokenExpiry, 10);
    return Number.isFinite(expiryTime) ? expiryTime : null;
};

// Function to check if token is expired or about to expire
const isTokenExpired = (): boolean => {
    const expiryTime = getStoredExpiry();
    if (!expiryTime) return true;

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

        // Calculate and store new token expiry based on JWT exp
        const expiryTime =
            getJwtExpiryMs(data.accessToken) ||
            Date.now() + 7 * 24 * 60 * 60 * 1000;
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
                    processQueue(null, true);
                    return localStorage.getItem('accessToken') || '';
                } else {
                    processQueue(new Error('Token refresh failed'), false);
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
                processQueue(error as Error, false);
                throw error;
            }
        } else {
            // Wait for the ongoing refresh to complete
            return new Promise<boolean>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((success) =>
                success ? localStorage.getItem('accessToken') || '' : ''
            );
        }
    }

    return localStorage.getItem('accessToken') || '';
};

// Add response interceptor to handle 401 errors
OpenAPI.HEADERS = async (options: any) => {
    const url = buildUrl(options);
    requestCache.set(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
        formData: options.formData,
        mediaType: options.mediaType,
    });
    return undefined;
};

const retryRequest = async (url: string) => {
    const meta = requestCache.get(url);
    if (!meta) return null;
    requestCache.delete(url);

    const newToken = localStorage.getItem('accessToken');
    if (!newToken) return null;

    const headers = new Headers({
        Accept: 'application/json',
        ...(meta.headers || {}),
        Authorization: `Bearer ${newToken}`,
    });

    let body: BodyInit | undefined;
    if (meta.formData) {
        body = buildFormData(meta.formData);
    } else {
        body = buildRequestBody(meta);
    }

    return fetch(url, {
        method: meta.method,
        headers,
        body,
    });
};

OpenAPI.interceptors.response.use(async (response: Response) => {
    if (response.status !== 401) {
        requestCache.delete(response.url);
        return response;
    }

    // Don't retry if this is already a refresh request
    if (response.url.includes('/auth/refresh')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        window.dispatchEvent(new Event('auth:logout'));
        requestCache.delete(response.url);
        return response;
    }

    // Don't attempt refresh if already logged out (no refresh token)
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        window.dispatchEvent(new Event('auth:logout'));
        requestCache.delete(response.url);
        return response;
    }

    if (!isRefreshing) {
        isRefreshing = true;
        try {
            const success = await refreshTokens();
            isRefreshing = false;
            processQueue(null, success);

            if (success) {
                const retryResponse = await retryRequest(response.url);
                return retryResponse ?? response;
            }

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.dispatchEvent(new Event('auth:logout'));
            requestCache.delete(response.url);
        } catch (error) {
            isRefreshing = false;
            processQueue(error as Error, false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.dispatchEvent(new Event('auth:logout'));
            requestCache.delete(response.url);
        }
    } else {
        try {
            const success = await new Promise<boolean>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            });
            if (success) {
                const retryResponse = await retryRequest(response.url);
                return retryResponse ?? response;
            }
        } catch {
            // Refresh failed, logout already handled by the initiating request
        }
    }

    requestCache.delete(response.url);
    return response;
});

export { OpenAPI };
