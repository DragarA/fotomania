import { useCallback, useEffect, useRef, useState } from 'react';

import { UploadingFile } from './types';

export function usePhotoUpload(collectionId: string | null) {
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const intervalsRef = useRef<Map<string, any>>(new Map());

  const simulateUpload = useCallback((fileId: string) => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        intervalsRef.current.delete(fileId);

        setUploadQueue((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: 'success' } : f
          )
        );
      } else {
        setUploadQueue((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 200);

    intervalsRef.current.set(fileId, interval);
  }, []);

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

      newFiles.forEach((newFile) => {
        setUploadQueue((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: 'uploading' } : f
          )
        );
        simulateUpload(newFile.id);
      });
    },
    [collectionId, simulateUpload]
  );

  const removeFile = useCallback((fileId: string) => {
    const interval = intervalsRef.current.get(fileId);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(fileId);
    }

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

      intervalsRef.current.forEach((interval) => clearInterval(interval));
      intervalsRef.current.clear();
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
