import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { API_BASE_URL } from '../../../lib/api-client';

interface VerifyPasswordResponse {
    accessToken: string;
}

const STORAGE_KEY_PREFIX = 'catalogue-access-';

/**
 * Get the storage key for a specific catalogue slug
 */
const getStorageKey = (slug: string): string => `${STORAGE_KEY_PREFIX}${slug}`;

/**
 * Get the access token for a specific catalogue from sessionStorage
 */
export const getPublicAccessToken = (slug: string): string | null => {
    try {
        return sessionStorage.getItem(getStorageKey(slug));
    } catch {
        return null;
    }
};

/**
 * Store the access token for a specific catalogue in sessionStorage
 */
export const setPublicAccessToken = (slug: string, token: string): void => {
    try {
        sessionStorage.setItem(getStorageKey(slug), token);
    } catch {
        // sessionStorage not available (e.g., private browsing mode)
        console.warn('Unable to store access token in sessionStorage');
    }
};

/**
 * Remove the access token for a specific catalogue from sessionStorage
 */
export const clearPublicAccessToken = (slug: string): void => {
    try {
        sessionStorage.removeItem(getStorageKey(slug));
    } catch {
        // Ignore errors
    }
};

/**
 * Hook for managing password-protected public catalogue access
 */
export function usePublicAccess(slug: string) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!getPublicAccessToken(slug);
    });

    const verifyMutation = useMutation<VerifyPasswordResponse, Error, string>({
        mutationFn: async (password: string) => {
            const response = await fetch(
                `${API_BASE_URL}/public/catalogue/${slug}/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password }),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid password');
                }
                if (response.status === 404) {
                    throw new Error('Catalogue not found');
                }
                throw new Error('Failed to verify password');
            }

            return response.json();
        },
        onSuccess: (data) => {
            setPublicAccessToken(slug, data.accessToken);
            setIsAuthenticated(true);
        },
    });

    const logout = useCallback(() => {
        clearPublicAccessToken(slug);
        setIsAuthenticated(false);
    }, [slug]);

    const getToken = useCallback(() => {
        return getPublicAccessToken(slug);
    }, [slug]);

    return {
        isAuthenticated,
        verifyPassword: verifyMutation.mutate,
        verifyPasswordAsync: verifyMutation.mutateAsync,
        isPending: verifyMutation.isPending,
        error: verifyMutation.error,
        logout,
        getToken,
    };
}
