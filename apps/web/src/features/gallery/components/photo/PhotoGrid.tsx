import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '../../../../lib/api-client';
import type { Photo } from '../../types';

import { PhotoContextMenu } from './PhotoContextMenu';

interface PhotoGridProps {
    photos: Photo[];
    isLoading: boolean;
    catalogueId?: string;
    catalogueCoverImage?: string | null;
    onPhotoClick?: (photo: Photo) => void;
    onPhotoDelete?: (photo: Photo) => void;
    onSetAsCover?: (photo: Photo) => void;
}

export function PhotoGrid({
    photos,
    isLoading,
    catalogueCoverImage,
    onPhotoClick,
    onPhotoDelete,
    onSetAsCover,
}: PhotoGridProps) {
    const { t } = useTranslation('gallery');
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        photo: Photo;
    } | null>(null);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-gray-200 rounded-lg animate-pulse cursor-pointer"
                    />
                ))}
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📷</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {t('photoGrid.noPhotosYet')}
                </h3>
                <p className="text-gray-500 mb-6">
                    {t('photoGrid.dragAndDrop')}
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                    <span>💡</span>
                    <span>{t('photoGrid.uploadHint')}</span>
                </div>
            </div>
        );
    }

    const handleDownload = (photo: Photo) => {
        const link = document.createElement('a');
        link.href = `${API_BASE_URL}/uploads/${photo.storagePath}`;
        link.download = photo.originalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {photos.map((photo) => {
                    const isMenuOpen = contextMenu?.photo.id === photo.id;

                    return (
                        <div
                            key={photo.id}
                            className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden transition-all ${
                                isMenuOpen
                                    ? 'ring-2 ring-indigo-500'
                                    : 'hover:ring-2 hover:ring-indigo-500'
                            }`}
                        >
                            <img
                                src={`${API_BASE_URL}/uploads/${photo.thumbnailPath}`}
                                alt={photo.originalFileName}
                                className="w-full h-full object-cover cursor-pointer"
                                loading="lazy"
                                onClick={() => onPhotoClick?.(photo)}
                            />

                            {/* Cover badge */}
                            {photo.storagePath === catalogueCoverImage && (
                                <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow-md">
                                    <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {t('photoGrid.cover')}
                                </div>
                            )}

                            {/* Three-dot menu button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const rect =
                                        e.currentTarget.getBoundingClientRect();
                                    setContextMenu({
                                        x: rect.left,
                                        y: rect.bottom + 4,
                                        photo,
                                    });
                                }}
                                className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/60 transition-all text-white cursor-pointer ${
                                    isMenuOpen
                                        ? 'opacity-100 scale-110'
                                        : 'opacity-0 group-hover:opacity-100 hover:scale-110'
                                }`}
                                aria-label="Photo options"
                            >
                                <svg
                                    className="w-5 h-5 cursor-pointer"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="12" cy="5" r="2" />
                                    <circle cx="12" cy="12" r="2" />
                                    <circle cx="12" cy="19" r="2" />
                                </svg>
                            </button>

                            <div className="absolute inset-0 bg-black/0 transition-colors flex items-end p-3 pointer-events-none">
                                <div
                                    className={`text-white transition-opacity text-sm truncate ${
                                        isMenuOpen
                                            ? 'opacity-100'
                                            : 'opacity-0 group-hover:opacity-100'
                                    }`}
                                >
                                    {photo.originalFileName}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {contextMenu && (
                <PhotoContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onOpen={() => {
                        onPhotoClick?.(contextMenu.photo);
                        setContextMenu(null);
                    }}
                    onDownload={() => {
                        handleDownload(contextMenu.photo);
                        setContextMenu(null);
                    }}
                    onDelete={() => {
                        onPhotoDelete?.(contextMenu.photo);
                        setContextMenu(null);
                    }}
                    onSetAsCover={
                        onSetAsCover
                            ? () => {
                                  onSetAsCover(contextMenu.photo);
                                  setContextMenu(null);
                              }
                            : undefined
                    }
                    isCurrentCover={
                        contextMenu.photo.storagePath === catalogueCoverImage
                    }
                />
            )}
        </>
    );
}
