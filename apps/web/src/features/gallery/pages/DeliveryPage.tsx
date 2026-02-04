import { useParams } from '@tanstack/react-router';
import { Download, Image, Loader2, Mail, Package } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api-client';

import { DeliveryLightbox } from '../components/photo/DeliveryLightbox';
import { DeliveryPhotoGrid } from '../components/photo/DeliveryPhotoGrid';
import { PasswordPrompt } from '../components/public/PasswordPrompt';
import {
    getDeliveryAccessToken,
    useDeliveryAccess,
    useDeliveryPhotosQuery,
    useDeliveryQuery,
} from '../hooks/useDelivery';
import type { PublicPhoto } from '../types/photo.types';

export function DeliveryPage() {
    const { slug } = useParams({ from: '/d/$slug' });
    const { t } = useTranslation('delivery');
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<PublicPhoto | null>(null);

    // Password protection
    const {
        verifyPassword,
        isPending: isVerifying,
        error: verifyError,
    } = useDeliveryAccess(slug);

    // Data fetching
    const {
        data: delivery,
        isLoading: deliveryLoading,
        isError,
        error,
        refetch,
    } = useDeliveryQuery(slug);

    const { data: photos, isLoading: photosLoading } = useDeliveryPhotosQuery(
        slug,
        { enabled: !!delivery && delivery.photoCount > 0 }
    );

    // Check if password is required (401 error)
    const isPasswordRequired =
        isError && (error as Error & { status?: number })?.status === 401;

    // Handle password submit
    const handlePasswordSubmit = (password: string) => {
        verifyPassword(password, {
            onSuccess: () => {
                refetch();
            },
        });
    };

    // Handle download
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const token = getDeliveryAccessToken(slug);
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${API_BASE_URL}/public/delivery/${slug}/download`,
                { headers }
            );

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download =
                response.headers
                    .get('content-disposition')
                    ?.split('filename=')[1]
                    ?.replace(/"/g, '') ||
                `${delivery?.catalogueTitle}_delivery.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    // Lightbox navigation
    const handlePhotoClick = (photo: PublicPhoto) => {
        setSelectedPhoto(photo);
    };

    const handleLightboxClose = () => {
        setSelectedPhoto(null);
    };

    const handleLightboxNext = () => {
        if (!photos || !selectedPhoto) return;
        const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
        if (currentIndex < photos.length - 1) {
            setSelectedPhoto(photos[currentIndex + 1]);
        }
    };

    const handleLightboxPrevious = () => {
        if (!photos || !selectedPhoto) return;
        const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
        if (currentIndex > 0) {
            setSelectedPhoto(photos[currentIndex - 1]);
        }
    };

    // Loading state
    if (deliveryLoading) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-stone-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />
                <div className="relative flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-stone-700"></div>
                    <p className="text-sm font-light text-stone-500">{t('loading')}</p>
                </div>
            </div>
        );
    }

    // Password required
    if (isPasswordRequired) {
        return (
            <PasswordPrompt
                onSubmit={handlePasswordSubmit}
                isPending={isVerifying}
                error={verifyError as Error | null}
            />
        );
    }

    // Error state
    if (isError && !isPasswordRequired) {
        return (
            <div className="relative flex min-h-screen items-center justify-center bg-stone-50 p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />
                <div className="relative text-center">
                    <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 shadow-sm">
                        <Package className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-light tracking-tight text-stone-800">
                        {t('notFound')}
                    </h1>
                    <p className="mt-3 text-sm font-light text-stone-500">
                        {t('notFoundDescription')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-stone-50">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />

            {/* Header */}
            <div className="relative border-b border-black/5 bg-white">
                <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
                    <p className="mb-3 text-xs uppercase tracking-[0.4em] text-stone-400">
                        {t('deliveryLabel')}
                    </p>
                    <h1 className="text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                        {delivery?.catalogueTitle}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_35px_80px_-70px_rgba(0,0,0,0.85)]">
                    {/* Recipient Info */}
                    <div className="border-b border-stone-100 px-8 py-7">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                <Mail className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                    {t('preparedFor')}
                                </p>
                                <p className="mt-1 text-lg font-medium tracking-wide text-stone-800">
                                    {String(delivery?.clientEmail || '') ||
                                        t('noRecipient')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Photo Count */}
                    <div className="border-b border-stone-100 px-8 py-7">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                <Image className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                                    {t('photosIncluded')}
                                </p>
                                <p className="mt-1 text-lg font-medium tracking-wide text-stone-800">
                                    {deliveryLoading ? (
                                        <span className="text-stone-300">...</span>
                                    ) : (
                                        t('photoCount', {
                                            count: delivery?.photoCount || 0,
                                        })
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Download Section */}
                    <div className="px-8 py-8">
                        <Button
                            onClick={handleDownload}
                            disabled={
                                isDownloading || delivery?.photoCount === 0
                            }
                            size="lg"
                            className="w-full bg-stone-800 py-6 text-base tracking-[0.15em] transition-all duration-500 hover:-translate-y-[1px] hover:bg-stone-900 hover:shadow-lg"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    {t('downloading')}
                                </>
                            ) : (
                                <>
                                    <Download className="mr-3 h-5 w-5" />
                                    {t('downloadAll')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Photo Preview Section */}
                {delivery && delivery.photoCount > 0 && (
                    <div className="mt-16">
                        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('preview')}
                        </p>
                        <DeliveryPhotoGrid
                            photos={photos || []}
                            isLoading={photosLoading}
                            onPhotoClick={handlePhotoClick}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="relative border-t border-black/5 bg-white py-8 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                    {t('footer')}
                </p>
            </div>

            {/* Lightbox */}
            {selectedPhoto && photos && (
                <DeliveryLightbox
                    photo={selectedPhoto}
                    photos={photos}
                    deliverySlug={slug}
                    onClose={handleLightboxClose}
                    onNext={handleLightboxNext}
                    onPrevious={handleLightboxPrevious}
                    getAccessToken={() => getDeliveryAccessToken(slug)}
                />
            )}
        </div>
    );
}
