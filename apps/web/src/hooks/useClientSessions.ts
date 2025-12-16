import { AddFavouritesReqDtoClass, OpenAPI } from '@repo/sdk';
import { useMutation } from '@tanstack/react-query';

import { getPublicAccessToken } from '../features/gallery/hooks/usePublicAccess';

export function useAddFavouritesMutation() {
    return useMutation({
        mutationFn: async ({
            slug,
            data,
        }: {
            slug: string;
            data: AddFavouritesReqDtoClass;
        }) => {
            const token = getPublicAccessToken(slug);
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${OpenAPI.BASE}/public/catalogue/${slug}/favourites`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const error = new Error('Failed to save favourites') as Error & {
                    status?: number;
                };
                error.status = response.status;
                throw error;
            }

            return response.json();
        },
    });
}
