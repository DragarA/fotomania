import { OpenAPI } from '@repo/sdk';

interface Photo {
  id: string;
  originalFileName: string;
  storagePath: string;
  mimeType: string;
  width?: number;
  height?: number;
  size?: number;
  collectionId: string;
  thumbnailPath?: string;
  createdAt: string;
  updatedAt: string;
}

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
  onPhotoClick?: (photo: Photo) => void;
}

export function PhotoGrid({ photos, isLoading, onPhotoClick }: PhotoGridProps) {
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
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">📷</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No photos yet
        </h3>
        <p className="text-gray-500 mb-6">
          Drag and drop images anywhere on this area to upload
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-gray-400">
          <span>💡</span>
          <span>You can upload JPG, PNG, WebP or HEIC images</span>
        </div>
      </div>
    );
  }

  // Get base URL for image serving
  const baseUrl = OpenAPI.BASE || 'http://localhost:3000';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          onClick={() => onPhotoClick?.(photo)}
          className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
        >
          <img
            src={`${baseUrl}/${photo.storagePath}`}
            alt={photo.originalFileName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3">
            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm truncate">
              {photo.originalFileName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
