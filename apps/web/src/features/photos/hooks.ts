import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PhotosService } from '@repo/sdk';

interface UploadPhotoParams {
  file: File;
  collectionId: string;
  onProgress?: (progress: number) => void;
}

export function useUploadPhotoMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ file, collectionId, onProgress }: UploadPhotoParams) => {},
        onSuccess: (photo, { collectionId}) => {
            queryClient.invalidateQueries({
                queryKey: ['photos', collectionId],
            });
            queryClient.setQueryData(['photos', photo.id], photo)
        }, 
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Upload failed');
        }
    })
}