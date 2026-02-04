import { FileText, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface InvoiceUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
    isUploading: boolean;
}

export function InvoiceUploadDialog({
    isOpen,
    onClose,
    onUpload,
    isUploading,
}: InvoiceUploadDialogProps) {
    const { t } = useTranslation('gallery');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Reset selected file when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
        }
    }, [isOpen]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 1,
        disabled: isUploading,
    });

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setSelectedFile(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('invoice.uploadTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('invoice.uploadDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!selectedFile ? (
                        <div
                            {...getRootProps()}
                            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                isDragActive
                                    ? 'border-stone-400 bg-stone-50'
                                    : 'border-stone-200 hover:border-stone-300'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="mx-auto h-8 w-8 text-stone-400" />
                            <p className="mt-2 text-sm text-stone-600">
                                {t('invoice.selectFile')}
                            </p>
                            <p className="mt-1 text-xs text-stone-400">
                                PDF, max 10MB
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg border border-stone-200 p-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-stone-400" />
                                <div>
                                    <p className="text-sm font-medium text-stone-700">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-stone-400">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            {!isUploading && (
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            {t('collection.cancel')}
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('invoice.uploading')}
                                </>
                            ) : (
                                t('invoice.uploadButton')
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
