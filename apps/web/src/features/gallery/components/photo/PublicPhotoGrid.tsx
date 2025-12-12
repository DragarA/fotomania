import { Heart } from 'lucide-react';

import { API_BASE_URL } from '../../../../lib/api-client';

interface Photo {
    id: string;
    originalFileName: string;
    storagePath: string;
    thumbnailPath?: string | null | { [key: string]: unknown };
    mimeType: string;
    width?: number | null | { [key: string]: unknown };
    height?: number | null | { [key: string]: unknown };
    size?: number | null | { [key: string]: unknown };
    createdAt: string;
    updatedAt: string;
}

interface PublicPhotoGridProps {
    photos: Photo[];
    isLoading: boolean;
    onPhotoClick?: (photo: Photo) => void;
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-gray-200 rounded-lg animate-pulse"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photos.map((photo) => {
                const isPhotoFavorite = isFavorite?.(photo.id) ?? false;

                return (
                    <div
                        key={photo.id}
                        className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
                    >
                        <img
                            src={`${API_BASE_URL}/uploads/${
                                typeof photo.thumbnailPath === 'string' &&
                                photo.thumbnailPath
                                    ? photo.thumbnailPath
                                    : photo.storagePath
                            }`}
                            alt={photo.originalFileName}
                            className="w-full h-full object-cover cursor-pointer"
                            loading="lazy"
                            onClick={() => onPhotoClick?.(photo)}
                        />

                        {/* Favorite button */}
                        {onToggleFavorite && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(photo.id);
                                }}
                                className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center transition-all cursor-pointer ${
                                    isPhotoFavorite
                                        ? 'opacity-100 scale-110 group-hover:bg-black/60'
                                        : 'opacity-0 group-hover:opacity-100 bg-black/60 hover:scale-110'
                                }`}
                                aria-label={
                                    isPhotoFavorite
                                        ? 'Remove from favorites'
                                        : 'Add to favorites'
                                }
                            >
                                <Heart
                                    className={`w-5 h-5 ${isPhotoFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                                />
                            </button>
                        )}

                        {/* Filename overlay */}
                        <div className="absolute inset-0 bg-black/0 transition-colors flex items-end p-3 pointer-events-none">
                            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm truncate">
                                {photo.originalFileName}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
