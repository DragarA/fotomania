import { API_BASE_URL } from '../../../../lib/api-client';
import type { ClientFavouriteSession } from '../../hooks';
import { useSessionFavouritesQuery } from '../../hooks';

interface FavouritesModalProps {
  session: ClientFavouriteSession | null;
  catalogueId: string;
  isOpen: boolean;
  onClose: () => void;
  onPhotoClick?: (photo: any) => void;
}

export function FavouritesModal({
  session,
  catalogueId,
  isOpen,
  onClose,
  onPhotoClick,
}: FavouritesModalProps) {
  const { data: sessionData, isLoading } = useSessionFavouritesQuery(
    catalogueId,
    session?.sessionId || '',
    isOpen && Boolean(session)
  );

  if (!isOpen || !session) return null;

  const photos = sessionData?.photos || [];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session.email}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Selected {session.photoCount} {session.photoCount === 1 ? 'photo' : 'photos'} on{' '}
              {new Date(session.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Photo List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No photos found
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                This session doesn't have any favorited photos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => onPhotoClick?.(photo)}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={`${API_BASE_URL}/uploads/${photo.thumbnailPath || photo.storagePath}`}
                      alt={photo.originalFileName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Photo Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {index + 1}. {photo.originalFileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {photo.width && photo.height && `${photo.width} × ${photo.height}`}
                      {photo.size && ` • ${(photo.size / 1024 / 1024).toFixed(2)} MB`}
                    </p>
                  </div>

                  {/* View Icon */}
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-indigo-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
