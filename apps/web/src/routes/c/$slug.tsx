import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';

import { usePublicCatalogueQuery, usePublicPhotosQuery } from '../../features/gallery/hooks';
import { CollectionTabs } from '../../features/collections/CollectionTabs';
import { PublicPhotoGrid } from '../../features/photos/PublicPhotoGrid';
import { PhotoLightbox } from '../../features/photos/PhotoLightbox';
import { API_BASE_URL } from '../../lib/api-client';

export const Route = createFileRoute('/c/$slug')({
  component: PublicCataloguePage,
});

function PublicCataloguePage() {
  const { slug } = Route.useParams();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  // Data fetching
  const { data: catalogue, isLoading: catalogueLoading, isError, error } = usePublicCatalogueQuery(slug);
  const { data: photos, isLoading: photosLoading } = usePublicPhotosQuery(slug, selectedCollectionId);

  // Auto-select first collection when catalogue loads
  useEffect(() => {
    if (catalogue?.collections && catalogue.collections.length > 0 && !selectedCollectionId) {
      const firstCollectionId = catalogue.collections[0]?.id;
      if (firstCollectionId) {
        setSelectedCollectionId(firstCollectionId);
      }
    }
  }, [catalogue, selectedCollectionId]);

  // Loading state
  if (catalogueLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !catalogue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Gallery not found
          </h1>
          <p className="text-gray-600">
            {error?.message || 'This link may be invalid or the gallery may have been removed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow">
        {catalogue.coverImage && typeof catalogue.coverImage === 'string' && (
          <div className="w-full h-64 md:h-96 bg-gray-200">
            <img
              src={`${API_BASE_URL}/uploads/${catalogue.coverImage}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2">
            Photo Gallery
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {catalogue.title}
          </h1>
          {catalogue.description && typeof catalogue.description === 'string' && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {catalogue.description}
            </p>
          )}
        </div>
      </div>

      {/* Collection Tabs */}
      {catalogue.collections && catalogue.collections.length > 0 ? (
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto">
            <CollectionTabs
              collections={catalogue.collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={setSelectedCollectionId}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-500">No collections available yet.</p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PublicPhotoGrid
          photos={Array.isArray(photos) ? photos : []}
          isLoading={photosLoading}
          onPhotoClick={setSelectedPhoto}
        />
      </div>

      {/* Lightbox */}
      {selectedPhoto && Array.isArray(photos) && photos.length > 0 && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={photos as any}
          onClose={() => setSelectedPhoto(null)}
          onNext={() => {
            const currentIndex = photos.findIndex((p: any) => p.id === selectedPhoto.id);
            if (currentIndex < photos.length - 1) {
              setSelectedPhoto(photos[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = photos.findIndex((p: any) => p.id === selectedPhoto.id);
            if (currentIndex > 0) {
              setSelectedPhoto(photos[currentIndex - 1]);
            }
          }}
        />
      )}
    </div>
  );
}
