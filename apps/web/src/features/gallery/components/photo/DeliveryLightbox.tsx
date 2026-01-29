import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

import { API_BASE_URL } from '../../../../lib/api-client';
import type { PublicPhoto } from '../../types/photo.types';

interface DeliveryLightboxProps {
    photo: PublicPhoto;
    photos: PublicPhoto[];
    deliverySlug: string;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
    getAccessToken: () => string | null;
}

export function DeliveryLightbox({
    photo,
    photos,
    deliverySlug,
    onClose,
    onNext,
    onPrevious,
    getAccessToken,
}: DeliveryLightboxProps) {
    const { t } = useTranslation('delivery');
    const [isDownloading, setIsDownloading] = useState(false);
    const currentIndex = photos.findIndex((p) => p.id === photo.id);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    // Prevent body scroll when lightbox is open
    useBodyScrollLock(true);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && hasPrevious) {
                onPrevious();
            } else if (e.key === 'ArrowRight' && hasNext) {
                onNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrevious, hasPrevious, hasNext]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const token = getAccessToken();
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${API_BASE_URL}/public/delivery/${deliverySlug}/photo/${photo.id}/download`,
                { headers }
            );

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = photo.originalFileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={onClose}
        >
            {/* Top Bar with Download and Close buttons */}
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                {/* Download button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                    }}
                    disabled={isDownloading}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-all hover:scale-110 hover:bg-white/10 disabled:opacity-50"
                    aria-label={t('downloadPhoto')}
                >
                    <Download
                        className={`h-6 w-6 ${isDownloading ? 'animate-pulse' : ''}`}
                    />
                </button>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                    aria-label="Close"
                >
                    <X className="h-8 w-8" />
                </button>
            </div>

            {/* Previous button */}
            {hasPrevious && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrevious();
                    }}
                    className="absolute left-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                    aria-label="Previous photo"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>
            )}

            {/* Next button */}
            {hasNext && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    className="absolute right-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white transition-colors"
                    aria-label="Next photo"
                >
                    <ChevronRight className="h-8 w-8" />
                </button>
            )}

            {/* Image Container */}
            <div
                className="relative flex h-full w-full items-center justify-center p-4 sm:p-8 md:p-16"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex max-h-full max-w-full items-center justify-center">
                    <img
                        src={`${API_BASE_URL}/uploads/${photo.storagePath}`}
                        alt={photo.originalFileName}
                        className="h-auto max-h-[calc(100vh-8rem)] w-auto max-w-full object-contain sm:max-h-[calc(100vh-10rem)]"
                    />

                    {/* Photo info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white sm:p-6">
                        <p className="truncate font-medium">
                            {photo.originalFileName}
                        </p>
                        <p className="mt-1 text-sm text-gray-300">
                            {currentIndex + 1} of {photos.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
