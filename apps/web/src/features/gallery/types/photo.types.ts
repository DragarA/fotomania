/**
 * Photo entity type (based on database schema)
 * Represents an uploaded photo in a collection
 */
export interface Photo {
  id: string;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
  collectionId: string;
  thumbnailPath: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload status for photo uploads
 */
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * Represents a file being uploaded with progress tracking
 */
export interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

/**
 * Parameters for uploading a photo
 */
export interface UploadPhotoParams {
  file: File;
  collectionId: string;
  onProgress?: (progress: number) => void;
}
