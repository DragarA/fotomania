import { useEffect } from 'react';
import { Heart } from 'lucide-react';

import { API_BASE_URL } from '../../../../lib/api-client';

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
}

interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleFavorite?: (photoId: string) => void;
  isFavorite?: (photoId: string) => boolean;
}

export function PhotoLightbox({
  photo,
  photos,
  onClose,
  onNext,
  onPrevious,
  onToggleFavorite,
  isFavorite,
}: PhotoLightboxProps) {
  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;
  const isPhotoFavorite = isFavorite?.(photo.id) ?? false;

  // Determine if photo is vertical (portrait orientation)
  const isVertical = photo.height && photo.width && photo.height > photo.width;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious, hasPrevious, hasNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Top Bar with Heart and Close buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Heart button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(photo.id);
            }}
            className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-all cursor-pointer hover:scale-110"
            aria-label={isPhotoFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-7 h-7 ${isPhotoFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Previous button */}
      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Previous photo"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Next photo"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 md:p-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Blurred Background for Vertical Images */}
        {isVertical && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={`${API_BASE_URL}/uploads/${photo.storagePath}`}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-110 opacity-40"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <img
            src={`${API_BASE_URL}/uploads/${photo.storagePath}`}
            alt={photo.originalFileName}
            className={`w-auto h-auto object-contain ${
              isVertical
                ? 'max-h-[calc(100vh-4rem)] max-w-[90vw]'
                : 'max-w-full max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-10rem)]'
            }`}
          />

          {/* Photo info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 text-white">
            <p className="font-medium truncate">{photo.originalFileName}</p>
            <p className="text-sm text-gray-300 mt-1">
              {currentIndex + 1} of {photos.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
