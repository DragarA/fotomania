import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { CollectionsService } from '@repo/sdk';
import type {
  CreateCollectionDtoClass,
  UpdateCollectionDtoClass,
} from '@repo/sdk';

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
      CollectionsService.collectionsControllerCreate({ requestBody: data }),
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

      queryClient.setQueryData(['collections', catalogueId], (old: any[]) =>
        old?.filter((c) => c.id !== id)
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
      })
      toast.success(t('toast.collectionDeletedSuccess'));
    },
  });
}
