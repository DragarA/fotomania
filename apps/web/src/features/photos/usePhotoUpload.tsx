import { useCallback, useEffect, useState } from 'react';

import { useUploadPhotoMutation } from './hooks';
import { UploadingFile } from './types';

export function usePhotoUpload(collectionId: string | null) {
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const uploadMutation = useUploadPhotoMutation();

  const uploadFile = useCallback(
    async (uploadingFile: UploadingFile) => {
      if (!collectionId) return;

      try {
        setUploadQueue((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id ? { ...f, status: 'uploading' } : f
          )
        );

        await uploadMutation.mutateAsync({
          file: uploadingFile.file,
          collectionId,
          onProgress: (progress) => {
            setUploadQueue((prev) =>
              prev.map((f) =>
                f.id === uploadingFile.id ? { ...f, progress } : f
              )
            );
          },
        });

        setUploadQueue((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? { ...f, progress: 100, status: 'success' }
              : f
          )
        );
      } catch (error: any) {
        setUploadQueue((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id
              ? {
                  ...f,
                  status: 'error',
                  error: error.message || 'Upload failed',
                }
              : f
          )
        );
      }
    },
    [collectionId, uploadMutation]
  );

  const addFiles = useCallback(
    (acceptedFiles: File[]) => {
      if (!collectionId) {
        console.error('No collection selected');
        return;
      }

      const newFiles: UploadingFile[] = acceptedFiles.map((file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
          id,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'pending',
        };
      });

      setUploadQueue((prev) => [...prev, ...newFiles]);

      // Upload files sequentially
      newFiles.forEach((newFile) => {
        uploadFile(newFile);
      });
    },
    [collectionId, uploadFile]
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadQueue((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadQueue((prev) => {
      prev
        .filter((f) => f.status === 'success' || f.status === 'error')
        .forEach((f) => URL.revokeObjectURL(f.preview));

      return prev.filter(
        (f) => f.status === 'pending' || f.status === 'uploading'
      );
    });
  }, []);

  useEffect(() => {
    return () => {
      uploadQueue.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  const isUploading = uploadQueue.some((f) => f.status === 'uploading');
  const hasCompleted = uploadQueue.some(
    (f) => f.status === 'success' || f.status === 'error'
  );

  return {
    uploadQueue,
    addFiles,
    removeFile,
    clearCompleted,
    isUploading,
    hasCompleted,
  };
}
