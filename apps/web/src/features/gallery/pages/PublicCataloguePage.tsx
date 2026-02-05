import { useParams } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useFavorites } from '../../../hooks/useFavorites';
import { CollectionTabs } from '../components/collection/CollectionTabs';
import { SaveFavouritesModal } from '../components/favourites/SaveFavouritesModal';
import { SaveSuccessModal } from '../components/favourites/SaveSuccessModal';
import { PhotoLightbox } from '../components/photo/PhotoLightbox';
import { PublicPhotoGrid } from '../components/photo/PublicPhotoGrid';
import { PasswordPrompt } from '../components/public/PasswordPrompt';
import { PublicCatalogueHero } from '../components/public/PublicCatalogueHero';
import {
    usePublicCatalogueQuery,
    usePublicPhotosQuery,
    usePublicAccess,
} from '../hooks';

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

    // Password protection
    const {
        verifyPassword,
        isPending: isVerifying,
        error: verifyError,
    } = usePublicAccess(slug);

    // Data fetching
    const {
        data: catalogue,
        isLoading: catalogueLoading,
        isError,
        error,
        refetch,
    } = usePublicCatalogueQuery(slug);
    const { data: photos, isLoading: photosLoading } = usePublicPhotosQuery(
        slug,
        selectedCollectionId
    );

    // Check if password is required (401 error)
    const isPasswordRequired =
        isError && (error as Error & { status?: number })?.status === 401;

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

    // Handle password submission
    const handlePasswordSubmit = (password: string) => {
        verifyPassword(password, {
            onSuccess: () => {
                // Refetch catalogue data after successful password verification
                refetch();
            },
        });
    };

    // Loading state
    if (catalogueLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(30,26,24,0.9))]">
                <div className="rounded border border-white/10 bg-white/10 px-10 py-8 text-center text-white backdrop-blur">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border border-white/20 border-t-white/80" />
                    <p className="text-xs uppercase tracking-[0.4em]">
                        {t('loading.gallery')}
                    </p>
                </div>
            </div>
        );
    }

    // Password required state
    if (isPasswordRequired) {
        return (
            <PasswordPrompt
                onSubmit={handlePasswordSubmit}
                isPending={isVerifying}
                error={verifyError}
            />
        );
    }

    // Error state (not password related)
    if (isError || !catalogue) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(38,34,31,1))] px-4">
                <div className="max-w-md rounded border border-white/10 bg-white/80 px-8 py-10 text-center shadow-[0_45px_140px_-100px_rgba(0,0,0,0.95)] backdrop-blur">
                    <h1 className="mb-4 text-2xl font-light tracking-[0.03em] text-stone-800">
                        {t('error.notFound.title')}
                    </h1>
                    <p className="text-stone-500">
                        {error?.message || t('error.notFound.message')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(249,246,241,1))]"
            style={{
                '--brand-main': catalogue.photographerBrandColorMain || '#292524',
                '--brand-accent': catalogue.photographerBrandColorAccent || '#78716c',
            } as React.CSSProperties}
        >
            {/* Hero Section - Full Height */}
            <PublicCatalogueHero
                catalogue={catalogue}
                onScrollToGallery={scrollToGallery}
            />

            {/* Gallery Section - Full Height */}
            <section
                id="gallery-section"
                className="relative min-h-screen py-10 sm:py-16"
            >
                {/* Branded background gradient overlay */}
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        background: `linear-gradient(135deg, var(--brand-main) 0%, transparent 50%, var(--brand-accent) 100%)`,
                    }}
                />
                {/* Original background */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/95 to-[#f7f4ef]" />

                <div className="relative mx-auto max-w-6xl px-4 sm:px-8">
                    {/* Collection Tabs Header */}
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
                        <div className="mb-8 py-6 text-center">
                            <p className="text-sm uppercase tracking-[0.4em] text-stone-400">
                                {t('gallery.noCollections')}
                            </p>
                        </div>
                    )}

                    {/* Send to photographer button */}
                    {favoritesCount > 0 && (
                        <div className="mb-8 flex justify-end">
                            <div className="rounded-full border border-black/5 bg-white/90 px-4 py-2 shadow-[0_35px_80px_-65px_rgba(0,0,0,0.85)]">
                                <button
                                    onClick={handleSendToPhotographer}
                                    className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.4em] text-stone-500 transition hover:text-stone-800"
                                >
                                    <Heart
                                        className="h-4 w-4 text-red-500"
                                        strokeWidth={1.2}
                                    />
                                    {t('gallery.sendToPhotographer')}
                                </button>
                            </div>
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
                collectionSettings={{
                    collectClientName: catalogue?.collectClientName ?? false,
                    collectClientAddress: catalogue?.collectClientAddress ?? false,
                    collectClientPhone: catalogue?.collectClientPhone ?? false,
                    collectClientNotes: catalogue?.collectClientNotes ?? false,
                }}
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
