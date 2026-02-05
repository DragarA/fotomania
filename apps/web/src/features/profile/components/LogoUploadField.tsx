import { Image, Loader2, Upload, X } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '@/lib/api-client';

interface LogoUploadFieldProps {
    currentLogoUrl?: string | null;
    onUpload: (file: File) => void;
    onRemove: () => void;
    isUploading: boolean;
    isRemoving: boolean;
}

const ACCEPTED_IMAGE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function LogoUploadField({
    currentLogoUrl,
    onUpload,
    onRemove,
    isUploading,
    isRemoving,
}: LogoUploadFieldProps) {
    const { t } = useTranslation('profile');

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onUpload(acceptedFiles[0]);
            }
        },
        [onUpload]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            onDrop,
            accept: ACCEPTED_IMAGE_TYPES,
            maxSize: MAX_FILE_SIZE,
            maxFiles: 1,
            disabled: isUploading || isRemoving,
        });

    const isLoading = isUploading || isRemoving;

    return (
        <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.4em] text-stone-400">
                {t('form.businessLogo')}
            </label>

            {currentLogoUrl ? (
                <div className="space-y-2">
                    <div className="relative inline-block">
                        <img
                            src={`${API_BASE_URL}/${currentLogoUrl}`}
                            alt="Business logo"
                            className="h-24 w-auto max-w-xs rounded border border-black/10 object-contain"
                        />
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded bg-white/80">
                                <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded border border-black/10 bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.3em] text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isRemoving ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                {t('form.removing')}
                            </>
                        ) : (
                            <>
                                <X className="h-3 w-3" />
                                {t('form.removeLogo')}
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                        isDragActive
                            ? 'border-stone-400 bg-stone-50'
                            : 'border-black/10 hover:border-stone-300'
                    } ${isLoading ? 'pointer-events-none opacity-40' : ''}`}
                >
                    <input {...getInputProps()} />
                    {isLoading ? (
                        <>
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-stone-400" />
                            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-stone-600">
                                {t('form.uploading')}
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className="mx-auto h-8 w-8 text-stone-400" />
                            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-stone-600">
                                {t('form.uploadLogo')}
                            </p>
                            <p className="mt-1 text-xs text-stone-400">
                                JPG, PNG, WebP • Max 2MB
                            </p>
                        </>
                    )}
                </div>
            )}

            {fileRejections.length > 0 && (
                <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                    {fileRejections[0].errors[0].code === 'file-too-large'
                        ? t('form.fileTooLarge')
                        : t('form.invalidFileType')}
                </p>
            )}
        </div>
    );
}
