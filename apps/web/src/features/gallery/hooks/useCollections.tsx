import { CollectionsService } from '@repo/sdk';
import type {
    CreateCollectionDtoClass,
    UpdateCollectionDtoClass,
} from '@repo/sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function useCollectionsQuery(catalogueId: string) {
    return useQuery({
        queryKey: ['collections', catalogueId],
        queryFn: () =>
            CollectionsService.collectionsControllerFindAll({
                catalogueId,
            }),
        enabled: !!catalogueId,
    });
}

export function useCollectionQuery(collectionId: string) {
    return useQuery({
        queryKey: ['collections', 'detail', collectionId],
        queryFn: () =>
            CollectionsService.collectionsControllerFindOne({
                id: collectionId,
            }),
        enabled: !!collectionId,
    });
}

export function useCreateCollectionMutation() {
    const { t } = useTranslation('gallery');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCollectionDtoClass) =>
            CollectionsService.collectionsControllerCreate({
                requestBody: data,
            }),
        onSuccess: (collection) => {
            queryClient.invalidateQueries({
                queryKey: ['collections', collection.catalogueId],
            });
            toast.success(t('toast.collectionCreatedSuccess'));
        },
        onError: (error: any) => {
            toast.error(error.message || t('toast.collectionCreateFailed'));
        },
    });
}

export function useUpdateCollectionMutation() {
    const { t } = useTranslation('gallery');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: UpdateCollectionDtoClass;
        }) =>
            CollectionsService.collectionsControllerUpdate({
                id,
                requestBody: data,
            }),
        onSuccess: (collection) => {
            queryClient.invalidateQueries({
                queryKey: ['collections', collection.catalogueId],
            });
            queryClient.invalidateQueries({
                queryKey: ['collections', 'detail', collection.id],
            });
            toast.success(t('toast.collectionUpdatedSuccess'));
        },
        onError: (error: any) => {
            toast.error(error.message || t('toast.collectionUpdateFailed'));
        },
    });
}

export function useDeleteCollectionMutation() {
    const { t } = useTranslation('gallery');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: string; catalogueId: string }) =>
            CollectionsService.collectionsControllerRemove({ id }),
        onMutate: async ({ id, catalogueId }) => {
            await queryClient.cancelQueries({
                queryKey: ['collections', catalogueId],
            });

            const previousCollections = queryClient.getQueryData([
                'collections',
                catalogueId,
            ]);

            queryClient.setQueryData(
                ['collections', catalogueId],
                (old: any[]) => old?.filter((c) => c.id !== id)
            );

            return { previousCollections, catalogueId };
        },
        onError: (_error, _vars, context) => {
            if (context?.previousCollections) {
                queryClient.setQueryData(
                    ['collections', context.catalogueId],
                    context.previousCollections
                );
            }
            toast.error(t('toast.collectionDeleteFailed'));
        },
        onSuccess: (_data, _vars, context) => {
            queryClient.invalidateQueries({
                queryKey: ['collections', context?.catalogueId],
            });
            queryClient.invalidateQueries({
                queryKey: ['catalogues'],
            });
            toast.success(t('toast.collectionDeletedSuccess'));
        },
    });
}

export function useCreateDeliveryCollectionMutation() {
    const { t } = useTranslation('gallery');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId }: { sessionId: string }) =>
            CollectionsService.collectionsControllerCreateFromSession({
                sessionId,
            }),
        onSuccess: (collection) => {
            queryClient.invalidateQueries({
                queryKey: ['collections', collection.catalogueId],
            });
            queryClient.invalidateQueries({
                queryKey: ['catalogues'],
            });
            toast.success(t('toast.deliveryCollectionCreatedSuccess'));
        },
        onError: (error: any) => {
            toast.error(
                error.message || t('toast.deliveryCollectionCreateFailed')
            );
        },
    });
}

export function useSendDeliveryEmailMutation() {
    const { t } = useTranslation('gallery');

    return useMutation({
        mutationFn: ({ collectionId }: { collectionId: string }) =>
            CollectionsService.collectionsControllerSendDeliveryEmail({
                id: collectionId,
            }),
        onSuccess: () => {
            toast.success(t('toast.deliveryEmailSent'));
        },
        onError: (error: any) => {
            toast.error(
                error.body?.message ||
                    error.message ||
                    t('toast.deliveryEmailFailed')
            );
        },
    });
}

export function useUploadInvoiceMutation() {
    const { t } = useTranslation('gallery');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            collectionId,
            file,
        }: {
            collectionId: string;
            catalogueId: string;
            file: File;
        }) =>
            CollectionsService.collectionsControllerUploadInvoice({
                id: collectionId,
                formData: { file },
            }),
        onSuccess: (_data, { catalogueId }) => {
            queryClient.invalidateQueries({
                queryKey: ['collections', catalogueId],
            });
            toast.success(t('toast.invoiceUploadSuccess'));
        },
        onError: (error: any) => {
            toast.error(
                error.body?.message ||
                    error.message ||
                    t('toast.invoiceUploadFailed')
            );
        },
    });
}

export function useRemoveInvoiceMutation() {
    const { t } = useTranslation('gallery');
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            collectionId,
        }: {
            collectionId: string;
            catalogueId: string;
        }) =>
            CollectionsService.collectionsControllerRemoveInvoice({
                id: collectionId,
            }),
        onSuccess: (_data, { catalogueId }) => {
            queryClient.invalidateQueries({
                queryKey: ['collections', catalogueId],
            });
            toast.success(t('toast.invoiceRemoveSuccess'));
        },
        onError: (error: any) => {
            toast.error(
                error.body?.message ||
                    error.message ||
                    t('toast.invoiceRemoveFailed')
            );
        },
    });
}
