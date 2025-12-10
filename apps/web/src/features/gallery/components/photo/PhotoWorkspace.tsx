import { PhotoGrid } from './PhotoGrid';
import type { Collection, Photo } from '../../types';

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
  return (
    <main
      {...dropzoneRootProps}
      className="flex-1 bg-gray-50 overflow-y-auto relative cursor-pointer"
    >
      <input {...dropzoneInputProps} />

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
            onPhotoClick={onPhotoClick}
            onPhotoDelete={onPhotoDelete}
            onSetAsCover={onSetAsCover}
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

      {/* Drag overlay */}
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
  );
}

