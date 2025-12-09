export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}
