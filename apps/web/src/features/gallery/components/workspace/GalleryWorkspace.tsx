import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useConfirmDialog } from '../../../common/useConfirmDialog';
import {
    useCatalogueQuery,
    useSetCatalogueCoverMutation,
    useCollectionsQuery,
    useDeleteCollectionMutation,
    usePhotosQuery,
    useDeletePhotoMutation,
    usePhotoUpload,
    useCatalogueFavouritesQuery,
    useSendDeliveryEmailMutation,
} from '../../hooks';
import { useCatalogueDetailState } from '../../state/useCatalogueDetailState';
import type { Collection, Photo } from '../../types';
import { CatalogueSidebar } from '../catalogue/CatalogueSidebar';
import { CollectionContextMenu } from '../collection/CollectionContextMenu';
import { CollectionModal } from '../collection/CollectionModal';
import { PhotoLightbox } from '../photo/PhotoLightbox';
import { PhotoWorkspace } from '../photo/PhotoWorkspace';
import { UploadQueue } from '../photo/UploadQueue';

interface GalleryWorkspaceProps {
    catalogueId: string;
}

export function GalleryWorkspace({ catalogueId }: GalleryWorkspaceProps) {
    const { t } = useTranslation('gallery');
    const { confirmDelete } = useConfirmDialog();

    // Data queries
    const { data: catalogue, isLoading: catalogueLoading } =
        useCatalogueQuery(catalogueId);
    const { data: collections, isLoading: collectionsLoading } =
        useCollectionsQuery(catalogueId);
    const { data: favouriteSessions, isLoading: favouritesLoading } =
        useCatalogueFavouritesQuery(catalogueId);

    // State management
    const {
        selectedCollectionId,
        setSelectedCollectionId,
        selectedCollection,
        clearSelectedCollectionIfDeleted,
        modalState,
        openCreateModal,
        openEditModal,
        closeModal,
        collectionContextMenu,
        openContextMenu,
        closeContextMenu,
        selectedPhoto,
        setSelectedPhoto,
    } = useCatalogueDetailState(collections);

    // Mutations
    const deleteMutation = useDeleteCollectionMutation();
    const deletePhotoMutation = useDeletePhotoMutation();
    const setCoverMutation = useSetCatalogueCoverMutation();
    const sendDeliveryEmailMutation = useSendDeliveryEmailMutation();

    // Photo upload
    const { uploadQueue, addFiles, removeFile, clearCompleted } =
        usePhotoUpload(selectedCollectionId);
    const { data: photos, isLoading: photosLoading } =
        usePhotosQuery(selectedCollectionId);

    // Dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/heic': ['.heic'],
        },
        maxSize: 10 * 1024 * 1024,
        maxFiles: 1000,
        disabled: !selectedCollectionId,
        onDrop: (acceptedFiles, rejectedFiles) => {
            if (rejectedFiles.length > 0) {
                rejectedFiles.forEach((rejected) => {
                    const reason =
                        rejected.errors[0]?.message ||
                        t('workspace.invalidFile');
                    toast.error(`${rejected.file.name}: ${reason}`);
                });
            }
            if (acceptedFiles.length > 0) {
                addFiles(acceptedFiles);
            }
        },
        noClick: true,
        noKeyboard: true,
    });

    // Handlers
    const handleDeleteCollection = (
        collectionId: string,
        collectionName: string
    ) => {
        confirmDelete({
            title: t('workspace.deleteCollectionTitle', {
                name: collectionName,
            }),
            description: t('workspace.cannotBeUndone'),
            onConfirm: () => {
                deleteMutation.mutate(
                    { id: collectionId, catalogueId },
                    {
                        onSuccess: () =>
                            clearSelectedCollectionIfDeleted(collectionId),
                    }
                );
            },
        });
    };

    const handleDeletePhoto = (photo: Photo) => {
        confirmDelete({
            title: t('workspace.deletePhotoTitle'),
            description: `${photo.originalFileName}\n${t('workspace.cannotBeUndone')}`,
            onConfirm: () => {
                deletePhotoMutation.mutate({
                    id: photo.id,
                    collectionId: photo.collectionId,
                });
                if (selectedPhoto?.id === photo.id) {
                    setSelectedPhoto(null);
                }
            },
        });
    };

    const handleSetAsCover = (photo: Photo) => {
        setCoverMutation.mutate({ catalogueId, photoId: photo.id });
    };

    const handleCollectionContextMenu = (
        e: React.MouseEvent,
        collection: Collection
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        openContextMenu(rect.left, rect.bottom + 4, collection);
    };

    // Loading state
    if (catalogueLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!catalogue) {
        return <div>{t('workspace.catalogueNotFound')}</div>;
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_rgba(248,246,242,1))] px-4 py-6 md:px-8 lg:flex-row">
            <CatalogueSidebar
                catalogue={catalogue}
                catalogueId={catalogueId}
                collections={collections}
                collectionsLoading={collectionsLoading}
                selectedCollectionId={selectedCollectionId}
                onSelectCollection={setSelectedCollectionId}
                onCreateCollection={openCreateModal}
                onCollectionContextMenu={handleCollectionContextMenu}
                favouriteSessions={favouriteSessions}
                favouritesLoading={favouritesLoading}
            />

            <div className="flex-1 w-full">
                <PhotoWorkspace
                    selectedCollection={selectedCollection}
                    collections={collections}
                    photos={photos}
                    photosLoading={photosLoading}
                    catalogueId={catalogueId}
                    catalogue={catalogue}
                    dropzoneRootProps={getRootProps()}
                    dropzoneInputProps={getInputProps()}
                    isDragActive={isDragActive}
                    selectedCollectionId={selectedCollectionId}
                    onPhotoClick={setSelectedPhoto}
                    onPhotoDelete={handleDeletePhoto}
                    onSetAsCover={handleSetAsCover}
                />
            </div>

            <CollectionModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                mode={modalState.mode}
                catalogueId={catalogueId}
                initialData={modalState.initialData}
            />

            {collectionContextMenu && (
                <CollectionContextMenu
                    x={collectionContextMenu.x}
                    y={collectionContextMenu.y}
                    onClose={closeContextMenu}
                    onEdit={() =>
                        openEditModal(collectionContextMenu.collection)
                    }
                    onDelete={() =>
                        handleDeleteCollection(
                            collectionContextMenu.collection.id,
                            collectionContextMenu.collection.name
                        )
                    }
                    isDelivery={
                        collectionContextMenu.collection.type === 'delivery'
                    }
                    onShareDelivery={
                        collectionContextMenu.collection.type === 'delivery' &&
                        collectionContextMenu.collection.deliverySlug
                            ? () => {
                                  const deliveryUrl = `${window.location.origin}/d/${collectionContextMenu.collection.deliverySlug}`;
                                  navigator.clipboard.writeText(deliveryUrl);
                                  toast.success(t('sidebar.linkCopied'));
                                  closeContextMenu();
                              }
                            : undefined
                    }
                    onSendDeliveryEmail={
                        collectionContextMenu.collection.type === 'delivery'
                            ? () => {
                                  sendDeliveryEmailMutation.mutate({
                                      collectionId: collectionContextMenu.collection.id,
                                  });
                                  closeContextMenu();
                              }
                            : undefined
                    }
                />
            )}

            {uploadQueue.length > 0 && (
                <UploadQueue
                    files={uploadQueue}
                    onRemove={removeFile}
                    onClear={clearCompleted}
                />
            )}

            {selectedPhoto && photos && (
                <PhotoLightbox
                    photo={selectedPhoto}
                    photos={photos}
                    onClose={() => setSelectedPhoto(null)}
                    onNext={() => {
                        const currentIndex = photos.findIndex(
                            (p) => p.id === selectedPhoto.id
                        );
                        if (currentIndex < photos.length - 1) {
                            setSelectedPhoto(photos[currentIndex + 1]!);
                        }
                    }}
                    onPrevious={() => {
                        const currentIndex = photos.findIndex(
                            (p) => p.id === selectedPhoto.id
                        );
                        if (currentIndex > 0) {
                            setSelectedPhoto(photos[currentIndex - 1]!);
                        }
                    }}
                />
            )}
        </div>
    );
}
