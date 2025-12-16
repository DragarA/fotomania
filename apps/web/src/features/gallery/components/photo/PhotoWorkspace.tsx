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
}: PhotoWorkspaceProps) {
    const { t } = useTranslation('gallery');

    return (
        <main
            {...dropzoneRootProps}
            className="relative flex min-h-full flex-col overflow-hidden rounded border border-white/20 bg-white/70 shadow-[0_45px_140px_-100px_rgba(0,0,0,0.9)] backdrop-blur"
        >
            <input {...dropzoneInputProps} />

            {selectedCollection ? (
                <div className="space-y-8 p-8 md:p-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
                                {t('sidebar.collectionsTab')}
                            </p>
                            <h2 className="text-3xl font-light tracking-[0.02em] text-stone-800">
                                {selectedCollection.name}
                            </h2>
                        </div>
                        <div className="text-xs uppercase tracking-[0.4em] text-stone-400">
                            {photos?.length || 0} {t('sidebar.photos')}
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
