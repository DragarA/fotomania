import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Heart, ChevronDown } from 'lucide-react';

import {
  usePublicCatalogueQuery,
  usePublicPhotosQuery,
} from '../../features/gallery/hooks';
import { CollectionTabs } from '../../features/gallery/components/collection/CollectionTabs';
import { PublicPhotoGrid } from '../../features/gallery/components/photo/PublicPhotoGrid';
import { PhotoLightbox } from '../../features/gallery/components/photo/PhotoLightbox';
import { API_BASE_URL } from '../../lib/api-client';
import { useFavorites } from '../../hooks/useFavorites';

export const Route = createFileRoute('/c/$slug')({
  component: PublicCataloguePage,
});

function PublicCataloguePage() {
  const { slug } = Route.useParams();
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  // Data fetching
  const {
    data: catalogue,
    isLoading: catalogueLoading,
    isError,
    error,
  } = usePublicCatalogueQuery(slug);
  const { data: photos, isLoading: photosLoading } = usePublicPhotosQuery(
    slug,
    selectedCollectionId
  );

  // Favorites management
  const { toggleFavorite, isFavorite, getFavoriteIds, favoritesCount } =
    useFavorites();

  // Auto-select first collection when catalogue loads
  useEffect(() => {
    if (
      catalogue?.collections &&
      catalogue.collections.length > 0 &&
      !selectedCollectionId
    ) {
      const firstCollectionId = catalogue.collections[0]?.id;
      if (firstCollectionId) {
        setSelectedCollectionId(firstCollectionId);
      }
    }
  }, [catalogue, selectedCollectionId]);

  // Handle show favorites alert
  const handleShowFavorites = () => {
    const favoriteIds = getFavoriteIds();
    if (favoriteIds.length === 0) {
      alert(
        'No favorite photos yet! Click the heart icon on photos to add them to your favorites.'
      );
    } else {
      alert(`Favorite Photo IDs:\n\n${favoriteIds.join('\n')}`);
    }
  };

  // Scroll to gallery section
  const scrollToGallery = () => {
    document.getElementById('gallery-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

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
            {error?.message ||
              'This link may be invalid or the gallery may have been removed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section - Full Height */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Cover Photo Background */}
        {catalogue.coverImage && typeof catalogue.coverImage === 'string' ? (
          <>
            {/* Blurred Background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${API_BASE_URL}/uploads/${catalogue.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(40px)',
                transform: 'scale(1.1)',
              }}
            />

            {/* Main Cover Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={`${API_BASE_URL}/uploads/${catalogue.coverImage}`}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
        )}

        {/* Hero Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold text-white/90 uppercase tracking-widest mb-4">
              Photo Gallery
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              {catalogue.title}
            </h1>
            {catalogue.description &&
              typeof catalogue.description === 'string' && (
                <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-md">
                  {catalogue.description}
                </p>
              )}
          </div>

          {/* Scroll Down Button */}
          <button
            onClick={scrollToGallery}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/90 hover:text-white transition-all hover:scale-110 group"
            aria-label="Scroll to gallery"
          >
            <span className="text-sm font-medium hidden sm:block">
              View Gallery
            </span>
            <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center group-hover:border-white animate-bounce">
              <ChevronDown className="w-6 h-6" />
            </div>
          </button>
        </div>
      </section>

      {/* Gallery Section - Full Height */}
      <section
        id="gallery-section"
        className="min-h-screen bg-gray-50 py-8 sm:py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Collection Tabs */}
          {catalogue.collections && catalogue.collections.length > 0 ? (
            <div className="mb-8">
              <CollectionTabs
                collections={catalogue.collections}
                selectedCollectionId={selectedCollectionId}
                onSelectCollection={setSelectedCollectionId}
              />
            </div>
          ) : (
            <div className="mb-8 text-center py-4">
              <p className="text-gray-500">No collections available yet.</p>
            </div>
          )}

          {/* Show Favorites Button */}
          {favoritesCount > 0 && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={handleShowFavorites}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                <span className="text-sm font-medium text-gray-700">
                  Show Favorites
                </span>
              </button>
            </div>
          )}

          {/* Photo Grid */}
          <PublicPhotoGrid
            photos={Array.isArray(photos) ? photos : []}
            isLoading={photosLoading}
            onPhotoClick={setSelectedPhoto}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && Array.isArray(photos) && photos.length > 0 && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={photos as any}
          onClose={() => setSelectedPhoto(null)}
          onNext={() => {
            const currentIndex = photos.findIndex(
              (p: any) => p.id === selectedPhoto.id
            );
            if (currentIndex < photos.length - 1) {
              setSelectedPhoto(photos[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = photos.findIndex(
              (p: any) => p.id === selectedPhoto.id
            );
            if (currentIndex > 0) {
              setSelectedPhoto(photos[currentIndex - 1]);
            }
          }}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
        />
      )}
    </div>
  );
}
