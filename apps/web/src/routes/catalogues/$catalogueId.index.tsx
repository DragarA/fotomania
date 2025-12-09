import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

import { usePhotoUpload } from '../../features/photos/usePhotoUpload';
import { UploadQueue } from '../../features/photos/UploadQueue';
import {
  usePhotosQuery,
  useDeletePhotoMutation,
} from '../../features/photos/hooks';
import { PhotoGrid } from '../../features/photos/PhotoGrid';
import { PhotoLightbox } from '../../features/photos/PhotoLightbox';

import { requireAuth } from '../../features/auth/guards';
import {
  useCatalogueQuery,
  useSetCatalogueCoverMutation,
} from '../../features/catalogues/hooks';
import {
  useCollectionsQuery,
  useDeleteCollectionMutation,
} from '../../features/collections/hooks';
import { CollectionModal } from '../../features/collections/CollectionModal';
import { CollectionContextMenu } from '../../features/collections/CollectionContextMenu';

export const Route = createFileRoute('/catalogues/$catalogueId/')({
  beforeLoad: requireAuth,
  component: CatalogueDetailPage,
});

function CatalogueDetailPage() {
  const { catalogueId } = Route.useParams();
  const { data: catalogue, isLoading: catalogueLoading } =
    useCatalogueQuery(catalogueId);
  const { data: collections, isLoading: collectionsLoading } =
    useCollectionsQuery(catalogueId);
  const deleteMutation = useDeleteCollectionMutation();

  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialData?: any;
  }>({
    isOpen: false,
    mode: 'create',
  });
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [collectionContextMenu, setCollectionContextMenu] = useState<{
    x: number;
    y: number;
    collection: any;
  } | null>(null);

  const { uploadQueue, addFiles, removeFile, clearCompleted } =
    usePhotoUpload(selectedCollectionId);

  const { data: photos, isLoading: photosLoading } =
    usePhotosQuery(selectedCollectionId);

  const deletePhotoMutation = useDeletePhotoMutation();
  const setCoverMutation = useSetCatalogueCoverMutation();

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

  useEffect(() => {
    if (collections && collections.length > 0 && !selectedCollectionId) {
      setSelectedCollectionId(collections[0]!.id);
    }
  }, [collections, selectedCollectionId]);

  const handleDeleteCollection = (
    collectionId: string,
    collectionName: string
  ) => {
    toast.custom(
      (t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-2">
            Delete &quot;{collectionName}&quot;?
          </p>
          <p className="text-sm text-gray-600 mb-3">
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                deleteMutation.mutate(
                  { id: collectionId, catalogueId },
                  {
                    onSuccess: () => {
                      if (selectedCollectionId === collectionId) {
                        setSelectedCollectionId(null);
                      }
                    },
                  }
                );
              }}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleDeletePhoto = (photo: any) => {
    toast.custom(
      (t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-2">Delete photo?</p>
          <p className="text-sm text-gray-600 mb-1">
            {photo.originalFileName}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                deletePhotoMutation.mutate({
                  id: photo.id,
                  collectionId: photo.collectionId,
                });
                // Close lightbox if this photo is currently open
                if (selectedPhoto?.id === photo.id) {
                  setSelectedPhoto(null);
                }
              }}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleSetAsCover = (photo: any) => {
    setCoverMutation.mutate({
      catalogueId,
      photoId: photo.id,
    });
  };

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

  const selectedCollection = collections?.find(
    (c) => c.id === selectedCollectionId
  );

  return (
    <div className="flex h-screen">
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {catalogue.title}
          </h1>
          {catalogue.description && (
            <p className="text-gray-600 text-sm">{catalogue.description}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            {catalogue.photoCount} photos
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
            <button
              onClick={() => setModalState({ isOpen: true, mode: 'create' })}
              className="text-accent-600 hover:text-accent-700 text-sm font-medium cursor-pointer"
            >
              + Add
            </button>
          </div>

          {collectionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : collections && collections.length > 0 ? (
            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    selectedCollectionId === collection.id
                      ? 'bg-indigo-50 border-2 border-accent-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCollectionId(collection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {collection.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {collection.photoCount} photos
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setCollectionContextMenu({
                          x: rect.left,
                          y: rect.bottom + 4,
                          collection,
                        });
                      }}
                      className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                      title="More options"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No collections yet</p>
              <button
                onClick={() => setModalState({ isOpen: true, mode: 'create' })}
                className="px-4 py-2 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all cursor-pointer"
              >
                Create First Collection
              </button>
            </div>
          )}
        </div>
      </aside>

      <main
        {...getRootProps()}
        className="flex-1 bg-gray-50 overflow-y-auto relative cursor-pointer"
      >
        <input {...getInputProps()} />

        {selectedCollection ? (
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {selectedCollection.name}
            </h2>
            <PhotoGrid
              photos={photos || []}
              isLoading={photosLoading}
              catalogueId={catalogueId}
              catalogueCoverImage={catalogue?.coverImage}
              onPhotoClick={(photo) => setSelectedPhoto(photo)}
              onPhotoDelete={handleDeletePhoto}
              onSetAsCover={handleSetAsCover}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-xl">Select a collection to view photos</p>
              {collections && collections.length === 0 && (
                <p className="text-sm mt-2">
                  Create your first collection to get started
                </p>
              )}
            </div>
          </div>
        )}

        {isDragActive && selectedCollectionId && (
          <div className="absolute inset-0 bg-accent-500/10 backdrop-blur-sm flex items-center justify-center z-30 border-4 border-dashed border-accent-500">
            <div className="bg-white rounded-2xl p-12 shadow-2xl text-center">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Drop images here
              </h3>
              <p className="text-gray-600">Upload up to 20 images at once</p>
              <p className="text-sm text-gray-500 mt-2">
                Supported: JPG, PNG, WebP, HEIC (max 10MB each)
              </p>
            </div>
          </div>
        )}
      </main>

      <CollectionModal
        isOpen={modalState.isOpen}
        onClose={(createdCollectionId?: string) => {
          setModalState({ ...modalState, isOpen: false });
          // Switch to the newly created collection
          if (createdCollectionId && modalState.mode === 'create') {
            setSelectedCollectionId(createdCollectionId);
          }
        }}
        mode={modalState.mode}
        catalogueId={catalogueId}
        initialData={modalState.initialData}
      />

      {collectionContextMenu && (
        <CollectionContextMenu
          x={collectionContextMenu.x}
          y={collectionContextMenu.y}
          onClose={() => setCollectionContextMenu(null)}
          onEdit={() => {
            setModalState({
              isOpen: true,
              mode: 'edit',
              initialData: collectionContextMenu.collection,
            });
          }}
          onDelete={() => {
            handleDeleteCollection(
              collectionContextMenu.collection.id,
              collectionContextMenu.collection.name
            );
          }}
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
              setSelectedPhoto(photos[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = photos.findIndex(
              (p) => p.id === selectedPhoto.id
            );
            if (currentIndex > 0) {
              setSelectedPhoto(photos[currentIndex - 1]);
            }
          }}
        />
      )}
    </div>
  );
}
