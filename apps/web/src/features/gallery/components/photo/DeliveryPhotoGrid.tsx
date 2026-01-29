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
                        className="aspect-square animate-pulse rounded border border-white/15 bg-white/60 shadow-inner"
                    />
                ))}
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="mb-4 text-6xl text-gray-400">📷</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
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
                    className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded border border-black/5 bg-stone-100 shadow-[0_45px_120px_-95px_rgba(0,0,0,0.9)] transition-all duration-700 hover:-translate-y-1"
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
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/30 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    {/* Filename overlay */}
                    <div className="pointer-events-none absolute inset-0 flex items-end p-4">
                        <div className="text-sm tracking-[0.03em] text-white opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                            {photo.originalFileName}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
