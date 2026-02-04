import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '../../../../lib/api-client';
import type { PublicPhoto } from '../../types/photo.types';

interface DeliveryPhotoGridProps {
    photos: PublicPhoto[];
    isLoading: boolean;
    onPhotoClick?: (photo: PublicPhoto) => void;
}

export function DeliveryPhotoGrid({
    photos,
    isLoading,
    onPhotoClick,
}: DeliveryPhotoGridProps) {
    const { t } = useTranslation('delivery');

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square animate-pulse rounded-lg border border-black/5 bg-stone-100"
                    />
                ))}
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="py-16 text-center">
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400">
                    <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-light tracking-wide text-stone-800">
                    {t('noPhotosYet')}
                </h3>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {photos.map((photo) => (
                <div
                    key={photo.id}
                    className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-stone-100 shadow-[0_35px_80px_-70px_rgba(0,0,0,0.85)] transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => onPhotoClick?.(photo)}
                >
                    <img
                        src={`${API_BASE_URL}/uploads/${
                            typeof photo.thumbnailPath === 'string' &&
                            photo.thumbnailPath
                                ? photo.thumbnailPath
                                : photo.storagePath
                        }`}
                        alt={photo.originalFileName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Filename overlay */}
                    <div className="pointer-events-none absolute inset-0 flex items-end p-3">
                        <p className="text-xs font-light tracking-wide text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                            {photo.originalFileName}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
