import type {
    CollectionPhotoPublicResDto,
    DeliveryPublicResDto,
} from '@repo/sdk';
import { OpenAPI, PublicService } from '@repo/sdk';
import { useMutation, useQuery } from '@tanstack/react-query';

// Storage keys for delivery access tokens
const getDeliveryTokenKey = (deliverySlug: string) =>
    `delivery_access_${deliverySlug}`;

export function getDeliveryAccessToken(deliverySlug: string): string | null {
    try {
        return sessionStorage.getItem(getDeliveryTokenKey(deliverySlug));
    } catch {
        return null;
    }
}

export function setDeliveryAccessToken(
    deliverySlug: string,
    token: string
): void {
    try {
        sessionStorage.setItem(getDeliveryTokenKey(deliverySlug), token);
    } catch {
        console.warn('Unable to store delivery access token in sessionStorage');
    }
}

export function clearDeliveryAccessToken(deliverySlug: string): void {
    try {
        sessionStorage.removeItem(getDeliveryTokenKey(deliverySlug));
    } catch {
        // Ignore errors
    }
}

export function useDeliveryQuery(deliverySlug: string) {
    return useQuery<DeliveryPublicResDto>({
        queryKey: ['delivery', deliverySlug],
        queryFn: async () => {
            const token = getDeliveryAccessToken(deliverySlug);
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${OpenAPI.BASE}/public/delivery/${deliverySlug}`,
                { headers }
            );

            if (!response.ok) {
                const error = new Error(
                    'Failed to fetch delivery'
                ) as Error & { status?: number };
                error.status = response.status;
                throw error;
            }

            return response.json();
        },
        enabled: !!deliverySlug,
        retry: (failureCount, error: any) => {
            // Don't retry on 401 (password required)
            if (error?.status === 401) return false;
            return failureCount < 3;
        },
    });
}

export function useDeliveryAccess(deliverySlug: string) {
    const verifyMutation = useMutation({
        mutationFn: (password: string) =>
            PublicService.publicControllerVerifyDeliveryPassword({
                deliverySlug,
                requestBody: { password },
            }),
        onSuccess: (data) => {
            if (data.accessToken) {
                setDeliveryAccessToken(deliverySlug, data.accessToken);
            }
        },
    });

    return {
        verifyPassword: verifyMutation.mutate,
        isPending: verifyMutation.isPending,
        error: verifyMutation.error,
    };
}

