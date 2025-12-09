import { useState } from 'react';
import { OpenAPI } from '@repo/sdk';
import { PhotoContextMenu } from './PhotoContextMenu';

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
  onPhotoDelete?: (photo: Photo) => void;
}

export function PhotoGrid({
  photos,
  isLoading,
  onPhotoClick,
  onPhotoDelete,
}: PhotoGridProps) {
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

  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = `${baseUrl}/uploads/${photo.storagePath}`;
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
                src={`${baseUrl}/uploads/${photo.thumbnailPath}`}
                alt={photo.originalFileName}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
                onClick={() => onPhotoClick?.(photo)}
              />

              {/* Three-dot menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
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
        />
      )}
    </>
  );
}
