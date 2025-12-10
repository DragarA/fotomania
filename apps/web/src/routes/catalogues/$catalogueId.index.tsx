import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

import { requireAuth } from '../../features/auth/guards';
import {
  useCatalogueQuery,
  useSetCatalogueCoverMutation,
  useCollectionsQuery,
  useDeleteCollectionMutation,
  usePhotosQuery,
  useDeletePhotoMutation,
  usePhotoUpload,
} from '../../features/gallery/hooks';
import { useCatalogueDetailState } from '../../features/gallery/state/useCatalogueDetailState';
import { CatalogueSidebar } from '../../features/gallery/components/catalogue/CatalogueSidebar';
import { CollectionModal } from '../../features/gallery/components/collection/CollectionModal';
import { CollectionContextMenu } from '../../features/gallery/components/collection/CollectionContextMenu';
import { UploadQueue } from '../../features/gallery/components/photo/UploadQueue';
import { PhotoWorkspace } from '../../features/gallery/components/photo/PhotoWorkspace';
import { PhotoLightbox } from '../../features/gallery/components/photo/PhotoLightbox';
import { useConfirmDialog } from '../../features/common/useConfirmDialog';

export const Route = createFileRoute('/catalogues/$catalogueId/')({
  beforeLoad: requireAuth,
  component: CatalogueDetailPage,
});

function CatalogueDetailPage() {
  const { catalogueId } = Route.useParams();
  const { confirmDelete } = useConfirmDialog();

  // Data queries
  const { data: catalogue, isLoading: catalogueLoading } = useCatalogueQuery(catalogueId);
  const { data: collections, isLoading: collectionsLoading } = useCollectionsQuery(catalogueId);

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

  // Photo upload
  const { uploadQueue, addFiles, removeFile, clearCompleted } = usePhotoUpload(selectedCollectionId);
  const { data: photos, isLoading: photosLoading } = usePhotosQuery(selectedCollectionId);

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 20,
    disabled: !selectedCollectionId,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejected) => {
          const reason = rejected.errors[0]?.message || 'Invalid file';
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
  const handleDeleteCollection = (collectionId: string, collectionName: string) => {
    confirmDelete({
      title: `Delete "${collectionName}"?`,
      description: 'This action cannot be undone.',
      onConfirm: () => {
        deleteMutation.mutate(
          { id: collectionId, catalogueId },
          { onSuccess: () => clearSelectedCollectionIfDeleted(collectionId) }
        );
      },
    });
  };

  const handleDeletePhoto = (photo: any) => {
    confirmDelete({
      title: 'Delete photo?',
      description: `${photo.originalFileName}\nThis action cannot be undone.`,
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

  const handleSetAsCover = (photo: any) => {
    setCoverMutation.mutate({ catalogueId, photoId: photo.id });
  };

  const handleCollectionContextMenu = (e: React.MouseEvent, collection: any) => {
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
    return <div>Catalogue not found</div>;
  }

  return (
    <div className="flex h-screen">
      <CatalogueSidebar
        catalogue={catalogue}
        catalogueId={catalogueId}
        collections={collections}
        collectionsLoading={collectionsLoading}
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={setSelectedCollectionId}
        onCreateCollection={openCreateModal}
        onCollectionContextMenu={handleCollectionContextMenu}
      />

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
          onEdit={() => openEditModal(collectionContextMenu.collection)}
          onDelete={() =>
            handleDeleteCollection(
              collectionContextMenu.collection.id,
              collectionContextMenu.collection.name
            )
          }
        />
      )}

      {uploadQueue.length > 0 && (
        <UploadQueue files={uploadQueue} onRemove={removeFile} onClear={clearCompleted} />
      )}

      {selectedPhoto && photos && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setSelectedPhoto(null)}
          onNext={() => {
            const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
            if (currentIndex < photos.length - 1) {
              setSelectedPhoto(photos[currentIndex + 1]!);
            }
          }}
          onPrevious={() => {
            const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
            if (currentIndex > 0) {
              setSelectedPhoto(photos[currentIndex - 1]!);
            }
          }}
        />
      )}
    </div>
  );
}
