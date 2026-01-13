import { OpenAPI } from '@repo/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    businessName?: string | null;
    businessAddress?: string | null;
    businessPhone?: string | null;
    businessEmail?: string | null;
    businessWebsite?: string | null;
    businessLogo?: string | null;
    businessDescription?: string | null;
    preferredLanguage: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserDto {
    name?: string;
    businessName?: string | null;
    businessAddress?: string | null;
    businessPhone?: string | null;
    businessEmail?: string | null;
    businessWebsite?: string | null;
    businessLogo?: string | null;
    businessDescription?: string | null;
    preferredLanguage?: string;
}

async function fetchCurrentUser(): Promise<User> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${OpenAPI.BASE}/users/me`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }

    return response.json();
}

async function updateCurrentUser(data: UpdateUserDto): Promise<User> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${OpenAPI.BASE}/users/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
}

export function useCurrentUserQuery() {
    return useQuery<User>({
        queryKey: ['user', 'me'],
        queryFn: fetchCurrentUser,
    });
}

export function useUpdateUserMutation() {
    const queryClient = useQueryClient();

    return useMutation<User, Error, UpdateUserDto>({
        mutationFn: updateCurrentUser,
        onSuccess: (updatedUser) => {
            // Update the user query cache
            queryClient.setQueryData(['user', 'me'], updatedUser);
            
            // Also update localStorage for session consistency
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                const parsed = JSON.parse(currentUser);
                localStorage.setItem(
                    'user',
                    JSON.stringify({ ...parsed, ...updatedUser })
                );
            }
        },
    });
}

