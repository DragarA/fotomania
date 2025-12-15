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
            className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-accent-300 hover:shadow-lg"
        >
            {/* Cover Image - Large and Prominent */}
            <div className="relative h-72 overflow-hidden bg-gray-100">
                {catalogue.coverImage ? (
                    <img
                        src={`${API_BASE_URL}/uploads/${catalogue.coverImage}`}
                        alt={catalogue.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <PhotoIcon className="h-16 w-16" strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5">
                <h2 className="mb-2 text-xl font-semibold text-gray-900 transition-colors group-hover:text-accent-600">
                    {catalogue.title}
                </h2>

                <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {catalogue.description || t('catalogues.noDescription')}
                </p>

                <div className="flex items-center text-sm text-gray-500">
                    <PhotoIcon className="mr-1.5 h-4 w-4" strokeWidth={2} />
                    {catalogue.photoCount || 0} {t('catalogues.photos')}
                </div>
            </div>
        </Link>
    );
}
