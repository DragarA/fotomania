import { Calendar, Heart, Mail, Package, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { API_BASE_URL } from '@/lib/api-client';

import type { ClientFavouriteSession } from '../../hooks';
import {
    useCreateDeliveryCollectionMutation,
    useSessionFavouritesQuery,
} from '../../hooks';

interface FavouritesModalProps {
    session: ClientFavouriteSession | null;
    catalogueId: string;
    isOpen: boolean;
    onClose: () => void;
    onDeliveryCreated?: () => void;
}

export function FavouritesModal({
    session,
    catalogueId,
    isOpen,
    onClose,
    onDeliveryCreated,
}: FavouritesModalProps) {
    const { t } = useTranslation('gallery');
    const { data: sessionData, isLoading } = useSessionFavouritesQuery(
        catalogueId,
        session?.sessionId || '',
        isOpen && Boolean(session)
    );

    const createDeliveryMutation = useCreateDeliveryCollectionMutation();

    useBodyScrollLock(isOpen && Boolean(session));

    const handleCreateDelivery = () => {
        if (!session) return;

        createDeliveryMutation.mutate(
            { sessionId: session.sessionId },
            {
                onSuccess: () => {
                    onClose();
                    onDeliveryCreated?.();
                },
            }
        );
    };

    if (!isOpen || !session) return null;

    if (typeof document === 'undefined') return null;

    const photos = sessionData?.photos || [];

    const formattedDate = new Date(session.createdAt).toLocaleString(
        t('favouritesModal.locale'),
        {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        }
    );

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5">
                    <h2 className="text-xl font-light tracking-wide text-stone-800">
                        {t('favouritesModal.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 transition-colors hover:text-stone-600"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-stone-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-stone-400">
                                <Mail className="h-4 w-4" strokeWidth={1.5} />
                                <span className="text-[0.65rem] uppercase tracking-[0.2em]">
                                    {t('favouritesModal.emailLabel')}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-stone-800">
                                {session.email}
                            </p>
                        </div>

                        <div className="rounded-lg bg-stone-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-stone-400">
                                <Calendar className="h-4 w-4" strokeWidth={1.5} />
                                <span className="text-[0.65rem] uppercase tracking-[0.2em]">
                                    {t('favouritesModal.submittedLabel')}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-stone-800">
                                {formattedDate}
                            </p>
                        </div>
                    </div>

                    {/* Photo Count */}
                    <div className="mt-6 flex items-center gap-2 text-stone-700">
                        <Heart className="h-5 w-5" strokeWidth={1.5} />
                        <span className="text-base">
                            {t('favouritesModal.favouritePhotos', { count: session.photoCount })}
                        </span>
                    </div>

                    {/* Photo List */}
                    <div className="mt-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border border-stone-200 border-t-stone-600"></div>
                            </div>
                        ) : photos.length === 0 ? (
                            <div className="py-8 text-center text-stone-500">
                                {t('favouritesModal.noPhotosFound')}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {photos.map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        className="flex items-center gap-3 rounded-lg bg-stone-50 p-3"
                                    >
                                        {/* Thumbnail */}
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-stone-200">
                                            <img
                                                src={`${API_BASE_URL}/uploads/${photo.thumbnailPath || photo.storagePath}`}
                                                alt={photo.originalFileName}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Photo Info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-stone-800">
                                                {photo.originalFileName}
                                            </p>
                                            <p className="mt-0.5 text-xs text-stone-500">
                                                {photo.width && photo.height && (
                                                    <span>{photo.width} × {photo.height}</span>
                                                )}
                                                {photo.size && (
                                                    <span>
                                                        {photo.width && photo.height && ' · '}
                                                        {(photo.size / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Number Badge */}
                                        <span className="shrink-0 text-sm text-stone-400">
                                            #{index + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="space-y-3 px-6 pb-6">
                    <Button
                        onClick={handleCreateDelivery}
                        className="w-full"
                        size="lg"
                        disabled={createDeliveryMutation.isPending}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        {createDeliveryMutation.isPending
                            ? t('favouritesModal.creatingDelivery')
                            : t('favouritesModal.createDeliveryCollection')}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        {t('favouritesModal.close')}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
