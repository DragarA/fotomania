import { CheckCircle, MoreVertical, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
    onUploadClick?: () => void;
}

export function PhotoGrid({
    photos,
    isLoading,
    catalogueCoverImage,
    onPhotoClick,
    onPhotoDelete,
    onSetAsCover,
    onUploadClick,
}: PhotoGridProps) {
    const { t } = useTranslation('gallery');
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        photo: Photo;
    } | null>(null);
    const closeMenuTimer = useRef<number | null>(null);

    const cancelMenuClose = () => {
        if (closeMenuTimer.current !== null) {
            window.clearTimeout(closeMenuTimer.current);
            closeMenuTimer.current = null;
        }
    };

    const scheduleMenuClose = () => {
        cancelMenuClose();
        closeMenuTimer.current = window.setTimeout(() => {
            setContextMenu(null);
            closeMenuTimer.current = null;
        }, 200);
    };

    useEffect(() => () => cancelMenuClose(), []);

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
            <div className="rounded border border-dashed border-black/10 bg-white/85 p-12 text-center shadow-[0_45px_140px_-120px_rgba(0,0,0,0.95)]">
                <div className="mb-4 text-6xl">📷</div>
                <h3 className="mb-2 text-xl font-light tracking-[0.02em] text-stone-800">
                    {t('photoGrid.noPhotosYet')}
                </h3>
                <p className="mb-4 text-stone-500">{t('photoGrid.dragAndDrop')}</p>
                {onUploadClick && (
                    <button
                        onClick={onUploadClick}
                        className="mb-4 flex items-center gap-2 mx-auto rounded border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
                    >
                        <Upload className="h-4 w-4" />
                        {t('photoGrid.browseFiles')}
                    </button>
                )}
                <div className="text-xs uppercase tracking-[0.4em] text-stone-400">
                    {t('photoGrid.uploadHint')}
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {photos.map((photo) => {
                    const isMenuOpen = contextMenu?.photo.id === photo.id;

                    return (
                        <div
                            key={photo.id}
                            className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded border border-black/5 bg-stone-100 shadow-[0_45px_120px_-90px_rgba(0,0,0,0.9)] transition-all duration-700 ${
                                isMenuOpen
                                    ? 'ring-1 ring-stone-400'
                                    : 'hover:-translate-y-1 hover:ring hover:ring-stone-300'
                            }`}
                            onMouseEnter={() => {
                                if (isMenuOpen) {
                                    cancelMenuClose();
                                }
                            }}
                            onMouseLeave={() => {
                                if (isMenuOpen) {
                                    scheduleMenuClose();
                                }
                            }}
                        >
                            <img
                                src={`${API_BASE_URL}/uploads/${photo.thumbnailPath}`}
                                alt={photo.originalFileName}
                                className="h-full w-full cursor-pointer object-cover transition duration-700 group-hover:scale-[1.03]"
                                loading="lazy"
                                onClick={() => onPhotoClick?.(photo)}
                            />

                            {/* Cover badge */}
                            {photo.storagePath === catalogueCoverImage && (
                                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-stone-600 shadow">
                                    <CheckCircle className="h-3 w-3" />
                                    {t('photoGrid.cover')}
                                </div>
                            )}

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/30 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

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
                                className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition duration-500 ${
                                    isMenuOpen
                                        ? 'opacity-100'
                                        : 'opacity-0 group-hover:opacity-100'
                                }`}
                                aria-label="Photo options"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </button>

                            <div className="pointer-events-none absolute inset-0 flex items-end p-4">
                                <div
                                    className={`text-white transition-opacity duration-700 text-sm truncate ${
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
                    onClose={() => {
                        cancelMenuClose();
                        setContextMenu(null);
                    }}
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
                    onPointerEnterMenu={cancelMenuClose}
                    onPointerLeaveMenu={scheduleMenuClose}
                />
            )}
        </>
    );
}
