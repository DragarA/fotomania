import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI, PhotosService, PublicService } from '@repo/sdk';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../../lib/api-client';
import { uploadWithProgress } from '../utils/upload-helper';
import type { Photo, UploadPhotoParams } from '../types';

export function usePhotosQuery(collectionId: string | null) {
  return useQuery({
    queryKey: ['photos', collectionId],
    queryFn: async () => {
      if (!collectionId) {
        return [];
      }
      return await PhotosService.photosControllerFindAll({
        collectionId,
      });
    },
    enabled: !!collectionId,
  });
}

export function usePublicPhotosQuery(
  slug: string,
  collectionId: string | null
) {
  return useQuery({
    queryKey: ['photos', 'public', slug, collectionId],
    queryFn: async () => {
      if (!collectionId) {
        return [];
      }
      return await PublicService.publicControllerFindCollectionPhotosBySlug({
        slug,
        collectionId,
      });
    },
    enabled: Boolean(slug) && Boolean(collectionId),
  });
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation<Photo, Error, UploadPhotoParams>({
    mutationFn: async ({
      file,
      collectionId,
      onProgress,
    }: UploadPhotoParams) => {
      const formData = new FormData();
      formData.append('file', file);

      // Get token from SDK configuration
      let token = '';
      if (typeof OpenAPI.TOKEN === 'function') {
        const result = await OpenAPI.TOKEN({} as any);
        token = result || '';
      } else {
        token = OpenAPI.TOKEN || '';
      }

      const data = await uploadWithProgress(
        `${API_BASE_URL}/photos/upload/${collectionId}`,
        formData,
        token,
        onProgress || (() => {})
      );

      return data as Photo;
    },
    onSuccess: (photo, { collectionId }) => {
      // Invalidate photos query for this collection
      queryClient.invalidateQueries({
        queryKey: ['photos', collectionId],
      });

      // Invalidate collections query to update photo counts
      queryClient.invalidateQueries({
        queryKey: ['collections'],
      });

      queryClient.invalidateQueries({
        queryKey: ['catalogues'],
      });

      // Optionally cache the individual photo
      queryClient.setQueryData(['photos', photo.id], photo);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Upload failed');
    },
  });
}

export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; collectionId: string }>({
    mutationFn: async ({ id }) => {
      await PhotosService.photosControllerRemove({ id });
    },
    onSuccess: (_, { collectionId }) => {
      // Invalidate photos query for this collection
      queryClient.invalidateQueries({
        queryKey: ['photos', collectionId],
      });

      // Invalidate collections query to update photo counts
      queryClient.invalidateQueries({
        queryKey: ['collections'],
      });

      queryClient.invalidateQueries({
        queryKey: ['catalogues'],
      });

      toast.success('Photo deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Delete failed');
    },
  });
}
