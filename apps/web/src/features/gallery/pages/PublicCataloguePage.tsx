import { createFileRoute, useParams } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePublicCatalogueQuery, usePublicPhotosQuery } from '../hooks';
import { useFavorites } from '../../../hooks/useFavorites';
import { PublicCatalogueHero } from '../components/public/PublicCatalogueHero';
import { CollectionTabs } from '../components/collection/CollectionTabs';
import { PublicPhotoGrid } from '../components/photo/PublicPhotoGrid';
import { PhotoLightbox } from '../components/photo/PhotoLightbox';
import { SaveFavouritesModal } from '../components/favourites/SaveFavouritesModal';
import { SaveSuccessModal } from '../components/favourites/SaveSuccessModal';

export function PublicCataloguePage() {
    const { slug } = useParams({ from: '/c/$slug' });

    const { t } = useTranslation('public');
    const [selectedCollectionId, setSelectedCollectionId] = useState<
        string | null
    >(null);
    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [savedEmail, setSavedEmail] = useState<string>('');

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
        useFavorites(slug);

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

    // Handle show favorites
    const handleSendToPhotographer = () => {
        const favoriteIds = getFavoriteIds();
        if (favoriteIds.length === 0) {
            toast.info(t('gallery.noFavoritesYet'));
        } else {
            setShowSaveModal(true);
        }
    };

    // Handle successful save
    const handleSaveSuccess = (email: string) => {
        setSavedEmail(email);
        setShowSaveModal(false);
        setShowSuccessModal(true);
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
                    <p className="text-gray-600">{t('loading.gallery')}</p>
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
                        {t('error.notFound.title')}
                    </h1>
                    <p className="text-gray-600">
                        {error?.message || t('error.notFound.message')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            {/* Hero Section - Full Height */}
            <PublicCatalogueHero
                catalogue={catalogue}
                onScrollToGallery={scrollToGallery}
            />

            {/* Gallery Section - Full Height */}
            <section
                id="gallery-section"
                className="min-h-screen bg-gray-50 py-8 sm:py-12"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Collection Tabs */}
                    {catalogue.collections &&
                    catalogue.collections.length > 0 ? (
                        <div className="mb-8">
                            <CollectionTabs
                                collections={catalogue.collections}
                                selectedCollectionId={selectedCollectionId}
                                onSelectCollection={setSelectedCollectionId}
                            />
                        </div>
                    ) : (
                        <div className="mb-8 text-center py-4">
                            <p className="text-gray-500">
                                {t('gallery.noCollections')}
                            </p>
                        </div>
                    )}

                    {/* Send to photographer button */}
                    {favoritesCount > 0 && (
                        <div className="mb-6 flex justify-end">
                            <button
                                onClick={handleSendToPhotographer}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                            >
                                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {t('gallery.sendToPhotographer')}
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

            {/* Save Favorites Modal */}
            <SaveFavouritesModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                slug={slug}
                favoriteIds={getFavoriteIds()}
                favoritesCount={favoritesCount}
                onSuccess={handleSaveSuccess}
            />

            {/* Success Confirmation Modal */}
            <SaveSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                email={savedEmail}
                favoritesCount={favoritesCount}
            />
        </div>
    );
}
