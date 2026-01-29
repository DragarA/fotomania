import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Collection, Photo } from '../../types';

import { PhotoGrid } from './PhotoGrid';

interface Catalogue {
    id: string;
    coverImage?: string | null;
}

interface DropzoneRootProps {
    onClick?: () => void;
    onKeyDown?: () => void;
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    onDragOver?: () => void;
    onDrop?: () => void;
    role?: string;
    tabIndex?: number;
}

interface PhotoWorkspaceProps {
    selectedCollection: Collection | undefined;
    collections: Collection[] | undefined;
    photos: Photo[] | undefined;
    photosLoading: boolean;
    catalogueId: string;
    catalogue: Catalogue | undefined;
    dropzoneRootProps: DropzoneRootProps;
    dropzoneInputProps: React.InputHTMLAttributes<HTMLInputElement>;
    isDragActive: boolean;
    selectedCollectionId: string | null;
    onPhotoClick: (photo: Photo) => void;
    onPhotoDelete: (photo: Photo) => void;
    onSetAsCover: (photo: Photo) => void;
    onUploadClick: () => void;
}

export function PhotoWorkspace({
    selectedCollection,
    collections,
    photos,
    photosLoading,
    catalogueId,
    catalogue,
    dropzoneRootProps,
    dropzoneInputProps,
    isDragActive,
    selectedCollectionId,
    onPhotoClick,
    onPhotoDelete,
    onSetAsCover,
    onUploadClick,
}: PhotoWorkspaceProps) {
    const { t } = useTranslation('gallery');

    return (
        <main
            {...dropzoneRootProps}
            className="relative flex min-h-full flex-col overflow-hidden rounded border border-white/20 bg-white/70 shadow-[0_45px_140px_-100px_rgba(0,0,0,0.9)] backdrop-blur"
        >
            <input {...dropzoneInputProps} />

            {selectedCollection ? (
                <div className="space-y-8 p-6 sm:p-8 md:p-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
                                {t('sidebar.collectionsTab')}
                            </p>
                            <h2 className="truncate text-2xl font-light tracking-[0.02em] text-stone-800 sm:text-3xl">
                                {selectedCollection.type === 'delivery' ? selectedCollection.name.replace('Delivery', t('collection.delivery_collection_name')) : selectedCollection.name}
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
                            <button
                                onClick={onUploadClick}
                                data-onboarding="upload-photos"
                                className="flex items-center gap-2 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
                            >
                                <Upload className="h-4 w-4" />
                                {t('photoWorkspace.uploadPhotos')}
                            </button>
                            <div className="whitespace-nowrap text-xs uppercase tracking-[0.4em] text-stone-400">
                                {photos?.length || 0} {t('sidebar.photos', { count: photos?.length || 0 })}
                            </div>
                        </div>
                    </div>
                    <PhotoGrid
                        photos={photos || []}
                        isLoading={photosLoading}
                        catalogueId={catalogueId}
                        catalogueCoverImage={catalogue?.coverImage}
                        onPhotoClick={onPhotoClick}
                        onPhotoDelete={onPhotoDelete}
                        onSetAsCover={onSetAsCover}
                        onUploadClick={onUploadClick}
                    />
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center p-10 text-center text-stone-500">
                    <div>
                        <p className="text-xl tracking-[0.02em]">
                            {t('photoWorkspace.selectCollection')}
                        </p>
                        {collections && collections.length === 0 && (
                            <p className="mt-2 text-sm uppercase tracking-[0.3em]">
                                {t('photoWorkspace.createFirstCollection')}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Drag overlay */}
            {isDragActive && selectedCollectionId && (
                <div className="absolute inset-0 z-30 flex items-center justify-center border border-dashed border-stone-400/60 bg-white/70 backdrop-blur-sm">
                    <div className="space-y-3 rounded border border-black/5 bg-white/90 px-12 py-10 text-center shadow-[0_60px_140px_-120px_rgba(0,0,0,0.95)]">
                        <div className="text-5xl">📤</div>
                        <h3 className="text-2xl font-light tracking-[0.02em] text-stone-800">
                            {t('photoWorkspace.dropImagesHere')}
                        </h3>
                        <p className="text-stone-500">
                            {t('photoWorkspace.uploadLimit')}
                        </p>
                        <p className="text-sm uppercase tracking-[0.3em] text-stone-400">
                            {t('photoWorkspace.supportedFormats')}
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
