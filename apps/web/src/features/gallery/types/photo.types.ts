import type { CollectionPhotoPublicResDto, PhotoResDto } from '@repo/sdk';

/**
 * Photo entity type (based on API response)
 * Re-exported from SDK for consistency across the app
 */
export type Photo = PhotoResDto;

/**
 * Public photo type with timestamps (used in public galleries)
 * Re-exported from SDK for consistency across the app
 */
export type PublicPhoto = CollectionPhotoPublicResDto;

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
