import { Link } from '@tanstack/react-router';
import { Image as PhotoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '@/lib/api-client';

import type { Catalogue } from '../../types';

interface CatalogueCardProps {
    catalogue: Catalogue;
}

export function CatalogueCard({ catalogue }: CatalogueCardProps) {
    const { t } = useTranslation('gallery');

    return (
        <Link
            to="/catalogues/$catalogueId"
            params={{ catalogueId: catalogue.id }}
            className="group block overflow-hidden rounded border border-white/20 bg-white/80 shadow-[0_60px_120px_-90px_rgba(0,0,0,0.85)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_90px_140px_-110px_rgba(0,0,0,0.95)]"
        >
            {/* Cover Image - Large and Prominent */}
            <div className="relative h-72 overflow-hidden bg-stone-100">
                {catalogue.coverImage ? (
                    <img
                        src={`${API_BASE_URL}/uploads/${catalogue.coverImage}`}
                        alt={catalogue.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-300">
                        <PhotoIcon className="h-16 w-16" strokeWidth={1.5} />
                    </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </div>

            {/* Content Section */}
            <div className="space-y-4 px-8 py-6">
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-stone-500">
                    {new Date(catalogue.createdAt).toLocaleDateString()}
                </p>
                <h2 className="text-2xl font-light tracking-[0.02em] text-stone-800 transition-colors duration-500 group-hover:text-stone-600">
                    {catalogue.title}
                </h2>

                <p className="line-clamp-2 text-stone-500">
                    {catalogue.description || t('catalogues.noDescription')}
                </p>

                <div className="flex items-center text-xs uppercase tracking-[0.4em] text-stone-400">
                    <PhotoIcon
                        className="mr-2 h-4 w-4 text-stone-400"
                        strokeWidth={1.5}
                    />
                    {catalogue.photoCount || 0}{' '}
                    {t('catalogues.photos', {
                        count: catalogue.photoCount || 0,
                    })}
                </div>
            </div>
        </Link>
    );
}
