import { Heart } from 'lucide-react';

import { API_BASE_URL } from '../../../../lib/api-client';
import type { PublicPhoto } from '../../types';

interface PublicPhotoGridProps {
    photos: PublicPhoto[];
    isLoading: boolean;
    onPhotoClick?: (photo: PublicPhoto) => void;
    onToggleFavorite?: (photoId: string) => void;
    isFavorite?: (photoId: string) => boolean;
}

export function PublicPhotoGrid({
    photos,
    isLoading,
    onPhotoClick,
    onToggleFavorite,
    isFavorite,
}: PublicPhotoGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square rounded border border-white/15 bg-white/60 shadow-inner animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📷</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No photos in this collection yet
                </h3>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {photos.map((photo) => {
                const isPhotoFavorite = isFavorite?.(photo.id) ?? false;

                return (
                    <div
                        key={photo.id}
                        className="group relative flex aspect-square items-center justify-center overflow-hidden rounded border border-black/5 bg-stone-100 shadow-[0_45px_120px_-95px_rgba(0,0,0,0.9)] transition-all duration-700 hover:-translate-y-1"
                    >
                        <img
                            src={`${API_BASE_URL}/uploads/${
                                typeof photo.thumbnailPath === 'string' &&
                                photo.thumbnailPath
                                    ? photo.thumbnailPath
                                    : photo.storagePath
                            }`}
                            alt={photo.originalFileName}
                            className="h-full w-full cursor-pointer object-cover transition duration-700 group-hover:scale-[1.03]"
                            loading="lazy"
                            onClick={() => onPhotoClick?.(photo)}
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/30 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                        {/* Favorite button */}
                        {onToggleFavorite && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(photo.id);
                                }}
                                className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition duration-500 ${
                                    isPhotoFavorite
                                        ? 'bg-black/80 opacity-100'
                                        : 'bg-black/60 opacity-0 group-hover:opacity-100'
                                }`}
                                aria-label={
                                    isPhotoFavorite
                                        ? 'Remove from favorites'
                                        : 'Add to favorites'
                                }
                            >
                                <Heart
                                    className={`h-5 w-5 ${isPhotoFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                                    />
                            </button>
                        )}

                        {/* Filename overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-end p-4">
                            <div className="text-white opacity-0 transition-opacity duration-700 text-sm tracking-[0.03em] group-hover:opacity-100">
                                {photo.originalFileName}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
