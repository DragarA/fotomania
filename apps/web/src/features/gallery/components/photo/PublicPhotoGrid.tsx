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
}

export function PublicPhotoGrid({
  photos,
  isLoading,
  onPhotoClick,
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
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer"
          onClick={() => onPhotoClick?.(photo)}
        >
          <img
            src={`${API_BASE_URL}/uploads/${
              typeof photo.thumbnailPath === 'string' && photo.thumbnailPath
                ? photo.thumbnailPath
                : photo.storagePath
            }`}
            alt={photo.originalFileName}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Filename overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-3 pointer-events-none">
            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm truncate w-full">
              {photo.originalFileName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
