import { CataloguesService, OpenAPI } from '@repo/sdk';
import { CreateCatalogueDtoClass, UpdateCatalogueDtoClass } from '@repo/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { Catalogue, DeleteCatalogueResponse } from '../types';

import { getPublicAccessToken } from './usePublicAccess';

export function useCataloguesQuery() {
    return useQuery<Catalogue[]>({
        queryKey: ['catalogues'],
        queryFn: () =>
            CataloguesService.cataloguesControllerFindAll() as Promise<
                Catalogue[]
            >,
    });
}

export function useCatalogueQuery(
    catalogueId: string,
    options?: { enabled?: boolean }
) {
    return useQuery<Catalogue>({
        queryKey: ['catalogues', catalogueId],
        queryFn: () =>
            CataloguesService.cataloguesControllerFindOne({
                id: catalogueId,
            }) as Promise<Catalogue>,
        enabled:
            options?.enabled !== undefined
                ? options.enabled
                : Boolean(catalogueId),
    });
}

export function usePublicCatalogueQuery(slug: string) {
    return useQuery({
        queryKey: ['catalogue', 'public', slug],
        queryFn: async () => {
            const token = getPublicAccessToken(slug);
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${OpenAPI.BASE}/public/catalogue/${slug}`,
                { headers }
            );

            if (!response.ok) {
                const error = new Error('Failed to fetch catalogue') as Error & {
                    status?: number;
                };
                error.status = response.status;
                throw error;
            }

            return response.json();
        },
        enabled: Boolean(slug),
        retry: false, // Don't retry 401s
    });
}

export function useCreateCatalogueMutation() {
    const queryClient = useQueryClient();

    return useMutation<Catalogue, Error, CreateCatalogueDtoClass>({
        mutationFn: (data) =>
            CataloguesService.cataloguesControllerCreate({
                requestBody: data,
            }) as Promise<Catalogue>,
        onSuccess: (catalogue) => {
            queryClient.invalidateQueries({ queryKey: ['catalogues'] });
            queryClient.setQueryData(['catalogues', catalogue.id], catalogue);
        },
    });
}

export function useUpdateCatalogueMutation(catalogueId: string) {
    const queryClient = useQueryClient();

    return useMutation<Catalogue, Error, UpdateCatalogueDtoClass>({
        mutationFn: (data) =>
            CataloguesService.cataloguesControllerUpdate({
                id: catalogueId,
                requestBody: data,
            }) as Promise<Catalogue>,
        onSuccess: (catalogue) => {
            queryClient.invalidateQueries({ queryKey: ['catalogues'] });
            queryClient.setQueryData(['catalogues', catalogue.id], catalogue);
        },
    });
}

export function useDeleteCatalogueMutation() {
    const queryClient = useQueryClient();

    return useMutation<
        DeleteCatalogueResponse,
        Error,
        string,
        { previousCatalogues?: Catalogue[] }
    >({
        mutationFn: (id) =>
            CataloguesService.cataloguesControllerRemove({
                id,
            }) as Promise<DeleteCatalogueResponse>,

        onMutate: async (id) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['catalogues'] });

            // Snapshot previous value
            const previousCatalogues = queryClient.getQueryData<Catalogue[]>([
                'catalogues',
            ]);

            // Optimistically update
            queryClient.setQueryData<Catalogue[]>(
                ['catalogues'],
                (old) => old?.filter((c) => c.id !== id) ?? []
            );

            return { previousCatalogues };
        },

        onError: (_error, _id, context) => {
            // Rollback on error
            if (context?.previousCatalogues) {
                queryClient.setQueryData(
                    ['catalogues'],
                    context.previousCatalogues
                );
            }
        },

        onSuccess: (_result, id) => {
            queryClient.invalidateQueries({ queryKey: ['catalogues'] });
            queryClient.removeQueries({ queryKey: ['catalogues', id] });
        },
    });
}

export function useSetCatalogueCoverMutation() {
    const { t } = useTranslation('gallery');
    const queryClient = useQueryClient();

    return useMutation<
        Catalogue,
        Error,
        { catalogueId: string; photoId: string }
    >({
        mutationFn: ({ catalogueId, photoId }) =>
            CataloguesService.cataloguesControllerSetCover({
                catalogueId,
                photoId,
            }) as Promise<Catalogue>,
        onSuccess: (catalogue) => {
            // Invalidate catalogue list
            queryClient.invalidateQueries({ queryKey: ['catalogues'] });

            // Update specific catalogue cache
            queryClient.setQueryData(['catalogues', catalogue.id], catalogue);

            toast.success(t('toast.catalogueCoverUpdated'));
        },
        onError: (error: Error) => {
            toast.error(error.message || t('toast.catalogueCoverUpdateFailed'));
        },
    });
}

export function useUpdateCatalogueStatusMutation(catalogueId: string) {
    const queryClient = useQueryClient();

    return useMutation<
        Catalogue,
        Error,
        { status: string; password?: string }
    >({
        mutationFn: (data) =>
            CataloguesService.cataloguesControllerUpdateStatus({
                id: catalogueId,
                requestBody: data,
            }) as Promise<Catalogue>,
        onSuccess: (catalogue) => {
            queryClient.invalidateQueries({ queryKey: ['catalogues'] });
            queryClient.setQueryData(['catalogues', catalogue.id], catalogue);
        },
    });
}
